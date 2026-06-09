import { z } from "zod";

const nullableMoney = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().nonnegative().nullable());

const confidenceScore = z.preprocess((value) => {
  const parsed =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;

  if (typeof parsed === "number" && parsed > 1 && parsed <= 100) {
    return parsed / 100;
  }

  return parsed;
}, z.number().min(0).max(1));

export const quoteInputSchema = z.object({
  customerName: z.string().trim().min(2, "Customer name is required."),
  phone: z.string().trim().optional().default(""),
  email: z.string().trim().optional().default(""),
  address: z.string().trim().min(5, "Project address is required."),
  leadSource: z.string().trim().optional().default("Meta lead form"),
  projectType: z.string().trim().min(2, "Project type is required."),
  budgetMin: nullableMoney.default(null),
  budgetMax: nullableMoney.default(null),
  desiredTimeline: z.string().trim().optional().default(""),
  siteWalkNotes: z
    .string()
    .trim()
    .min(80, "Add detailed site-walk notes so the agent has enough context."),
  internalNotes: z.string().trim().optional().default("")
});

export type QuoteInput = z.infer<typeof quoteInputSchema>;

export const riskFlagSchema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  message: z.string().min(1)
});

export const proposalDraftSchema = z.object({
  proposalTitle: z.string().min(1),
  executiveSummary: z.string().min(1),
  scopeSections: z.array(
    z.object({
      heading: z.string().min(1),
      details: z.array(z.string().min(1)),
      pricingCategory: z.string().min(1)
    })
  ),
  lineItems: z.array(
    z.object({
      item: z.string().min(1),
      quantityAssumption: z.string().min(1),
      pricingCategory: z.string().min(1),
      needsHumanPrice: z.boolean()
    })
  ),
  exclusions: z.array(z.string().min(1)),
  assumptions: z.array(z.string().min(1)),
  customerQuestions: z.array(z.string().min(1)),
  carlosRenderBrief: z.string().min(1),
  followUpMessage: z.string().min(1),
  internalHandoff: z.string().min(1),
  confidence: confidenceScore,
  riskFlags: z.array(riskFlagSchema)
});

export type ProposalDraft = z.infer<typeof proposalDraftSchema>;

export const proposalStatusSchema = z.enum([
  "generating",
  "ready_for_review",
  "approved",
  "revision_requested",
  "failed"
]);

export type ProposalStatus = z.infer<typeof proposalStatusSchema>;

export type GuardrailSeverity = "info" | "warning" | "blocker";

export type GuardrailFlag = {
  code: string;
  severity: GuardrailSeverity;
  message: string;
};

export type GuardrailResult = {
  requiresHumanApproval: boolean;
  requiresRender: boolean;
  readyToSend: boolean;
  flags: GuardrailFlag[];
};

export type ProposalRecord = {
  id: string;
  status: ProposalStatus;
  input: QuoteInput;
  draft: ProposalDraft | null;
  guardrails: GuardrailResult | null;
  model: string | null;
  tokenUsage: Record<string, unknown> | null;
  externalNotificationStatus: string | null;
  errorMessage: string | null;
  approvalNotes: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const openAiProposalJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "proposalTitle",
    "executiveSummary",
    "scopeSections",
    "lineItems",
    "exclusions",
    "assumptions",
    "customerQuestions",
    "carlosRenderBrief",
    "followUpMessage",
    "internalHandoff",
    "confidence",
    "riskFlags"
  ],
  properties: {
    proposalTitle: { type: "string" },
    executiveSummary: { type: "string" },
    scopeSections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "details", "pricingCategory"],
        properties: {
          heading: { type: "string" },
          details: { type: "array", items: { type: "string" } },
          pricingCategory: { type: "string" }
        }
      }
    },
    lineItems: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["item", "quantityAssumption", "pricingCategory", "needsHumanPrice"],
        properties: {
          item: { type: "string" },
          quantityAssumption: { type: "string" },
          pricingCategory: { type: "string" },
          needsHumanPrice: { type: "boolean" }
        }
      }
    },
    exclusions: { type: "array", items: { type: "string" } },
    assumptions: { type: "array", items: { type: "string" } },
    customerQuestions: { type: "array", items: { type: "string" } },
    carlosRenderBrief: { type: "string" },
    followUpMessage: { type: "string" },
    internalHandoff: { type: "string" },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Decimal confidence score from 0 to 1. Example: 0.84, not 84."
    },
    riskFlags: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["severity", "message"],
        properties: {
          severity: { type: "string", enum: ["low", "medium", "high"] },
          message: { type: "string" }
        }
      }
    }
  }
} as const;
