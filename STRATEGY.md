# Greenscape Pro AI Agent Strategy

Assumption: GHL remains the operating source of truth. Agents should create reviewable drafts and tasks, not force the team into a new daily system.

## 1. Quote-to-Proposal Agent

Purpose: Convert Marcus's site-walk notes into a structured proposal draft within hours instead of 6-9 days.

- Extracts project scope, materials, assumptions, exclusions, timeline, and decision risks from site-walk notes.
- Maps requested work to pricing categories and flags missing details instead of inventing numbers.
- Marks projects over $30K as "render required" and creates a Carlos handoff brief.
- Produces a founder-review draft with confidence score, risk flags, and client-ready language.
- Notifies Slack when a draft is ready for approval.

Replaces/unblocks: Marcus personally turning every site-walk note into a proposal from scratch.

Estimated ROI: If 35-40% of qualified leads are being lost to faster quotes, even recovering 10 signed projects at the $28K average is $280K in revenue. The upside is likely much larger because quote speed is constraining a $3.8M design-build revenue stream.

Priority rationale: This is the biggest hole in the bucket. Lead volume and close quality are not the problem; proposal cycle time is. This also unlocks later agents because cleaner scope data improves follow-up, handoffs, and customer updates.

## 2. Post-Sign Momentum Agent

Purpose: Move signed customers through deposit, HOA, permit, and schedule readiness without Jenna manually chasing every dependency.

- Tracks each signed job by deposit, HOA, permit, final design, and start-date readiness.
- Generates customer-specific nudges for unpaid deposits and HOA packet follow-up.
- Escalates stuck jobs to Jenna or Marcus with reason, age, and next action.
- Summarizes blocked revenue by stage.

Replaces/unblocks: Jenna's manual chasing and Marcus's unclear scheduling pipeline.

Estimated ROI: 8-12 projects in limbo at $28K average means $224K-$336K of delayed revenue at any moment. Pulling even one week out of the delay improves cash flow and crew utilization.

Priority rationale: High operational leverage, but it starts after the sale. It should follow quote acceleration because faster proposals create more signed jobs entering this workflow.

## 3. Closed-Lost Reactivation Agent

Purpose: Reopen old opportunities with personal-feeling Marcus-style SMS/email from GHL history.

- Scores 1,400+ closed-lost leads by project size, timing, and prior conversation quality.
- Writes context-aware reactivation messages that reference the original backyard/project.
- Queues messages for Brittany or Marcus approval before sending through GHL.
- Tracks replies, booked calls, and recovered pipeline.

Replaces/unblocks: Sporadic mass re-engagement blasts that do not feel personal.

Estimated ROI: A 2% recovery rate on 1,400 leads is 28 projects. At $28K average project value, that is $784K in latent revenue before margin.

Priority rationale: Very high upside and low delivery risk, but it adds demand into a funnel that is already quote-constrained. It should come after proposal speed improves.

## 4. Customer Progress Update Agent

Purpose: Turn Jobber milestones and CompanyCam photos into consistent customer updates without Marcus recording Looms manually.

- Watches project milestones/photo activity and drafts weekly or milestone-based updates.
- Converts crew check-ins into plain-English customer messages.
- Flags jobs with no customer-facing update in 3+ days.
- Sends Marcus-branded updates after review or via approved templates.

Replaces/unblocks: Inbound "what is happening?" calls to Jenna and inconsistent mid-project communication.

Estimated ROI: Lower support load, fewer anxious clients, and more referrals. Harder to quantify than sales agents, but customer communication is a premium-positioning differentiator Marcus already knows works.

Priority rationale: Strong adoption fit and customer impact, but it does not recover as much immediate revenue as quote speed, post-sign movement, or reactivation.

## 5. Office Approval / Change Order Copilot

Purpose: Give Jenna a Marcus-style rulebook for small approvals, add-ons, refunds, and pricing questions.

- Captures Marcus's decision rules for common office questions.
- Drafts recommended answers with confidence and "ask Marcus" thresholds.
- Builds a searchable approval history so the rulebook improves over time.
- Escalates only high-dollar, unusual, or low-confidence decisions.

Replaces/unblocks: 5-10 daily Slack pings to Marcus for decisions Jenna could make with a clear framework.

Estimated ROI: Saves Marcus roughly 30-60 minutes per workday and reduces operational drag. It also protects margin on add-ons and refunds.

Priority rationale: This is valuable, but lower direct revenue leverage than the first four. It is #5 because it improves founder capacity rather than directly accelerating sales or cash collection.

## Required Pushback

My #1 agrees with Marcus on the business bottleneck, but not with the likely founder-shaped solution. I would not build a fully autonomous "instant quote" bot that invents prices or sends proposals without review. The right P0 is a quote-to-proposal approval system: it compresses the slowest human step while keeping Marcus accountable for premium scope, pricing judgment, and customer trust.

The agent I considered but excluded is a marketing/content agent. Marcus wants daily posting, but he also said lead volume is not the constraint and Meta ROAS is healthy. More content would create more demand for a funnel that cannot quote fast enough. I would revisit content only after proposal throughput and post-sign operations are stable.

