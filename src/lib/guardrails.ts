import type { GuardrailFlag, GuardrailResult, ProposalDraft, QuoteInput } from "./schema";

const RENDER_THRESHOLD = 30000;

function notesContain(input: QuoteInput, pattern: RegExp) {
  return pattern.test(
    [input.projectType, input.desiredTimeline, input.siteWalkNotes, input.internalNotes]
      .join(" ")
      .toLowerCase()
  );
}

export function requiresRender(input: QuoteInput) {
  if (input.budgetMax !== null && input.budgetMax >= RENDER_THRESHOLD) {
    return true;
  }

  return notesContain(input, /render|3d|outdoor kitchen|pergola|water feature|structural/);
}

export function evaluateProposalGuardrails(
  input: QuoteInput,
  draft: ProposalDraft
): GuardrailResult {
  const flags: GuardrailFlag[] = [];
  const renderRequired = requiresRender(input);

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

  if (renderRequired) {
    flags.push({
      code: "render_required",
      severity: "warning",
      message: "Project should receive a Carlos 3D render before proposal send."
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
    requiresRender: renderRequired,
    readyToSend: false,
    flags
  };
}

