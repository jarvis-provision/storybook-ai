import { getSessionEmail } from "@/lib/auth";
import { listStoriesFor } from "@/lib/store";
import StoryCreator from "./story-creator";
import Link from "next/link";

export default async function Home() {
  const email = await getSessionEmail();
  const stories = email ? await listStoriesFor(email) : [];
  return <main className="container">
    <section className="hero">
      <div>
        <span className="badge">✨ Personalized AI storybooks</span>
        <h1>Turn bedtime into a tiny moviebook.</h1>
        <p>Enter your kid’s name, choose a story style, optionally record your voice, and generate a narrated picture book with shareable pages.</p>
      </div>
      <StoryCreator email={email} />
    </section>

    {email && stories.length > 0 && <section className="card" style={{ marginTop: 24 }}>
      <h2>Your storybooks</h2>
      <div className="story-grid">
        {stories.map(story => <Link className="card page-card" key={story.id} href={`/story/${story.id}`} style={{ textDecoration: "none" }}>
          {story.coverImageUrl && <img src={story.coverImageUrl} alt="Story cover" />}
          <h3>{story.title}</h3>
          <p>{story.status} · made for {story.kidName}</p>
        </Link>)}
      </div>
    </section>}
  </main>;
}
