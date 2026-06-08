import { NextResponse } from "next/server";
import { approveProposal, getProposal } from "@/lib/repository";
import { notifySlackProposalApproved } from "@/lib/slack";
import { toErrorMessage } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const proposal = await getProposal(id);

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
    }

    if (!proposal.draft) {
      return NextResponse.json({ error: "Proposal has no draft to approve." }, { status: 409 });
    }

    const approved = await approveProposal(id, String(body.approvalNotes || ""));
    await notifySlackProposalApproved(approved);

    return NextResponse.json({ proposal: approved });
  } catch (error) {
    return NextResponse.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

