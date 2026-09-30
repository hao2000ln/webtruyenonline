import { dbClient } from "../src/db/index";

async function main() {
  const rows = await dbClient<{ indexname: string }[]>`
    SELECT indexname FROM pg_indexes 
    WHERE schemaname = 'public' 
    ORDER BY indexname
  `;
  console.log("All indexes on DB:");
  rows.forEach((r) => console.log(" -", r.indexname));
  await dbClient.end();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
