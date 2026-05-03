import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { StoryType } from "./types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "missing" });
const textModel = process.env.OPENAI_TEXT_MODEL || "gpt-5.5";
const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";

export async function generateStoryText(kidName: string, storyType: StoryType) {
  if (!process.env.OPENAI_API_KEY) return mockStory(kidName, storyType);

  const prompt = `Create a personalized children's picture book for a child named ${kidName}.
Story type: ${storyType}.
Return ONLY valid JSON with: title, dedication, coverPrompt, pages[6] where each page has text and imagePrompt.
Guidelines: age 3-7, warm, gentle, vivid, no scary danger, 1-2 sentences per page. Image prompts should describe a consistent whimsical watercolor style and recurring character details.`;

  const response = await client.responses.create({
    model: textModel,
    input: prompt,
    text: { format: { type: "json_object" } }
  });
  return JSON.parse(response.output_text);
}

export async function generateImage(prompt: string, storyId: string, name: string) {
  const outDir = path.join(process.cwd(), "public", "generated", storyId);
  await fs.mkdir(outDir, { recursive: true });
  const isMock = !process.env.OPENAI_API_KEY;
  const ext = isMock ? "svg" : "png";
  const outPath = path.join(outDir, `${name}.${ext}`);
  const publicUrl = `/generated/${storyId}/${name}.${ext}`;

  if (isMock) {
    await fs.writeFile(outPath, placeholderSvg(prompt));
    return publicUrl;
  }

  const image = await client.images.generate({ model: imageModel, prompt, size: "1024x1024" });
  const b64 = image.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI image response did not include b64_json");
  await fs.writeFile(outPath, Buffer.from(b64, "base64"));
  return publicUrl;
}

function mockStory(kidName: string, storyType: StoryType) {
  return {
    title: `${kidName} and the Moonbeam Map`,
    dedication: `A ${storyType} story made just for ${kidName}.`,
    coverPrompt: `Whimsical watercolor book cover, ${kidName} holding a glowing moonbeam map, cozy magical forest, soft bedtime colors, children's book art`,
    pages: Array.from({ length: 6 }, (_, i) => ({
      text: [
        `${kidName} found a tiny silver map tucked under a pillow, humming like a friendly bee.`,
        `The map led to a lantern fox who wore spectacles and knew the names of every star.`,
        `Together they crossed a marshmallow bridge, stepping softly so the sleepy clouds would not wobble.`,
        `When a little comet lost its sparkle, ${kidName} shared a brave idea and a pocketful of giggles.`,
        `The comet glowed again, brighter than birthday candles, and drew a heart across the sky.`,
        `${kidName} came home with moon-dust on their sleeves and a dream ready for tomorrow.`
      ][i],
      imagePrompt: `Whimsical watercolor children's book illustration, page ${i + 1}, ${kidName} in cozy pajamas on a ${storyType} adventure, soft magical lighting, gentle expressive characters, square composition`
    }))
  };
}

function placeholderSvg(prompt: string) {
  const color = "#" + crypto.createHash("md5").update(prompt).digest("hex").slice(0, 6);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="${color}"/><circle cx="760" cy="220" r="150" fill="#fff8"/><text x="80" y="500" font-size="46" font-family="Arial" fill="white">Image placeholder</text><text x="80" y="570" font-size="28" font-family="Arial" fill="white">Add OPENAI_API_KEY for gpt-image-2</text></svg>`;
  return Buffer.from(svg);
}
