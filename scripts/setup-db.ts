import { ensureSchema, getPool } from "../src/lib/db";

async function main() {
  await ensureSchema();
  await getPool().end();
  console.log("Database schema is ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

