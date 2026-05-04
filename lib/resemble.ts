import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const apiBase = "https://app.resemble.ai/api/v2";
const synthBase = "https://f.cluster.resemble.ai";
const cloneTranscript = "This is my storytelling voice. I read gently, clearly, and warmly for a children's bedtime story.";

function authHeaders(json = true) {
  return {
    Authorization: `Bearer ${process.env.RESEMBLE_API_KEY}`,
    ...(json ? { "Content-Type": "application/json" } : {})
  };
}

async function resembleApi(pathname: string, init: RequestInit = {}) {
  if (!process.env.RESEMBLE_API_KEY) throw new Error("Missing RESEMBLE_API_KEY");
  const res = await fetch(`${apiBase}${pathname}`, {
    ...init,
    headers: { ...authHeaders(true), ...(init.headers || {}) }
  });
  if (!res.ok) throw new Error(`Resemble API ${res.status}: ${await res.text()}`);
  return res.json();
}

function decodeDataUrl(dataUrl: string) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Voice sample must be a base64 data URL");
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
}

export async function cloneVoiceFromDataUrl(dataUrl: string, name: string) {
  if (!process.env.RESEMBLE_API_KEY) return process.env.RESEMBLE_DEFAULT_VOICE_UUID || "mock-voice";

  const voice = await resembleApi("/voices", {
    method: "POST",
    body: JSON.stringify({
      name: `${name} ${new Date().toISOString()}`.slice(0, 250),
      language: "en-US",
      voice_type: "rapid",
      description: "Temporary storybook narrator clone created from browser recording."
    })
  });
  const voiceUuid = voice?.item?.uuid || voice?.voice?.uuid || voice?.uuid;
  if (!voiceUuid) throw new Error("Resemble did not return a voice uuid");

  const { mime, buffer } = decodeDataUrl(dataUrl);
  const ext = mime.includes("webm") ? "webm" : mime.includes("wav") ? "wav" : mime.includes("mpeg") || mime.includes("mp3") ? "mp3" : "audio";
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mime }), `voice-sample.${ext}`);
  form.append("name", `storybook_sample_${crypto.randomBytes(4).toString("hex")}`);
  form.append("text", cloneTranscript);
  form.append("emotion", "neutral");
  form.append("is_active", "true");

  const upload = await fetch(`${apiBase}/voices/${voiceUuid}/recordings`, {
    method: "POST",
    headers: authHeaders(false),
    body: form
  });
  if (!upload.ok) throw new Error(`Resemble recording upload ${upload.status}: ${await upload.text()}`);

  const build = await fetch(`${apiBase}/voices/${voiceUuid}/build`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ fill: false })
  });
  if (!build.ok) throw new Error(`Resemble voice build ${build.status}: ${await build.text()}`);

  return voiceUuid;
}

export async function createVoiceOver(text: string, voiceUuid: string, storyId: string, name: string) {
  const outDir = path.join(process.cwd(), "public", "generated", storyId);
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${name}.mp3`);
  const publicUrl = `/generated/${storyId}/${name}.mp3`;

  if (!process.env.RESEMBLE_API_KEY || voiceUuid === "mock-voice") return undefined;

  const res = await fetch(`${synthBase}/synthesize`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({
      voice_uuid: voiceUuid,
      data: text.slice(0, 2000),
      output_format: "mp3",
      sample_rate: 44100,
      title: `${storyId}-${name}`
    })
  });
  if (!res.ok) throw new Error(`Resemble synth ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (!json.audio_content) throw new Error("Resemble synth response missing audio_content");
  await fs.writeFile(outPath, Buffer.from(json.audio_content, "base64"));
  return publicUrl;
}
