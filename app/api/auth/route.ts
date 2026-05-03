import { NextResponse } from "next/server";
import { z } from "zod";
import { setSessionEmail } from "@/lib/auth";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const { email } = schema.parse(await req.json());
  await setSessionEmail(email);
  return NextResponse.json({ ok: true });
}
