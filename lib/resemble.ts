import fs from "fs/promises";
import path from "path";

const baseUrl = "https://app.resemble.ai/api/v2";

async function resemble(pathname: string, init: RequestInit = {}) {
  if (!process.env.RESEMBLE_API_KEY) throw new Error("Missing RESEMBLE_API_KEY");
  const res = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Token token=${process.env.RESEMBLE_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });
  if (!res.ok) throw new Error(`Resemble API ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function cloneVoiceFromDataUrl(dataUrl: string, name: string) {
  // Resemble voice-clone account features vary by plan. This wrapper is isolated so
  // you can adjust the exact endpoint once your account/clone workflow is confirmed.
  if (!process.env.RESEMBLE_API_KEY) return process.env.RESEMBLE_DEFAULT_VOICE_UUID || "mock-voice";
  const body = { name, consent: true, audio_data_uri: dataUrl };
  const json = await resemble("/voices", { method: "POST", body: JSON.stringify(body) });
  return json?.item?.uuid || json?.voice?.uuid || json?.uuid;
}

export async function createVoiceOver(text: string, voiceUuid: string, storyId: string, name: string) {
  const outDir = path.join(process.cwd(), "public", "generated", storyId);
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${name}.mp3`);
  const publicUrl = `/generated/${storyId}/${name}.mp3`;

  if (!process.env.RESEMBLE_API_KEY || !process.env.RESEMBLE_PROJECT_UUID || voiceUuid === "mock-voice") {
    return undefined;
  }

  const clip = await resemble(`/projects/${process.env.RESEMBLE_PROJECT_UUID}/clips`, {
    method: "POST",
    body: JSON.stringify({ voice_uuid: voiceUuid, body: text, title: `${storyId}-${name}`, output_format: "mp3" })
  });
  const clipUuid = clip?.item?.uuid || clip?.clip?.uuid || clip?.uuid;
  if (!clipUuid) throw new Error("Resemble did not return a clip uuid");

  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 1500));
    const status = await resemble(`/projects/${process.env.RESEMBLE_PROJECT_UUID}/clips/${clipUuid}`);
    const item = status.item || status.clip || status;
    const audioUrl = item.audio_src || item.audio_url || item.url;
    if (audioUrl) {
      const audio = await fetch(audioUrl);
      if (!audio.ok) throw new Error(`Failed to download Resemble audio: ${audio.status}`);
      await fs.writeFile(outPath, Buffer.from(await audio.arrayBuffer()));
      return publicUrl;
    }
  }
  throw new Error("Timed out waiting for Resemble voiceover");
}
