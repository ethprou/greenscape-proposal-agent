CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  input JSONB NOT NULL,
  draft JSONB,
  guardrails JSONB,
  model TEXT,
  token_usage JSONB,
  external_notification_status TEXT,
  error_message TEXT,
  approval_notes TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS proposals_status_idx ON proposals (status);
CREATE INDEX IF NOT EXISTS proposals_created_at_idx ON proposals (created_at DESC);

