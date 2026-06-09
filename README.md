# Greenscape Pro Quote-to-Proposal Agent

AI take-home submission for Ethan Proulx's License & Scale AI Developer application.

The project builds the P0 agent recommended in [STRATEGY.md](./STRATEGY.md): a human-in-the-loop proposal drafting workflow for Greenscape Pro. It turns Marcus's site-walk notes into a structured proposal package, persists the workflow in Postgres, and sends a Slack review notification.

## Submission Links

- Deployed URL: https://licenseandscaletest.vercel.app
- GitHub repo: https://github.com/ethprou/greenscape-proposal-agent
- Loom: _pending recording_
- Strategy doc: [STRATEGY.md](./STRATEGY.md)

## What It Does

- Captures lead details, budget range, timeline, project type, and messy site-walk notes.
- Calls OpenAI to generate a structured proposal draft with scope, assumptions, exclusions, customer questions, render brief, and Marcus-style follow-up.
- Runs deterministic guardrails for missing context, render threshold, pricing review, low confidence, and permit/HOA/utility risks.
- Saves every request, draft, token usage record, guardrail result, and approval decision in Postgres.
- Sends a Slack review notification when a draft is ready.
- Provides a simple approval/revision dashboard for Marcus or Jenna.

## Stack

- Next.js App Router
- TypeScript
- Postgres via `pg`
- OpenAI Responses API with structured JSON output
- Slack incoming webhook for review notifications
- Vitest for focused guardrail coverage

## Local Setup

```bash
npm install
cp .env.example .env
```

Fill in:

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.4-mini
DATABASE_URL=postgresql://...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Prepare the database:

```bash
npm run db:setup
```

Run locally:

```bash
npm run dev
```

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Deployment

This app is Vercel-ready. Set the same environment variables in Vercel, then deploy:

```bash
vercel
vercel --prod
```

Use Supabase, Neon, Vercel Postgres, or another managed Postgres database for `DATABASE_URL`. The schema is available in [database/schema.sql](./database/schema.sql), and `npm run db:setup` can create it automatically.

The production deployment is configured with Neon Postgres, OpenAI, and Slack webhook environment variables. A live `gpt-5.4-mini` proposal generation has been verified end-to-end with Slack notification status `sent`.

## Architecture

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Walkthrough Prep

- [docs/LOOM_SCRIPT.md](./docs/LOOM_SCRIPT.md)
- [docs/INTERVIEW_PREP.md](./docs/INTERVIEW_PREP.md)
