import { findStoryBySlug } from "@/lib/store";
import { notFound } from "next/navigation";
import Reader from "@/app/story/[id]/reader";

export default async function SharedStory({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await findStoryBySlug(slug);
  if (!story) notFound();
  return <Reader story={story} shareUrl={`${process.env.APP_BASE_URL || "http://localhost:3000"}/s/${story.shareSlug}`} />;
}
