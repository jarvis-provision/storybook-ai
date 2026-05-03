"use client";
import { useMemo, useState } from "react";
import { Story } from "@/lib/types";

export default function Reader({ story, shareUrl }: { story: Story; shareUrl: string }) {
  const pages = useMemo(() => [{ pageNumber: 0, text: story.dedication, imageUrl: story.coverImageUrl, audioUrl: story.coverAudioUrl, imagePrompt: story.coverPrompt }, ...story.pages], [story]);
  const [idx, setIdx] = useState(0);
  const page = pages[idx];
  return <main className="container reader">
    <div className="card">
      <span className="badge">{story.status === "ready" ? "📖 Ready" : story.status}</span>
      <h2>{story.title}</h2>
      {story.error && <div className="notice">{story.error}</div>}
      {page.imageUrl && <img className="reader-img" src={page.imageUrl} alt={`Page ${idx}`} />}
      <p style={{ fontSize: 22, color: "#344054" }}>{page.text}</p>
      {page.audioUrl && <audio style={{ width: "100%" }} src={page.audioUrl} controls autoPlay />}
      <div className="controls">
        <button className="btn secondary" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>← Previous</button>
        <strong>{idx + 1} / {pages.length}</strong>
        <button className="btn secondary" disabled={idx === pages.length - 1} onClick={() => setIdx(i => i + 1)}>Next →</button>
      </div>
      <div className="controls">
        <input className="input" readOnly value={shareUrl} onFocus={e => e.currentTarget.select()} />
        <button className="btn" onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy share link</button>
      </div>
    </div>
  </main>;
}
