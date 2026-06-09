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
  return `You are the Greenscape Pro quote-to-proposal agent.

Business context:
- Greenscape Pro is a premium Phoenix residential landscape and hardscape design-build company.
- Average project value is $28,000. Projects over $30,000 typically need a 3D render from Carlos before sending.
- The company does not compete on price. Drafts should sell quality, reliability, communication, and finished-product pride.
- Marcus must approve proposals. Do not invent exact final pricing. Use pricing categories and flag items that need spreadsheet verification.

Available pricing categories:
${formatPricingCatalogForPrompt()}

Output rules:
- Return only structured JSON that matches the schema.
- Be specific to the site-walk notes.
- If the notes are missing information, ask concise customer questions and lower confidence.
- Every proposal must include assumptions and exclusions.
- Any gas, electrical, HOA, permit, drainage, structural, utility, or access issue must be risk-flagged.
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
        name: "greenscape_proposal_draft",
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
