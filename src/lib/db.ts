import { Pool } from "pg";
import { requireDatabaseUrl } from "./config";

declare global {
  var greenscapePool: Pool | undefined;
  var greenscapeSchemaReady: Promise<void> | undefined;
}

export function getPool() {
  if (!globalThis.greenscapePool) {
    globalThis.greenscapePool = new Pool({
      connectionString: requireDatabaseUrl(),
      ssl:
        process.env.DATABASE_URL?.includes("localhost") ||
        process.env.DATABASE_URL?.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false },
      max: 5
    });
  }

  return globalThis.greenscapePool;
}

export async function ensureSchema() {
  if (!globalThis.greenscapeSchemaReady) {
    globalThis.greenscapeSchemaReady = getPool().query(`
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
    `).then(() => undefined);
  }

  return globalThis.greenscapeSchemaReady;
}

