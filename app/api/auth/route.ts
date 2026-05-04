import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "StoryPanda now uses Clerk for authentication." }, { status: 410 });
}
