// Script kiểm tra các performance indexes đã được áp dụng lên DB chưa
import { dbClient } from "../src/db/index";

const targetIndexes = [
  "stories_published_latest_idx",
  "stories_published_view_count_idx",
  "stories_published_at_idx",
  "stories_title_trgm_idx",
  "authors_name_trgm_idx",
  "follows_story_idx",
  "chapters_published_number_idx",
];

async function main() {
  const rows = await dbClient<{ indexname: string; tablename: string }[]>`
    SELECT indexname, tablename
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = ANY(${targetIndexes})
    ORDER BY tablename, indexname
  `;

  console.log("\n=== Performance Indexes Check ===\n");
  for (const r of rows) {
    console.log(`  ✅ ${r.indexname}  [${r.tablename}]`);
  }

  const missing = targetIndexes.filter((n) => !rows.find((r) => r.indexname === n));
  if (missing.length > 0) {
    console.log("\n  ❌ Missing:");
    for (const m of missing) console.log(`    - ${m}`);
    process.exitCode = 1;
  } else {
    console.log(`\n  All ${targetIndexes.length} indexes present ✓`);
  }

  await dbClient.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
