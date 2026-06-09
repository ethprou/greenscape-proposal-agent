# Live Walkthrough Prep

## One-Sentence Summary

I built a human-in-the-loop quote-to-proposal agent for Greenscape Pro that turns site-walk notes into structured proposal drafts, stores the workflow in Postgres, and notifies Slack for founder review.

## Why P0 Is Quoting

- The client is not lead constrained. Meta and Google are already producing volume.
- The bottleneck is Marcus converting site-walk notes into proposals.
- Proposal turnaround is 6-9 days.
- 35-40% of qualified leads are reportedly lost to faster competitors.
- Site walks close at roughly 70%+, so qualified proposal-stage speed is highly leveraged.

## Pushback To Say Clearly

"I agreed with Marcus on the problem, but not on a magical autonomous quoting solution. I would not let AI invent prices or send proposals directly. The right first build is a proposal drafting and approval system that removes blank-page work while preserving founder judgment."

## Engineering Decisions

- **Next.js/Vercel:** one deployable unit for frontend and API, fast public URL.
- **Postgres:** durable audit history; satisfies persistent storage; easy Supabase/Neon/Vercel Postgres fit.
- **OpenAI structured output:** predictable schema, easier validation, no fragile free-form parsing.
- **Zod validation:** verifies both user input and AI output before persistence.
- **Slack webhook:** practical external integration for team review, low setup burden.
- **Approval workflow:** aligned with Marcus saying he wants to review and approve, not babysit tech.

## Likely Questions

**Why not build the closed-lost agent first?**  
It has high upside, but it injects more demand into a funnel that is already proposal-constrained. Fix proposal throughput first, then reactivate old demand.

**Why not automate final pricing?**  
The real pricing spreadsheet was not provided, and Greenscape is premium-positioned. Guessing final numbers would be a trust and margin risk. The prototype maps to pricing categories and flags human price review.

**What breaks first at scale?**  
Serverless Postgres pool management and prompt quality. I would use a managed serverless Postgres driver or pooling layer, add evals, and write approved outputs back to GHL.

**Why Slack instead of GHL?**  
The brief required at least one external integration. Slack is fast and relevant to their operating flow. Production should add GHL because the client explicitly said everything must live in GHL.

**Why this model?**  
The default is `gpt-5.4-mini`. The task is not merely returning the same information in a different shape; it requires judgment over messy notes, risk detection, brand-appropriate proposal language, and structured output discipline. A mini-class GPT-5 model gives better quality than older mini models while keeping cost and latency reasonable. The app stores model plus token usage for review, and `OPENAI_MODEL` can be changed without code changes.

**What would you do with another week?**  
Connect GHL, ingest the real pricing sheet, add proposal quality evals, and build the Post-Sign Momentum Agent next.

## Demo Flow

1. Open deployed URL.
2. Point out env status pills.
3. Open strategy doc and explain ranking.
4. Submit sample Arcadia site-walk notes if secrets are configured.
5. Show review draft sections and guardrail flags.
6. Approve or request revision.
7. Show Slack notification and explain Postgres persistence.

## Things Not To Say

- Do not say the AI "quotes automatically."
- Do not claim GHL is integrated yet.
- Do not call the pricing catalog real client pricing.
- Do not narrate code line by line.
- Do not over-defend using AI tooling. They said AI tooling is allowed; focus on decisions and ownership.
