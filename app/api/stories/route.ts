import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { getSessionEmail } from "@/lib/auth";
import { generateImage, generateStoryText } from "@/lib/openai";
import { cloneVoiceFromDataUrl, createVoiceOver } from "@/lib/resemble";
import { saveStory } from "@/lib/store";
import { Story } from "@/lib/types";

const schema = z.object({
  kidName: z.string().min(1).max(80),
  storyType: z.enum(["bedtime", "adventure", "kindness", "learning", "silly"]),
  voiceMode: z.enum(["default", "clone"]),
  voiceSampleDataUrl: z.string().optional()
});

export async function POST(req: Request) {
  const ownerEmail = await getSessionEmail();
  if (!ownerEmail) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const body = schema.parse(await req.json());
  const id = crypto.randomUUID();
  const shareSlug = crypto.randomBytes(8).toString("hex");
  let story: Story = {
    id,
    shareSlug,
    ownerEmail,
    kidName: body.kidName,
    storyType: body.storyType,
    title: "Generating…",
    dedication: "",
    coverPrompt: "",
    pages: [],
    status: "generating",
    voiceMode: body.voiceMode,
    createdAt: new Date().toISOString()
  };
  await saveStory(story);

  try {
    const generated = await generateStoryText(body.kidName, body.storyType);
    const voiceUuid = body.voiceMode === "clone" && body.voiceSampleDataUrl
      ? await cloneVoiceFromDataUrl(body.voiceSampleDataUrl, `${body.kidName} story narrator`)
      : process.env.RESEMBLE_DEFAULT_VOICE_UUID;

    const maxPages = Number(process.env.MAX_STORY_PAGES || generated.pages.length);
    const pagesToGenerate = generated.pages.slice(0, Math.max(1, maxPages));

    story = { ...story, ...generated, pages: [], voiceUuid };
    story.coverImageUrl = await generateImage(generated.coverPrompt, id, "cover");
    story.coverAudioUrl = voiceUuid ? await createVoiceOver(`${generated.title}. ${generated.dedication}`, voiceUuid, id, "cover") : undefined;

    story.pages = [];
    for (let i = 0; i < pagesToGenerate.length; i++) {
      const page = pagesToGenerate[i];
      const imageUrl = await generateImage(page.imagePrompt, id, `page-${i + 1}`);
      const audioUrl = voiceUuid ? await createVoiceOver(page.text, voiceUuid, id, `page-${i + 1}`) : undefined;
      story.pages.push({ pageNumber: i + 1, text: page.text, imagePrompt: page.imagePrompt, imageUrl, audioUrl });
      await saveStory(story);
    }

    story.status = "ready";
    await saveStory(story);
    return NextResponse.json({ storyId: id, shareSlug });
  } catch (error) {
    story.status = "failed";
    story.error = error instanceof Error ? error.message : "Unknown error";
    await saveStory(story);
    return NextResponse.json({ error: story.error, storyId: id }, { status: 500 });
  }
}
