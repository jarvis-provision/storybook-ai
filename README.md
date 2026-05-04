# StoryPanda

A Next.js prototype for StoryPanda — personalized children’s storybooks with AI art and narration:

1. Landing page asks for kid name and story type.
2. User logs in via a simple cookie session.
3. Optional browser voice recording can be sent for Resemble voice cloning.
4. Pipeline generates:
   - story text with `OPENAI_TEXT_MODEL` (default `gpt-5.5`)
   - cover/page art with `OPENAI_IMAGE_MODEL` (default `gpt-image-2`)
   - narration clips with Resemble AI
5. Finished books are readable page-by-page and shareable at `/s/[slug]`.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Required for real generation:

```bash
OPENAI_API_KEY=...
RESEMBLE_API_KEY=...
RESEMBLE_DEFAULT_VOICE_UUID=... # default narrator voice
APP_BASE_URL=http://localhost:3000
SESSION_SECRET=some-long-random-string
MAX_STORY_PAGES=1 # optional: local smoke tests only
```

Without keys, the app runs in mock mode for text/images and skips audio.

## Production notes

- Replace cookie demo auth with Clerk, Auth.js, or Supabase Auth.
- Move JSON persistence and generated files to Postgres/S3 or similar.
- Resemble uses synchronous synthesis (`https://f.cluster.resemble.ai/synthesize`) and voice creation/recording/build endpoints for clone flow.
- For long jobs, move `/api/stories` work to a queue (Inngest, Trigger.dev, BullMQ) and poll job status.
