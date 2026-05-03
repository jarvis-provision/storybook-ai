import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moonbeam Storybook",
  description: "Personalized children’s storybooks with AI art and voice narration."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
