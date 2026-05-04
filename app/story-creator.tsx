"use client";

import { useRef, useState } from "react";

const storyTypes = [
  { value: "bedtime", label: "Cozy bedtime", icon: "🌙" },
  { value: "adventure", label: "Brave adventure", icon: "🧭" },
  { value: "kindness", label: "Kindness & friendship", icon: "🤝" },
  { value: "learning", label: "Learning quest", icon: "🔎" },
  { value: "silly", label: "Silly giggles", icon: "🫧" }
];

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
    setMessage("Recording… read a warm sentence for 10–20 seconds, like: ‘Once upon a time, the stars tucked themselves into bed.’");
  }

  function stopRecording() {
    recorder.current?.stop();
    setMessage("Voice sample captured. We’ll use it to create a story narrator.");
  }

  async function createStory() {
    setBusy(true);
    setMessage("Creating the story, painting the pages, and recording narration. Real magic takes a minute…");
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

  return <div className="creator-card card">
    <div className="creator-header">
      <span className="sparkle-dot">✦</span>
      <div>
        <h2>{email ? "Build tonight’s book" : "Start your first book"}</h2>
        <p>{email ? "Three choices, then we generate the keepsake." : "Log in to save and share your generated storybooks."}</p>
      </div>
    </div>

    {!email ? <div className="form">
      <label className="field">Your email
        <input className="input" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" />
      </label>
      <button className="btn" disabled={busy || !loginEmail} onClick={login}>Continue to story builder →</button>
      <p className="helper-text">Prototype login for now. Production should use Clerk, Auth.js, or Supabase Auth.</p>
    </div> : <div className="form">
      <label className="field">Who is this story for?
        <input className="input big-input" value={kidName} onChange={e => setKidName(e.target.value)} placeholder="Amina" />
      </label>

      <div className="field">Pick the story mood
        <div className="choice-grid">
          {storyTypes.map(type => <button
            key={type.value}
            type="button"
            className={`choice-card ${storyType === type.value ? "selected" : ""}`}
            onClick={() => setStoryType(type.value)}
          >
            <span>{type.icon}</span>
            {type.label}
          </button>)}
        </div>
      </div>

      <div className="field">Narrator voice
        <div className="voice-toggle">
          <button type="button" className={voiceMode === "default" ? "selected" : ""} onClick={() => setVoiceMode("default")}>Default voice</button>
          <button type="button" className={voiceMode === "clone" ? "selected" : ""} onClick={() => setVoiceMode("clone")}>Record mine</button>
        </div>
      </div>

      {voiceMode === "clone" && <div className="recording-panel">
        <p>Record a quick, clear sample. The warmer and quieter the room, the better the narrator.</p>
        <div className="record-actions">
          <button className="btn secondary" type="button" onClick={startRecording}>● Record</button>
          <button className="btn secondary" type="button" onClick={stopRecording}>Stop & use sample</button>
        </div>
        {voiceSample && <audio controls src={voiceSample} />}
      </div>}

      {message && <div className="notice">{busy && <span className="spinner" />} {message}</div>}
      <button className="btn generate-btn" disabled={busy || !kidName || (voiceMode === "clone" && !voiceSample)} onClick={createStory}>
        {busy ? "Creating your book…" : "Generate storybook ✨"}
      </button>
    </div>}
  </div>;
}
