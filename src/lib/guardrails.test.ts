import { describe, expect, it } from "vitest";
import { evaluateProposalGuardrails, requiresVisualReview } from "./guardrails";
import { proposalDraftSchema, type ProposalDraft, type QuoteInput } from "./schema";

const baseInput: QuoteInput = {
  customerName: "Nina Patel",
  phone: "(704) 555-0184",
  email: "nina@example.com",
  address: "5530 Providence Rd, Charlotte, NC",
  leadSource: "Meta lead form",
  projectType: "Patio refresh",
  budgetMin: 12000,
  budgetMax: 18000,
  desiredTimeline: "October",
  siteWalkNotes:
    "Customer wants a paver patio replacement, low-voltage lighting, irrigation repair, and a cleaner entertainment space for family visits.",
  internalNotes: ""
};

const baseDraft: ProposalDraft = {
  proposalTitle: "Backyard Patio Refresh",
  executiveSummary: "Premium patio refresh with lighting and irrigation cleanup.",
  scopeSections: [
    {
      heading: "Patio",
      details: ["Remove damaged patio surface", "Install new paver field"],
      pricingCategory: "Pavers and patios"
    }
  ],
  lineItems: [
    {
      item: "Paver patio allowance",
      quantityAssumption: "Final square footage to be verified",
      pricingCategory: "Pavers and patios",
      needsHumanPrice: false
    }
  ],
  exclusions: ["Permit fees unless required by city review"],
  assumptions: ["Access is available through side yard"],
  customerQuestions: ["Confirm preferred paver color."],
  quoteReviewBrief: "Verify CompanyCam measurements and pricing spreadsheet categories before send.",
  followUpMessage: "Thanks for walking the yard with me. We have a clear path forward.",
  internalHandoff: "Verify final square footage before proposal send.",
  confidence: 0.86,
  riskFlags: []
};

describe("requiresVisualReview", () => {
  it("requires visual review for budgets at or above the complex-project threshold", () => {
    expect(requiresVisualReview({ ...baseInput, budgetMax: 30000 })).toBe(true);
  });

  it("requires visual review when complex scope appears in notes", () => {
    expect(
      requiresVisualReview({
        ...baseInput,
        budgetMax: 18000,
        siteWalkNotes: `${baseInput.siteWalkNotes} Add a pergola, drainage correction, and outdoor kitchen.`
      })
    ).toBe(true);
  });

  it("does not require visual review for simple sub-threshold work", () => {
    expect(requiresVisualReview(baseInput)).toBe(false);
  });
});

describe("evaluateProposalGuardrails", () => {
  it("flags visual review and approval dependencies", () => {
    const result = evaluateProposalGuardrails(
      {
        ...baseInput,
        budgetMax: 52000,
        siteWalkNotes: `${baseInput.siteWalkNotes} HOA approval and gas line coordination are likely.`
      },
      baseDraft
    );

    expect(result.requiresHumanApproval).toBe(true);
    expect(result.requiresVisualReview).toBe(true);
    expect(result.flags.map((flag) => flag.code)).toContain("visual_review_required");
    expect(result.flags.map((flag) => flag.code)).toContain("approval_dependency");
  });

  it("blocks drafts with low model confidence or human pricing needs", () => {
    const result = evaluateProposalGuardrails(baseInput, {
      ...baseDraft,
      confidence: 0.55,
      lineItems: [{ ...baseDraft.lineItems[0], needsHumanPrice: true }]
    });

    const blockerCodes = result.flags
      .filter((flag) => flag.severity === "blocker")
      .map((flag) => flag.code);

    expect(blockerCodes).toEqual(["low_ai_confidence", "pricing_review_required"]);
    expect(result.readyToSend).toBe(false);
  });

  it("warns when budget or timeline context is missing", () => {
    const result = evaluateProposalGuardrails(
      { ...baseInput, budgetMin: null, budgetMax: null, desiredTimeline: "" },
      baseDraft
    );

    expect(result.flags.map((flag) => flag.code)).toContain("missing_budget");
    expect(result.flags.map((flag) => flag.code)).toContain("missing_timeline");
  });
});

describe("proposalDraftSchema", () => {
  it("normalizes percentage-style confidence scores from model output", () => {
    const parsed = proposalDraftSchema.parse({ ...baseDraft, confidence: 85 });

    expect(parsed.confidence).toBe(0.85);
  });
});
