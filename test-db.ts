import { db } from "./src/db/index.js";
import { stories } from "./src/db/schema.js";
import { desc, eq } from "drizzle-orm";

async function main() {
  try {
    await db.select().from(stories).where(eq(stories.isPublished, true)).orderBy(desc(stories.publishedAt)).limit(1);
    console.log("Success");
  } catch (err) {
    console.error("DB Error:", err);
  }
  process.exit(0);
}
main();
