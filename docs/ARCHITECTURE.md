# Architecture

## Goal

The P0 agent compresses Greenscape Pro's quote cycle by turning site-walk notes into a proposal package Marcus can review instead of drafting from a blank Google Doc.

## Data Flow

1. Jenna or Marcus enters lead details and site-walk notes in the dashboard.
2. The API validates the input and writes a `generating` proposal record to Postgres.
3. OpenAI generates a strict JSON proposal draft using the Greenscape context and pricing-category catalog.
4. The guardrail layer adds deterministic checks: render required, missing budget, low confidence, pricing review, and HOA/permit/utility dependencies.
5. The completed draft, model, token usage, guardrails, and Slack notification status are persisted.
6. Slack receives a review notification with a link back to the app.
7. Marcus approves or requests revision. The decision is persisted and approval can also notify Slack.

## Why This Stack

- **Next.js on Vercel:** fastest path to a public URL with server routes, UI, and deployment in one repo.
- **Postgres:** satisfies the persistent storage requirement and maps cleanly to Supabase, Neon, or Vercel Postgres.
- **OpenAI Responses API:** structured JSON output keeps the AI result parseable and reviewable instead of free-form text.
- **Slack webhook:** simple external integration that demonstrates an actual side effect. In production, the same event could also create/update a GHL opportunity note.
- **Human-in-the-loop approval:** Marcus remains accountable for pricing and client trust; the agent removes drafting latency, not judgment.

## Guardrails

- Never sends directly to a customer.
- Flags any project at or above $30K for a Carlos render.
- Treats missing budget/timeline as review risks.
- Blocks low-confidence drafts.
- Blocks line items marked as needing spreadsheet verification.
- Flags HOA, permit, utility, gas, electrical, drainage, access, and structural dependencies.

## Cost Considerations

The default model is `gpt-4.1-mini` because this is a structured drafting task, not deep reasoning. OpenAI's model page lists `gpt-4.1-mini` as supporting the Responses API and structured outputs, with a 1M-token context window. The pricing page lists it at $0.40 per 1M input tokens and $1.60 per 1M output tokens, so a normal site-walk draft should cost far below the value of a single recovered proposal. The model is configurable through `OPENAI_MODEL`, and token usage is stored on every draft for auditability.

## Scale Risks

- Serverless Postgres pools need tuning if usage spikes; for this prototype `pg` with a small pool is enough.
- The representative pricing catalog should be replaced with Marcus's real 200-line spreadsheet or a GHL/Sheets integration before production.
- Slack is enough for the take-home external integration, but production adoption depends on writing the proposal artifact back to GHL.
- Prompt quality will improve after collecting Marcus-approved/rejected examples and turning those into evaluation fixtures.

