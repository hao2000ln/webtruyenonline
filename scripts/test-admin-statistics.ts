import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { db, dbClient } from "../src/db/index";
import { recordChapterView } from "../src/db/mutations/public-views";
import { getAdminDashboard } from "../src/db/queries/admin-dashboard";
import { chapters, stories } from "../src/db/schema";

async function main() {
  const suffix = Date.now();
  const [story] = await db.insert(stories).values({
    title: "TC Admin Statistics",
    slug: `tc-admin-statistics-${suffix}`,
    status: "ONGOING",
    isPublished: true,
    publishedAt: new Date(),
  }).returning({ id: stories.id });
  const [chapter] = await db.insert(chapters).values({
    storyId: story.id,
    chapterNumber: "1",
    title: "Statistics",
    slug: "statistics",
    content: "nội dung",
    isPublished: true,
    publishedAt: new Date(),
  }).returning({ id: chapters.id });

  try {
    await recordChapterView(story.id, chapter.id);
    await recordChapterView(story.id, chapter.id);
    const [views] = await db.select({ story: stories.viewCount }).from(stories).where(eq(stories.id, story.id));
    const [chapterViews] = await db.select({ chapter: chapters.viewCount }).from(chapters).where(eq(chapters.id, chapter.id));
    assert.equal(views.story, 2);
    assert.equal(chapterViews.chapter, 2);

    const dashboard = await getAdminDashboard();
    assert.ok(dashboard.stats.totalViews >= 2);
    assert.ok(dashboard.stats.staleStories >= 1);
    assert.ok(dashboard.topStories.length <= 5);
    assert.ok(dashboard.staleStories.length <= 5);
    console.log("Admin lightweight statistics tests passed");
  } finally {
    await db.delete(chapters).where(eq(chapters.storyId, story.id));
    await db.delete(stories).where(eq(stories.id, story.id));
    await dbClient.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
