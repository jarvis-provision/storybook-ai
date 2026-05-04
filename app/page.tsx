import { getSessionEmail } from "@/lib/auth";
import { listStoriesFor } from "@/lib/store";
import StoryCreator from "./story-creator";
import Link from "next/link";

const examplePages = [
  {
    title: "1. A name becomes magic",
    text: "Mina finds her name stitched in starlight on a tiny map beneath her pillow.",
    emoji: "🗺️"
  },
  {
    title: "2. Pictures arrive page by page",
    text: "A lantern fox, a marshmallow bridge, and sleepy cloud castles appear in cozy watercolor scenes.",
    emoji: "🦊"
  },
  {
    title: "3. Someone reads it aloud",
    text: "Use a warm default narrator or record a quick sample so the story sounds familiar.",
    emoji: "🎙️"
  }
];

const steps = [
  ["01", "Tell us who the hero is", "Start with your child’s name and the kind of story they need tonight — brave, sleepy, silly, or kind."],
  ["02", "Choose the storyteller voice", "Keep the default Resemble voice or record a short sample to create a personal narrator."],
  ["03", "Watch the book come alive", "GPT writes the tale, image generation paints every page, and narration turns it into a read-along book."],
  ["04", "Share the magic", "Send a private story link to grandparents, cousins, or anyone who should join bedtime."],
];

export default async function Home() {
  const email = await getSessionEmail();
  const stories = email ? await listStoriesFor(email) : [];

  return <main>
    <section className="container hero-shell">
      <div className="nav-pill">
        <strong>StoryPanda</strong>
        <span>AI picture books for little heroes</span>
      </div>

      <div className="hero">
        <div className="hero-copy">
          <span className="badge">✨ Made for one child, not the whole internet</span>
          <h1>A bedtime story where your kid is the main character.</h1>
          <p className="lead">Create a narrated children’s picture book in minutes: a custom story, page-by-page artwork, and a voiceover your family can listen to together.</p>
          <div className="hero-actions">
            <a className="btn" href="#create">Create a StoryPanda book</a>
            <a className="btn secondary" href="#example">See an example</a>
          </div>
          <div className="trust-row" aria-label="Pipeline features">
            <span>GPT story</span>
            <span>AI artwork</span>
            <span>Resemble narration</span>
            <span>Share link</span>
          </div>
        </div>

        <div id="create" className="creator-wrap">
          <StoryCreator email={email} />
        </div>
      </div>
    </section>

    <section id="example" className="container section-grid">
      <div className="section-copy">
        <span className="eyebrow">Example story</span>
        <h2>“Mina and the Giggleberry Parade”</h2>
        <p>Before someone commits to generating, they should understand the promise: a sweet beginning, a gentle adventure, and a keepsake they can replay or share.</p>
      </div>
      <div className="storybook-preview" aria-label="Example story preview">
        <div className="book-cover">
          <div className="moon">🌙</div>
          <h3>Mina and the Giggleberry Parade</h3>
          <p>Illustrated in soft magical watercolors · narrated aloud</p>
        </div>
        <div className="mini-pages">
          {examplePages.map(page => <article key={page.title} className="mini-page">
            <span>{page.emoji}</span>
            <strong>{page.title}</strong>
            <p>{page.text}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="container steps-section">
      <span className="eyebrow">How it feels</span>
      <h2>From tiny idea to finished read‑along book.</h2>
      <div className="steps-grid">
        {steps.map(([num, title, body]) => <article className="step-card" key={num}>
          <span>{num}</span>
          <h3>{title}</h3>
          <p>{body}</p>
        </article>)}
      </div>
    </section>

    {email && stories.length > 0 && <section className="container library-section">
      <div className="section-heading-row">
        <div>
          <span className="eyebrow">Your library</span>
          <h2>StoryPanda books you’ve made</h2>
        </div>
        <a className="btn secondary" href="#create">Make another</a>
      </div>
      <div className="story-grid">
        {stories.map(story => <Link className="card page-card" key={story.id} href={`/story/${story.id}`} style={{ textDecoration: "none" }}>
          {story.coverImageUrl ? <img src={story.coverImageUrl} alt={`${story.title} cover`} /> : <div className="empty-cover">✨</div>}
          <h3>{story.title}</h3>
          <p>{story.status} · made for {story.kidName}</p>
        </Link>)}
      </div>
    </section>}
  </main>;
}
