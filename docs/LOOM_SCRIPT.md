# Loom Walkthrough Script

Target length: 4:30-5:00. Do not narrate files line-by-line. Show decisions, then the working flow.

## 0:00-0:25 - Intro

"Hey, this is Ethan Proulx. I built the P0 agent I recommended for Greenscape Pro: a quote-to-proposal workflow that turns Marcus's site-walk notes into a review-ready proposal draft. The goal is not to replace Marcus's judgment. The goal is to remove the 6-9 day drafting delay that is costing them qualified deals."

Show: deployed homepage.

## 0:25-1:25 - Strategy Summary

"My top three agents are: first, the Quote-to-Proposal Agent; second, the Post-Sign Momentum Agent for deposits, HOA, permits, and start-date readiness; third, the Closed-Lost Reactivation Agent for the 1,400 old GHL leads.

I put quoting first because lead volume is not the problem. The discovery call says they lose 35-40% of qualified leads to faster competitors during proposal stage. At a $28K average project value, recovering even a small number of deals pays for the whole system.

I did not prioritize content even though Marcus asked for it, because content creates more demand for a funnel that is already quote-constrained."

Show: `STRATEGY.md`, top 3 and Required Pushback section.

## 1:25-2:45 - Product Demo

"Here is the workflow. Jenna or Marcus enters lead details, budget range, timeline, project type, and messy site-walk notes. I prefilled a realistic Arcadia backyard example: patio, pergola, fire pit, lighting, HOA risk, narrow access.

When I generate the draft, the API validates the intake, saves the record to Postgres as generating, calls OpenAI for a structured JSON proposal, runs deterministic guardrails, stores the final draft, and sends Slack a review notification.

The output is built for founder review: scope sections, pricing review items, assumptions, exclusions, customer questions, Carlos render brief, and a Marcus-style follow-up message. Nothing is sent to the customer automatically."

Show: form, generate a new draft or open the existing Nina Patel demo draft. Then show the Slack message that was sent to the review channel.

## 2:45-3:45 - Architecture Decisions

"I used Next.js on Vercel because the take-home required a public deployment and this keeps the UI and server routes in one deployable app. I used Postgres instead of local storage because the workflow needs persistent audit history. The schema stores the original intake, AI draft, guardrails, model, token usage, Slack status, approval notes, and timestamps.

For AI, I used the OpenAI Responses API with strict structured output on `gpt-5.4-mini`. That means the app expects a known JSON shape instead of scraping free-form prose. I still validate the model output with Zod before saving.

For the external integration I used Slack webhook notifications, because Marcus and Jenna already work through Slack. In a production implementation, the next integration would be GHL: write the approved proposal note and task back onto the opportunity."

Show: `docs/ARCHITECTURE.md`, then app review panel.

## 3:45-4:30 - Guardrails and Trade-offs

"The biggest guardrail is human approval. The agent never sends directly to customers. It flags projects over $30K for Carlos render, missing budget or timeline, low AI confidence, line items needing pricing review, and HOA, permit, utility, gas, electrical, drainage, access, or structural dependencies.

The main trade-off is that this prototype uses a representative pricing category catalog, not Marcus's real 200-line spreadsheet. That is intentional for the take-home. In week one of production, I would connect the actual pricing sheet and build a small eval set from Marcus-approved proposals."

## 4:30-5:00 - What I Would Build Next

"With another week, I would do four things: first, connect GHL so new site-walk notes and approved proposal drafts write back to the CRM; second, ingest the real pricing spreadsheet; third, add eval fixtures for approved/rejected proposals; fourth, add the Post-Sign Momentum Agent because faster quoting will create more signed jobs that need deposit, HOA, permit, and scheduling follow-through.

That's the build. It attacks the highest-leverage bottleneck, keeps the founder in the loop, and creates persistent operating data instead of a one-off demo."
