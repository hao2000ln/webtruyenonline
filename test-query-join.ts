import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

async function fix() {
  try {
    const { db } = await import("./src/db/index.js");
    const { stories, authors } = await import("./src/db/schema.js");
    const { desc, eq } = await import("drizzle-orm");

    console.log("Running query with leftJoin...");
    const result = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        description: stories.description,
        coverUrl: stories.coverUrl,
        status: stories.status,
        totalChapters: stories.totalChapters,
        viewCount: stories.viewCount,
        latestChapterAt: stories.latestChapterAt,
        publishedAt: stories.publishedAt,
        authorName: authors.name,
      })
      .from(stories)
      .leftJoin(authors, eq(stories.authorId, authors.id))
      .where(eq(stories.isPublished, true))
      .orderBy(desc(stories.publishedAt))
      .limit(6);
    console.log("Success! Returned rows:", result.length);
  } catch (err) {
    console.error("Query Error:", err);
  }
  process.exit(0);
}
fix();
