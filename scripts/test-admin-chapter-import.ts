import assert from "node:assert/strict";
import { count, eq } from "drizzle-orm";
import { db, dbClient } from "../src/db/index";
import { ChapterImportConflictError, importAdminChapters } from "../src/db/mutations/admin-chapter-import";
import { chapters, stories } from "../src/db/schema";
import { parseChapterImport } from "../src/lib/chapter-import";

const runId = Date.now();

async function main() {
  const textChapters = parseChapterImport("Chương 1: Mở đầu\nMột hai ba.\n\n## Chương 2 - Tiếp theo\nBốn năm.", "text");
  assert.equal(textChapters.length, 2);
  assert.equal(textChapters[1]?.slug, "chuong-2-tiep-theo");
  const jsonChapters = parseChapterImport('[{"number":"3","title":"JSON","content":"Nội dung"}]', "json");
  assert.equal(jsonChapters[0]?.chapterNumber, "3");

  const [story] = await db.insert(stories).values({
    title: "TC Chapter Import",
    slug: `tc-chapter-import-${runId}`,
    isPublished: true,
    publishedAt: new Date(),
  }).returning({ id: stories.id });

  try {
    const draftResult = await importAdminChapters({
      storyId: story.id,
      publishMode: "draft",
      conflictMode: "abort",
      applyPublishModeToUpdates: false,
      chapters: [
        { chapterNumber: "1", title: "Mở đầu", slug: "chuong-1-mo-dau", content: '<p onclick="alert(1)">một hai ba</p><script>alert(1)</script>' },
        { chapterNumber: "2", title: "Tiếp theo", slug: "chuong-2-tiep-theo", content: "bốn năm" },
      ],
    });
    assert.equal(draftResult.imported, 2);
    const [afterDraft] = await db.select({ total: stories.totalChapters }).from(stories).where(eq(stories.id, story.id));
    assert.equal(afterDraft.total, 0, "Draft chapters must not affect published totals");
    const [stored] = await db.select({ content: chapters.content, words: chapters.wordCount }).from(chapters).where(eq(chapters.slug, "chuong-1-mo-dau"));
    assert.doesNotMatch(stored.content, /onclick|script|alert/iu);
    assert.equal(stored.words, 3);

    const [beforeUpdate] = await db.select({ id: chapters.id, createdAt: chapters.createdAt, viewCount: chapters.viewCount }).from(chapters).where(eq(chapters.slug, "chuong-1-mo-dau"));
    const updateResult = await importAdminChapters({
      storyId: story.id,
      publishMode: "publish",
      conflictMode: "update",
      applyPublishModeToUpdates: false,
      chapters: [{ chapterNumber: "1", title: "Mở đầu đã sửa", slug: "chuong-1-mo-dau", content: "nội dung mới an toàn" }],
    });
    assert.deepEqual({ imported: updateResult.imported, updated: updateResult.updated }, { imported: 0, updated: 1 });
    const [afterUpdate] = await db.select({ id: chapters.id, createdAt: chapters.createdAt, viewCount: chapters.viewCount, title: chapters.title, isPublished: chapters.isPublished }).from(chapters).where(eq(chapters.slug, "chuong-1-mo-dau"));
    assert.equal(afterUpdate.id, beforeUpdate.id);
    assert.equal(afterUpdate.createdAt.getTime(), beforeUpdate.createdAt.getTime());
    assert.equal(afterUpdate.viewCount, beforeUpdate.viewCount);
    assert.equal(afterUpdate.title, "Mở đầu đã sửa");
    assert.equal(afterUpdate.isPublished, false, "Update must preserve publication state by default");

    await importAdminChapters({
      storyId: story.id,
      publishMode: "publish",
      conflictMode: "update",
      applyPublishModeToUpdates: true,
      chapters: [{ chapterNumber: "1", title: "Mở đầu đã sửa", slug: "chuong-1-mo-dau", content: "nội dung mới an toàn" }],
    });
    const [afterUpdatePublish] = await db.select({ total: stories.totalChapters }).from(stories).where(eq(stories.id, story.id));
    assert.equal(afterUpdatePublish.total, 1, "Applying publish mode must update story aggregates");

    await assert.rejects(
      () => importAdminChapters({
        storyId: story.id,
        publishMode: "publish",
        conflictMode: "abort",
        applyPublishModeToUpdates: false,
        chapters: [
          { chapterNumber: "2", title: "Trùng", slug: "chuong-2-trung", content: "trùng" },
          { chapterNumber: "3", title: "Không được lưu", slug: "chuong-3-khong-luu", content: "không lưu" },
        ],
      }),
      ChapterImportConflictError,
    );
    const [afterRollback] = await db.select({ value: count() }).from(chapters).where(eq(chapters.storyId, story.id));
    assert.equal(afterRollback.value, 2, "Conflict must roll back the complete import");

    const publishResult = await importAdminChapters({
      storyId: story.id,
      publishMode: "publish",
      conflictMode: "skip",
      applyPublishModeToUpdates: false,
      chapters: [
        { chapterNumber: "2", title: "Trùng", slug: "chuong-2-trung", content: "trùng" },
        { chapterNumber: "3", title: "Xuất bản", slug: "chuong-3-xuat-ban", content: "sáu bảy tám" },
      ],
    });
    assert.deepEqual({ imported: publishResult.imported, skipped: publishResult.skipped }, { imported: 1, skipped: 1 });
    const [afterPublish] = await db.select({ total: stories.totalChapters, latest: stories.latestChapterAt }).from(stories).where(eq(stories.id, story.id));
    assert.equal(afterPublish.total, 2);
    assert.ok(afterPublish.latest);

    console.log("Admin chapter bulk import tests passed");
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
