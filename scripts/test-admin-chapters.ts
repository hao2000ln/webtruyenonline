import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { db, dbClient } from "../src/db/index";
import { ChapterConflictError, createAdminChapter, deleteAdminChapter, updateAdminChapter } from "../src/db/mutations/admin-chapters";
import { getAdminChapterForEdit, getAdminChapters } from "../src/db/queries/admin-chapters";
import { chapters, stories } from "../src/db/schema";

const slug = `tc-chapters-${Date.now()}`;

async function main() {
  const [story] = await db.insert(stories).values({ title: "TC Chapters", slug, isPublished: true, publishedAt: new Date() }).returning({ id: stories.id });
  try {
    const first = await createAdminChapter({ storyId: story.id, chapterNumber: "1", title: "Mở đầu", slug: "mo-dau", content: "một hai ba bốn", isPublished: true, publishedAt: "2026-01-01T08:00" });
    const second = await createAdminChapter({ storyId: story.id, chapterNumber: "2", title: "Tiếp theo", slug: "tiep-theo", content: "năm sáu", isPublished: true, publishedAt: "2026-02-01T08:00" });
    const edited = await getAdminChapterForEdit(first.id);
    assert.equal(edited?.content, "một hai ba bốn");
    const [aggregate] = await db.select({ total: stories.totalChapters, latest: stories.latestChapterAt }).from(stories).where(eq(stories.id, story.id));
    assert.equal(aggregate.total, 2); assert.ok(aggregate.latest);
    await assert.rejects(() => createAdminChapter({ storyId: story.id, chapterNumber: "2", title: "Trùng", slug: "trung", content: "x", isPublished: false, publishedAt: "" }), ChapterConflictError);
    await updateAdminChapter(second.id, { storyId: story.id, chapterNumber: "2", title: "Tiếp theo", slug: "tiep-theo", content: "năm sáu bảy", isPublished: false, publishedAt: "" });
    const [afterUnpublish] = await db.select({ total: stories.totalChapters }).from(stories).where(eq(stories.id, story.id));
    assert.equal(afterUnpublish.total, 1);
    const list = await getAdminChapters({ query: "Mở", storyId: story.id, sort: "newest", requestedPage: 99 });
    assert.equal(list.total, 1); assert.equal(list.page, 1); assert.equal(list.chapters[0]?.wordCount, 4);
    await deleteAdminChapter(first.id);
    const [afterDelete] = await db.select({ total: stories.totalChapters, latest: stories.latestChapterAt }).from(stories).where(eq(stories.id, story.id));
    assert.equal(afterDelete.total, 0); assert.equal(afterDelete.latest, null);
    console.log("Admin chapter CRUD tests passed");
  } finally {
    await db.delete(chapters).where(eq(chapters.storyId, story.id));
    await db.delete(stories).where(eq(stories.id, story.id));
    await dbClient.end();
  }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
