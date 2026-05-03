"use client";

import { useRef, useState } from "react";

export default function StoryCreator({ email }: { email: string | null }) {
  const [loginEmail, setLoginEmail] = useState(email || "");
  const [kidName, setKidName] = useState("");
  const [storyType, setStoryType] = useState("bedtime");
  const [voiceMode, setVoiceMode] = useState<"default" | "clone">("default");
  const [voiceSample, setVoiceSample] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function login() {
    setBusy(true);
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail }) });
    location.reload();
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks.current = [];
    recorder.current = new MediaRecorder(stream);
    recorder.current.ondataavailable = e => chunks.current.push(e.data);
    recorder.current.onstop = async () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onload = () => setVoiceSample(reader.result as string);
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(t => t.stop());
    };
    recorder.current.start();
    setMessage("Recording… read a short playful sentence for 10–20 seconds.");
  }

  function stopRecording() {
    recorder.current?.stop();
    setMessage("Voice sample captured.");
  }

  async function createStory() {
    setBusy(true);
    setMessage("Creating story, art, and narration. This can take a few minutes with real APIs…");
    const res = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kidName, storyType, voiceMode, voiceSampleDataUrl: voiceSample })
    });
    const json = await res.json();
    if (!res.ok) {
      setBusy(false);
      setMessage(json.error || "Something went wrong.");
      if (json.storyId) location.href = `/story/${json.storyId}`;
      return;
    }
    location.href = `/story/${json.storyId}`;
  }

  return <div className="card">
    {!email ? <div className="form">
      <h2>Start your book</h2>
      <label className="field">Your email
        <input className="input" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" />
      </label>
      <button className="btn" disabled={busy || !loginEmail} onClick={login}>Log in / continue</button>
      <p>This demo uses a simple cookie login. Swap this for Clerk/Auth.js before production.</p>
    </div> : <div className="form">
      <h2>Create a story</h2>
      <label className="field">Kid’s name
        <input className="input" value={kidName} onChange={e => setKidName(e.target.value)} placeholder="Amina" />
      </label>
      <label className="field">Story type
        <select className="select" value={storyType} onChange={e => setStoryType(e.target.value)}>
          <option value="bedtime">Cozy bedtime</option>
          <option value="adventure">Brave adventure</option>
          <option value="kindness">Kindness & friendship</option>
          <option value="learning">Learning quest</option>
          <option value="silly">Silly giggles</option>
        </select>
      </label>
      <label className="field">Narrator voice
        <select className="select" value={voiceMode} onChange={e => setVoiceMode(e.target.value as "default" | "clone")}>
          <option value="default">Use default Resemble voice</option>
          <option value="clone">Clone from a quick recording</option>
        </select>
      </label>
      {voiceMode === "clone" && <div className="grid">
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn secondary" type="button" onClick={startRecording}>Record</button>
          <button className="btn secondary" type="button" onClick={stopRecording}>Stop</button>
        </div>
        {voiceSample && <audio controls src={voiceSample} />}
      </div>}
      {message && <div className="notice">{message}</div>}
      <button className="btn" disabled={busy || !kidName || (voiceMode === "clone" && !voiceSample)} onClick={createStory}>Generate storybook</button>
    </div>}
  </div>;
}
