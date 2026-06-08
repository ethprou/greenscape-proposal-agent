import { NextResponse } from "next/server";
import { requestRevision } from "@/lib/repository";
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
    const revised = await requestRevision(id, String(body.approvalNotes || ""));

    return NextResponse.json({ proposal: revised });
  } catch (error) {
    return NextResponse.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

