import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

async function fix() {
  try {
    const { db } = await import("./src/db/index.js");
    const { stories } = await import("./src/db/schema.js");
    const { desc, eq } = await import("drizzle-orm");

    console.log("Running query...");
    const result = await db.select().from(stories).where(eq(stories.isPublished, true)).orderBy(desc(stories.publishedAt)).limit(6);
    console.log("Success! Returned rows:", result.length);
  } catch (err) {
    console.error("Query Error:", err);
  }
  process.exit(0);
}
fix();
