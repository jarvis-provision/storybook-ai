import { getStory } from "@/lib/store";
import { notFound } from "next/navigation";
import Reader from "./reader";

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = await getStory(id);
  if (!story) notFound();
  return <Reader story={story} shareUrl={`${process.env.APP_BASE_URL || "http://localhost:3000"}/s/${story.shareSlug}`} />;
}
