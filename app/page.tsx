import { getSessionEmail } from "@/lib/auth";
import { listStoriesFor } from "@/lib/store";
import StoryCreator from "./story-creator";
import Link from "next/link";

const examplePages = [
  {
    label: "Page 1",
    title: "A personal opening",
    text: "Mina discovers a small map with her name written in starlight."
  },
  {
    label: "Page 2",
    title: "A consistent visual world",
    text: "Each page keeps the same soft illustration style, characters, and mood."
  },
  {
    label: "Page 3",
    title: "Narration families can replay",
    text: "Use the default narrator or create a custom voice from a short recording."
  }
];

const steps = [
  ["01", "Name the hero", "Add your child’s name and choose the tone of the story."],
  ["02", "Pick a voice", "Use the included narrator or record a short sample for a custom voice."],
  ["03", "Generate the book", "Story, illustrations, and narration are created page by page."],
  ["04", "Share privately", "Send a unique link to family so they can read along too."],
];

export default async function Home() {
  const email = await getSessionEmail();
  const stories = email ? await listStoriesFor(email) : [];

  return <main>
    <section className="container hero-shell">
      <header className="topbar">
        <div className="brand-mark">SP</div>
        <div>
          <strong>StoryPanda</strong>
          <span>Personalized narrated storybooks</span>
        </div>
      </header>

      <div className="hero">
        <div className="hero-copy">
          <span className="badge">Private, personalized, made in minutes</span>
          <h1>Beautiful children’s books generated around your child.</h1>
          <p className="lead">StoryPanda turns a child’s name, story mood, and optional voice sample into a polished read‑along picture book with original artwork, narration, and a shareable family link.</p>
          <div className="hero-actions">
            <a className="btn" href="#create">Start creating</a>
            <a className="btn secondary" href="#example">View sample book</a>
          </div>
          <div className="trust-row" aria-label="Pipeline features">
            <span>GPT story</span>
            <span>Original artwork</span>
            <span>Voice narration</span>
            <span>Private share link</span>
          </div>
        </div>

        <div id="create" className="creator-wrap">
          <StoryCreator email={email} />
        </div>
      </div>
    </section>

    <section id="example" className="container section-grid">
      <div className="section-copy">
        <span className="eyebrow">Sample output</span>
        <h2>A complete little book, not just a prompt result.</h2>
        <p>The product should feel like a keepsake: a clear story arc, consistent illustration direction, audio for every page, and a simple link that relatives can open on any device.</p>
      </div>
      <div className="storybook-preview" aria-label="Example story preview">
        <div className="book-cover">
          <div className="cover-kicker">Sample book</div>
          <h3>Mina and the Lantern Map</h3>
          <p>Soft cinematic illustrations · warm narrated audio · shareable read‑along pages</p>
        </div>
        <div className="mini-pages">
          {examplePages.map(page => <article key={page.title} className="mini-page">
            <span>{page.label}</span>
            <strong>{page.title}</strong>
            <p>{page.text}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="container steps-section">
      <span className="eyebrow">Workflow</span>
      <h2>Designed for a fast, parent-friendly creation flow.</h2>
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
          <span className="eyebrow">Library</span>
          <h2>Your StoryPanda books</h2>
        </div>
        <a className="btn secondary" href="#create">Create another</a>
      </div>
      <div className="story-grid">
        {stories.map(story => <Link className="card page-card" key={story.id} href={`/story/${story.id}`} style={{ textDecoration: "none" }}>
          {story.coverImageUrl ? <img src={story.coverImageUrl} alt={`${story.title} cover`} /> : <div className="empty-cover">SP</div>}
          <h3>{story.title}</h3>
          <p>{story.status} · made for {story.kidName}</p>
        </Link>)}
      </div>
    </section>}
  </main>;
}
