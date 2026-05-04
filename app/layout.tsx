import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StoryPanda",
  description: "Personalized children’s storybooks with AI art, friendly narration, and shareable pages."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><ClerkProvider>{children}</ClerkProvider></body></html>;
}
