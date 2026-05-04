import { currentUser } from "@clerk/nextjs/server";

export async function getSessionEmail() {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;
}
