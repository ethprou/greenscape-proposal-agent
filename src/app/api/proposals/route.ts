import { NextResponse } from "next/server";
import { evaluateProposalGuardrails } from "@/lib/guardrails";
import { generateProposalDraft } from "@/lib/openai";
import {
  createProposalRequest,
  listProposals,
  markProposalFailed,
  saveProposalDraft
} from "@/lib/repository";
import { quoteInputSchema } from "@/lib/schema";
import { notifySlackProposalReady } from "@/lib/slack";
import { toErrorMessage } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const proposals = await listProposals();
    return NextResponse.json({ proposals });
  } catch (error) {
    return NextResponse.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let proposalId: string | null = null;

  try {
    const body = await request.json();
    const input = quoteInputSchema.parse(body);
    const proposal = await createProposalRequest(input);
    proposalId = proposal.id;

    const generated = await generateProposalDraft(input);
    const guardrails = evaluateProposalGuardrails(input, generated.draft);
    const draftRecord = {
      ...proposal,
      status: "ready_for_review" as const,
      draft: generated.draft,
      guardrails,
      model: generated.model,
      tokenUsage: generated.tokenUsage,
      externalNotificationStatus: null,
      errorMessage: null,
      updatedAt: new Date().toISOString()
    };
    const slack = await notifySlackProposalReady(draftRecord);

    const saved = await saveProposalDraft({
      id: proposal.id,
      draft: generated.draft,
      guardrails,
      model: generated.model,
      tokenUsage: generated.tokenUsage,
      externalNotificationStatus: slack.status
    });

    return NextResponse.json({ proposal: saved }, { status: 201 });
  } catch (error) {
    if (proposalId) {
      try {
        const failed = await markProposalFailed(proposalId, toErrorMessage(error));
        return NextResponse.json({ proposal: failed, error: toErrorMessage(error) }, { status: 500 });
      } catch {
        return NextResponse.json({ error: toErrorMessage(error) }, { status: 500 });
      }
    }

    return NextResponse.json({ error: toErrorMessage(error) }, { status: 400 });
  }
}

