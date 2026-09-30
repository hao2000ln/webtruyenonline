/**
 * Apply performance indexes trực tiếp lên DB.
 * Không dùng drizzle migrate vì các indexes này dùng partial index
 * và pg_trgm — Drizzle hiện chưa generate được từ schema definition.
 */
import { dbClient } from "../src/db/index";

async function main() {
  console.log("Applying performance indexes...\n");

  const steps = [
    {
      name: "pg_trgm extension",
      sql: `CREATE EXTENSION IF NOT EXISTS pg_trgm`,
    },
    {
      name: "stories_published_latest_idx (partial index)",
      sql: `CREATE INDEX IF NOT EXISTS "stories_published_latest_idx"
        ON "stories" ("latest_chapter_at" DESC NULLS LAST)
        WHERE "is_published" = true`,
    },
    {
      name: "stories_published_view_count_idx (partial index)",
      sql: `CREATE INDEX IF NOT EXISTS "stories_published_view_count_idx"
        ON "stories" ("view_count" DESC)
        WHERE "is_published" = true`,
    },
    {
      name: "stories_published_at_idx (partial index)",
      sql: `CREATE INDEX IF NOT EXISTS "stories_published_at_idx"
        ON "stories" ("published_at" DESC)
        WHERE "is_published" = true`,
    },
    {
      name: "stories_title_trgm_idx (trigram GIN)",
      sql: `CREATE INDEX IF NOT EXISTS "stories_title_trgm_idx"
        ON "stories" USING gin ("title" gin_trgm_ops)`,
    },
    {
      name: "authors_name_trgm_idx (trigram GIN)",
      sql: `CREATE INDEX IF NOT EXISTS "authors_name_trgm_idx"
        ON "authors" USING gin ("name" gin_trgm_ops)`,
    },
    {
      name: "follows_story_idx",
      sql: `CREATE INDEX IF NOT EXISTS "follows_story_idx"
        ON "follows" ("story_id")`,
    },
    {
      name: "chapters_published_number_idx (partial index)",
      sql: `CREATE INDEX IF NOT EXISTS "chapters_published_number_idx"
        ON "chapters" ("story_id", "chapter_number")
        WHERE "is_published" = true`,
    },
  ];

  for (const step of steps) {
    process.stdout.write(`  → ${step.name}... `);
    try {
      await dbClient.unsafe(step.sql);
      console.log("✅");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log("❌", msg);
    }
  }

  // Xóa index cũ đã được thay bằng partial index
  process.stdout.write("  → Drop old stories_latest_chapter_idx... ");
  try {
    await dbClient.unsafe(`DROP INDEX IF EXISTS "stories_latest_chapter_idx"`);
    console.log("✅");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log("⚠️", msg);
  }

  console.log("\nDone.");
  await dbClient.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
