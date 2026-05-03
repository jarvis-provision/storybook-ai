export type StoryType = "bedtime" | "adventure" | "kindness" | "learning" | "silly";

export type StoryPage = {
  pageNumber: number;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  audioUrl?: string;
};

export type Story = {
  id: string;
  shareSlug: string;
  ownerEmail: string;
  kidName: string;
  storyType: StoryType;
  title: string;
  dedication: string;
  coverPrompt: string;
  coverImageUrl?: string;
  coverAudioUrl?: string;
  pages: StoryPage[];
  status: "draft" | "generating" | "ready" | "failed";
  error?: string;
  voiceMode: "default" | "clone";
  voiceUuid?: string;
  createdAt: string;
};
