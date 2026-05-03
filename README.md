# Moonbeam Storybook

A Next.js prototype for personalized children’s storybooks:

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
RESEMBLE_PROJECT_UUID=...
RESEMBLE_DEFAULT_VOICE_UUID=... # provide this when ready
APP_BASE_URL=http://localhost:3000
SESSION_SECRET=some-long-random-string
```

Without keys, the app runs in mock mode for text/images and skips audio.

## Production notes

- Replace cookie demo auth with Clerk, Auth.js, or Supabase Auth.
- Move JSON persistence and generated files to Postgres/S3 or similar.
- Resemble clone endpoint can vary by account/plan; `lib/resemble.ts` isolates that integration.
- For long jobs, move `/api/stories` work to a queue (Inngest, Trigger.dev, BullMQ) and poll job status.
