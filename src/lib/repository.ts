import { randomUUID } from "node:crypto";
import { ensureSchema, getPool } from "./db";
import type {
  GuardrailResult,
  ProposalDraft,
  ProposalRecord,
  ProposalStatus,
  QuoteInput
} from "./schema";

type ProposalRow = {
  id: string;
  status: ProposalStatus;
  input: QuoteInput;
  draft: ProposalDraft | null;
  guardrails: GuardrailResult | null;
  model: string | null;
  token_usage: Record<string, unknown> | null;
  external_notification_status: string | null;
  error_message: string | null;
  approval_notes: string | null;
  approved_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

function mapProposalRow(row: ProposalRow): ProposalRecord {
  return {
    id: row.id,
    status: row.status,
    input: row.input,
    draft: row.draft,
    guardrails: row.guardrails,
    model: row.model,
    tokenUsage: row.token_usage,
    externalNotificationStatus: row.external_notification_status,
    errorMessage: row.error_message,
    approvalNotes: row.approval_notes,
    approvedAt: row.approved_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export async function listProposals() {
  await ensureSchema();

  const result = await getPool().query<ProposalRow>(
    "SELECT * FROM proposals ORDER BY created_at DESC LIMIT 50"
  );

  return result.rows.map(mapProposalRow);
}

export async function getProposal(id: string) {
  await ensureSchema();

  const result = await getPool().query<ProposalRow>("SELECT * FROM proposals WHERE id = $1", [id]);
  const row = result.rows[0];

  return row ? mapProposalRow(row) : null;
}

export async function createProposalRequest(input: QuoteInput) {
  await ensureSchema();

  const id = randomUUID();

  const result = await getPool().query<ProposalRow>(
    `
      INSERT INTO proposals (id, status, input)
      VALUES ($1, 'generating', $2::jsonb)
      RETURNING *
    `,
    [id, JSON.stringify(input)]
  );

  return mapProposalRow(result.rows[0]);
}

export async function saveProposalDraft(params: {
  id: string;
  draft: ProposalDraft;
  guardrails: GuardrailResult;
  model: string;
  tokenUsage: Record<string, unknown> | null;
  externalNotificationStatus: string;
}) {
  await ensureSchema();

  const result = await getPool().query<ProposalRow>(
    `
      UPDATE proposals
      SET status = 'ready_for_review',
          draft = $2::jsonb,
          guardrails = $3::jsonb,
          model = $4,
          token_usage = $5::jsonb,
          external_notification_status = $6,
          error_message = NULL,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      params.id,
      JSON.stringify(params.draft),
      JSON.stringify(params.guardrails),
      params.model,
      JSON.stringify(params.tokenUsage),
      params.externalNotificationStatus
    ]
  );

  return mapProposalRow(result.rows[0]);
}

export async function markProposalFailed(id: string, errorMessage: string) {
  await ensureSchema();

  const result = await getPool().query<ProposalRow>(
    `
      UPDATE proposals
      SET status = 'failed',
          error_message = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, errorMessage]
  );

  return mapProposalRow(result.rows[0]);
}

export async function approveProposal(id: string, approvalNotes: string) {
  await ensureSchema();

  const result = await getPool().query<ProposalRow>(
    `
      UPDATE proposals
      SET status = 'approved',
          approval_notes = $2,
          approved_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, approvalNotes]
  );

  return mapProposalRow(result.rows[0]);
}

export async function requestRevision(id: string, approvalNotes: string) {
  await ensureSchema();

  const result = await getPool().query<ProposalRow>(
    `
      UPDATE proposals
      SET status = 'revision_requested',
          approval_notes = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, approvalNotes]
  );

  return mapProposalRow(result.rows[0]);
}

