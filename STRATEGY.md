# Stoneridge Outdoor Living AI Agent Strategy

Assumption: GHL remains the operating source of truth. The first agent should create reviewable quote/proposal drafts and GHL-ready handoff data, not force Marcus and Jenna into a new daily system.

## P0 Choice: Quote-to-Proposal Agent

Purpose: Compress Stoneridge's 6-9 day quote cycle by turning Marcus's site-visit notes, CompanyCam photos context, measurements, and pricing-spreadsheet assumptions into a review-ready proposal draft.

- Extracts project scope, customer priorities, measurements still needed, assumptions, exclusions, and risk flags from messy site-visit notes.
- Maps requested work to pricing categories and flags human spreadsheet verification instead of inventing exact final pricing.
- Creates a quote review brief for Marcus/Jenna: what to verify in CompanyCam, what to check in the spreadsheet, and what dependencies affect send-readiness.
- Produces a client-ready follow-up draft in Marcus's voice, but keeps the proposal in human approval before anything is sent.
- Notifies Slack when a draft is ready and stores the full workflow in Postgres.

Replaces/unblocks: Marcus being the only person who can turn site visits into quote/proposal packages.

Estimated ROI: The transcript says 35-40% of qualified leads are lost to competitors who quote faster. The auditor note estimates roughly $200K/week of pipeline at risk. Even recovering a small fraction of those delayed quotes is more valuable than the lower-leverage pain points. With a ~$15K average project value, recovering 10 projects is ~$150K revenue before considering the compounding benefit of faster crew scheduling.

Why this is #1: Lead volume is not the problem. Meta ROAS is healthy and Marcus admits he cannot keep up with the leads he already has. Quote speed is the highest-leverage constraint because it sits directly between qualified demand and signed work.

## What I Would Build Next

1. **Post-Sign Momentum Agent**  
   Tracks HOA approvals, permits, deposits, and start-readiness after a customer signs. Jenna says 6-10 projects are often stuck in this limbo, and each delay blocks crew scheduling and cash collection.

2. **Closed-Lost Reactivation Agent**  
   Personalizes outreach to the 1,400+ closed-lost leads in GHL. Marcus has manually recovered 3-4 deals when he worked the list, but it takes a weekend and does not happen consistently.

3. **Customer Progress Update Agent**  
   Converts CompanyCam/project activity into customer-facing updates so customers stop calling Jenna asking what is happening. This protects Stoneridge's premium positioning and reduces operational noise.

4. **Lead Qualification Agent**  
   Filters tire-kickers before Marcus or Jenna spends time on them. It saves time, but it is lower priority than quote throughput because quote speed is losing already-qualified leads.

5. **Crew Coaching / Upsell Copilot**  
   Helps installers price and escalate add-ons instead of doing free work. This is real money, but the transcript estimates roughly $104K/year, which is materially smaller than quote-cycle pipeline risk.

## Explicit Pushback

I would not build a content/marketing agent now. Marcus wants more posting, but the call makes clear social produces only a few leads per month and the actual acquisition engine is already working. More demand would worsen the bottleneck until quote throughput improves.

I also would not build a fully autonomous instant-quote bot. Stoneridge's pricing spreadsheet is Marcus-specific, the company is premium-positioned, and wrong pricing creates trust and margin risk. The right first build is a human-in-the-loop proposal drafting system: AI handles the blank-page and structure work, while Marcus/Jenna retain final review and pricing judgment.

## Production Notes

The take-home implementation proves the workflow with Postgres persistence, OpenAI structured generation, deterministic guardrails, and Slack notification. In production, I would connect the approved draft and follow-up task back into GHL because Jenna explicitly said everything has to live there to get used.
