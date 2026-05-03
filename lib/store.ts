import fs from "fs/promises";
import path from "path";
import { Story } from "./types";

const dataDir = path.join(process.cwd(), "data");
const storiesDir = path.join(dataDir, "stories");

async function ensure() { await fs.mkdir(storiesDir, { recursive: true }); }

export async function saveStory(story: Story) {
  await ensure();
  await fs.writeFile(path.join(storiesDir, `${story.id}.json`), JSON.stringify(story, null, 2));
  return story;
}

export async function getStory(id: string) {
  try { return JSON.parse(await fs.readFile(path.join(storiesDir, `${id}.json`), "utf8")) as Story; }
  catch { return null; }
}

export async function findStoryBySlug(slug: string) {
  await ensure();
  const files = await fs.readdir(storiesDir);
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const story = JSON.parse(await fs.readFile(path.join(storiesDir, file), "utf8")) as Story;
    if (story.shareSlug === slug) return story;
  }
  return null;
}

export async function listStoriesFor(email: string) {
  await ensure();
  const files = await fs.readdir(storiesDir);
  const stories = await Promise.all(files.filter(f => f.endsWith(".json")).map(async file => JSON.parse(await fs.readFile(path.join(storiesDir, file), "utf8")) as Story));
  return stories.filter(s => s.ownerEmail === email).sort((a,b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
