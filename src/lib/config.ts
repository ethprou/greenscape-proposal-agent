import { ConfigurationError } from "./errors";

export type ConfigStatus = {
  database: boolean;
  openai: boolean;
  slack: boolean;
  appUrl: string;
  model: string;
};

export function getConfigStatus(): ConfigStatus {
  return {
    database: Boolean(process.env.DATABASE_URL),
    openai: Boolean(process.env.OPENAI_API_KEY),
    slack: Boolean(process.env.SLACK_WEBHOOK_URL),
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    model: process.env.OPENAI_MODEL || "gpt-5.4-mini"
  };
}

export function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new ConfigurationError(
      "DATABASE_URL is missing. Add a Supabase, Neon, Vercel Postgres, or other Postgres connection string."
    );
  }

  return process.env.DATABASE_URL;
}

export function requireOpenAiKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new ConfigurationError("OPENAI_API_KEY is missing.");
  }

  return process.env.OPENAI_API_KEY;
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getOpenAiModel() {
  return process.env.OPENAI_MODEL || "gpt-5.4-mini";
}
