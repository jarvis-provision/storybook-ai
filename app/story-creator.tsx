"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { FormEvent, useRef, useState } from "react";

const storyTypes = [
  { value: "bedtime", label: "Bedtime", detail: "Calm and cozy" },
  { value: "adventure", label: "Adventure", detail: "Brave and curious" },
  { value: "kindness", label: "Kindness", detail: "Warm and thoughtful" },
  { value: "learning", label: "Learning", detail: "Curious and educational" },
  { value: "silly", label: "Silly", detail: "Playful and funny" }
];

export default function StoryCreator({ email }: { email: string | null }) {
  const [kidName, setKidName] = useState("");
  const [storyType, setStoryType] = useState("bedtime");
  const [voiceMode, setVoiceMode] = useState<"default" | "clone">("default");
  const [voiceSample, setVoiceSample] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

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
    setMessage("Recording… please read the sample sentence shown below clearly once or twice.");
  }

  function stopRecording() {
    recorder.current?.stop();
    setMessage("Voice sample captured. We’ll use it to create a story narrator.");
  }

  async function createStory(event?: FormEvent) {
    event?.preventDefault();
    if (busy || !kidName || (voiceMode === "clone" && !voiceSample)) return;
    setBusy(true);
    setMessage("Creating the story, illustrations, and narration. This can take a few minutes…");
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
      <span className="sparkle-dot">SP</span>
      <div>
        <h2>{email ? "Create a book" : "Create your account"}</h2>
        <p>{email ? "Choose the child, mood, and narrator." : "Sign up or sign in with Clerk to save books and create share links."}</p>
      </div>
      {email && <div className="user-menu"><UserButton /></div>}
    </div>

    {!email ? <div className="form">
      <div className="auth-actions">
        <SignUpButton mode="modal">
          <button className="btn" type="button">Create account</button>
        </SignUpButton>
        <SignInButton mode="modal">
          <button className="btn secondary" type="button">Sign in</button>
        </SignInButton>
      </div>
      <p className="helper-text">Clerk handles email/password auth, verification, sessions, and user management. No prototype password storage anymore.</p>
    </div> : <form className="form" onSubmit={createStory}>
      <label className="field">Child’s name
        <input className="input big-input" value={kidName} onChange={e => setKidName(e.target.value)} placeholder="Amina" required />
      </label>

      <div className="field">Story mood
        <div className="choice-grid">
          {storyTypes.map(type => <button
            key={type.value}
            type="button"
            className={`choice-card ${storyType === type.value ? "selected" : ""}`}
            onClick={() => setStoryType(type.value)}
          >
            <strong>{type.label}</strong>
            <small>{type.detail}</small>
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
        <blockquote className="sample-script">“This is my storytelling voice. I read gently, clearly, and warmly for a children&apos;s bedtime story.”</blockquote>
        <div className="record-actions">
          <button className="btn secondary" type="button" onClick={startRecording}>Start recording</button>
          <button className="btn secondary" type="button" onClick={stopRecording}>Use sample</button>
        </div>
        {voiceSample && <audio controls src={voiceSample} />}
      </div>}

      {message && <div className="notice">{busy && <span className="spinner" />} {message}</div>}
      <button className="btn generate-btn" type="submit" disabled={busy || (voiceMode === "clone" && !voiceSample)}>
        {busy ? "Creating your book…" : "Generate book"}
      </button>
    </form>}
  </div>;
}
