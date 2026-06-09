import OpenAI from "openai";
import { getOpenAiModel, requireOpenAiKey } from "./config";
import { toErrorMessage } from "./errors";
import { formatPricingCatalogForPrompt } from "./pricing-catalog";
import {
  openAiProposalJsonSchema,
  proposalDraftSchema,
  type ProposalDraft,
  type QuoteInput
} from "./schema";

type GenerateProposalResult = {
  draft: ProposalDraft;
  model: string;
  tokenUsage: Record<string, unknown> | null;
};

function buildSystemPrompt() {
  return `You are the Stoneridge Outdoor Living quote-to-proposal agent.

Business context:
- Stoneridge Outdoor Living is a Charlotte, NC landscaping and hardscaping company doing about $3M/year.
- Marcus personally turns site-visit notes, CompanyCam photos, measurements, and spreadsheet pricing into quotes.
- Average project value is about $15,000. Quote cycle is 6-9 days and speed is losing 35-40% of qualified leads.
- The company does not compete on price. Drafts should sell quality, reliability, communication, and finished-product pride.
- Marcus must approve proposals. Do not invent exact final pricing. Use pricing categories and flag items that need spreadsheet verification.
- GHL is the CRM/source of truth. Drafts should be easy for Jenna or Marcus to copy into the GHL proposal workflow.

Available pricing categories:
${formatPricingCatalogForPrompt()}

Output rules:
- Return only structured JSON that matches the schema.
- Be specific to the site-walk notes.
- If the notes are missing information, ask concise customer questions and lower confidence.
- Every proposal must include assumptions and exclusions.
- Any gas, electrical, HOA, permit, drainage, structural, utility, or access issue must be risk-flagged.
- quoteReviewBrief should tell Marcus/Jenna what to verify in CompanyCam photos, measurements, and the pricing spreadsheet before sending.
- The follow-up message should sound like Marcus: direct, warm, premium, and not corporate.
- Confidence must be a decimal from 0 to 1. Use 0.84, not 84 or "84%".`;
}

function buildUserPrompt(input: QuoteInput) {
  return JSON.stringify(
    {
      task: "Draft a review-ready proposal package from these site-walk notes.",
      input
    },
    null,
    2
  );
}

export async function generateProposalDraft(input: QuoteInput): Promise<GenerateProposalResult> {
  const model = getOpenAiModel();
  const client = new OpenAI({ apiKey: requireOpenAiKey() });

  const response = await client.responses.create({
    model,
    input: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(input) }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "stoneridge_proposal_draft",
        strict: true,
        schema: openAiProposalJsonSchema
      }
    }
  });

  try {
    const rawText = response.output_text;
    const parsed = JSON.parse(rawText);
    const draft = proposalDraftSchema.parse(parsed);

    return {
      draft,
      model,
      tokenUsage: response.usage ? { ...response.usage } : null
    };
  } catch (error) {
    throw new Error(`OpenAI returned an invalid proposal draft: ${toErrorMessage(error)}`);
  }
}
