import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { db, dbClient } from "../src/db/index";
import {
  ChapterConflictError,
  createAdminChapter,
  deleteAdminChapter,
  updateAdminChapter,
} from "../src/db/mutations/admin-chapters";
import { getAdminChapterForEdit, getAdminChapters } from "../src/db/queries/admin-chapters";
import { chapters, stories } from "../src/db/schema";

const runId = Date.now();

async function storyAggregates(storyId: string) {
  const [result] = await db
    .select({ total: stories.totalChapters, latest: stories.latestChapterAt })
    .from(stories)
    .where(eq(stories.id, storyId));
  return result;
}

async function main() {
  const [firstStory, secondStory] = await db
    .insert(stories)
    .values([
      { title: "TC Chapters A", slug: `tc-chapters-a-${runId}`, isPublished: true, publishedAt: new Date() },
      { title: "TC Chapters B", slug: `tc-chapters-b-${runId}`, isPublished: true, publishedAt: new Date() },
    ])
    .returning({ id: stories.id });

  try {
    const first = await createAdminChapter({
      storyId: firstStory.id,
      chapterNumber: "1",
      title: "Mở đầu",
      slug: "mo-dau",
      content: '<p onclick="alert(1)">một hai <strong>ba</strong> bốn</p><script>alert("x")</script>',
      isPublished: true,
      publishedAt: "2026-01-01T08:00",
    });
    const second = await createAdminChapter({
      storyId: firstStory.id,
      chapterNumber: "2",
      title: "Tiếp theo",
      slug: "tiep-theo",
      content: "<p>năm sáu</p>",
      isPublished: false,
      publishedAt: "2026-02-01T08:00",
    });

    const storedFirst = await getAdminChapterForEdit(first.id);
    assert.equal(storedFirst?.wordCount, 4);
    assert.doesNotMatch(storedFirst?.content ?? "", /onclick|script|alert/iu);
    assert.equal((await storyAggregates(firstStory.id)).total, 1, "Draft must not increase total chapters");

    await assert.rejects(
      () => createAdminChapter({
        storyId: firstStory.id,
        chapterNumber: "2",
        title: "Trùng số chương",
        slug: "trung-so-chuong",
        content: "nội dung",
        isPublished: false,
        publishedAt: "",
      }),
      ChapterConflictError,
    );

    await updateAdminChapter(second.id, {
      storyId: firstStory.id,
      chapterNumber: "2",
      title: "Tiếp theo",
      slug: "tiep-theo",
      content: "<p>năm sáu bảy</p>",
      isPublished: true,
      publishedAt: "2026-02-01T08:00",
    });
    const afterPublish = await storyAggregates(firstStory.id);
    assert.equal(afterPublish.total, 2);
    assert.ok(afterPublish.latest);

    await updateAdminChapter(first.id, {
      storyId: firstStory.id,
      chapterNumber: "1",
      title: "Mở đầu",
      slug: "mo-dau",
      content: "<p>một hai ba bốn</p>",
      isPublished: false,
      publishedAt: "",
    });
    assert.equal((await storyAggregates(firstStory.id)).total, 1, "Unpublish must decrease total chapters");

    const list = await getAdminChapters({ query: "Mở", storyId: firstStory.id, sort: "newest", requestedPage: 99 });
    assert.equal(list.total, 1);
    assert.equal(list.page, 1);
    assert.equal(list.chapters[0]?.wordCount, 4);

    await updateAdminChapter(second.id, {
      storyId: secondStory.id,
      chapterNumber: "2",
      title: "Tiếp theo",
      slug: "tiep-theo",
      content: "<p>năm sáu bảy</p>",
      isPublished: true,
      publishedAt: "2026-02-01T08:00",
    });
    assert.deepEqual(await storyAggregates(firstStory.id), { total: 0, latest: null });
    assert.equal((await storyAggregates(secondStory.id)).total, 1, "Moving a chapter must sync the new story");

    await deleteAdminChapter(second.id);
    assert.deepEqual(await storyAggregates(secondStory.id), { total: 0, latest: null });
    await deleteAdminChapter(first.id);
    assert.deepEqual(await storyAggregates(firstStory.id), { total: 0, latest: null });

    console.log("Admin chapter CRUD tests passed");
  } finally {
    await db.delete(chapters).where(eq(chapters.storyId, firstStory.id));
    await db.delete(chapters).where(eq(chapters.storyId, secondStory.id));
    await db.delete(stories).where(eq(stories.id, firstStory.id));
    await db.delete(stories).where(eq(stories.id, secondStory.id));
    await dbClient.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
