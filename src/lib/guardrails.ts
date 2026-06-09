import type { GuardrailFlag, GuardrailResult, ProposalDraft, QuoteInput } from "./schema";

const VISUAL_REVIEW_THRESHOLD = 30000;

function notesContain(input: QuoteInput, pattern: RegExp) {
  return pattern.test(
    [input.projectType, input.desiredTimeline, input.siteWalkNotes, input.internalNotes]
      .join(" ")
      .toLowerCase()
  );
}

export function requiresVisualReview(input: QuoteInput) {
  if (input.budgetMax !== null && input.budgetMax >= VISUAL_REVIEW_THRESHOLD) {
    return true;
  }

  return notesContain(input, /companycam|photo|measure|outdoor kitchen|pergola|water feature|structural|drainage|slope/);
}

export function evaluateProposalGuardrails(
  input: QuoteInput,
  draft: ProposalDraft
): GuardrailResult {
  const flags: GuardrailFlag[] = [];
  const visualReviewRequired = requiresVisualReview(input);

  if (input.budgetMin === null || input.budgetMax === null) {
    flags.push({
      code: "missing_budget",
      severity: "warning",
      message: "Budget range is missing or incomplete. Marcus should confirm before pricing."
    });
  }

  if (!input.desiredTimeline) {
    flags.push({
      code: "missing_timeline",
      severity: "info",
      message: "Customer timeline is missing. Include it in follow-up questions."
    });
  }

  if (visualReviewRequired) {
    flags.push({
      code: "visual_review_required",
      severity: "warning",
      message: "Marcus/Jenna should verify CompanyCam photos, measurements, and spreadsheet assumptions before send."
    });
  }

  if (draft.confidence < 0.72) {
    flags.push({
      code: "low_ai_confidence",
      severity: "blocker",
      message: "AI confidence is below the send threshold. A human revision is required."
    });
  }

  if (draft.lineItems.some((item) => item.needsHumanPrice)) {
    flags.push({
      code: "pricing_review_required",
      severity: "blocker",
      message: "At least one line item needs pricing spreadsheet verification."
    });
  }

  if (notesContain(input, /hoa|permit|setback|easement|utility|gas line|electrical/)) {
    flags.push({
      code: "approval_dependency",
      severity: "warning",
      message: "HOA, permit, utility, or setback dependency detected."
    });
  }

  for (const risk of draft.riskFlags) {
    if (risk.severity === "high") {
      flags.push({
        code: "ai_high_risk_flag",
        severity: "blocker",
        message: risk.message
      });
    }
  }

  return {
    requiresHumanApproval: true,
    requiresVisualReview: visualReviewRequired,
    readyToSend: false,
    flags
  };
}
