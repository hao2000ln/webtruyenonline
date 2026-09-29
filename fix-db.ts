import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

async function fix() {
  try {
    const { db } = await import("./src/db/index.js");
    const { sql } = await import("drizzle-orm");

    console.log("Adding published_at to stories...");
    await db.execute(sql`ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone;`);
    
    console.log("Adding published_at to chapters (just in case)...");
    await db.execute(sql`ALTER TABLE "chapters" ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone;`);

    console.log("Success!");
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
fix();
