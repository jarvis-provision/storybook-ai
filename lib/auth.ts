import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "storybook_session";
const secret = process.env.SESSION_SECRET || "dev-secret";

function sign(value: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export async function getSessionEmail() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [email, sig] = raw.split(".");
  if (!email || !sig || sign(email) !== sig) return null;
  return Buffer.from(email, "base64url").toString("utf8");
}

export async function setSessionEmail(email: string) {
  const encoded = Buffer.from(email.toLowerCase().trim()).toString("base64url");
  (await cookies()).set(COOKIE, `${encoded}.${sign(encoded)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });
}
