import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { count, eq, ilike, inArray } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";
import { db, dbClient } from "../src/db/index";
import {
  createAdminStory,
  deleteAdminStory,
  StorySlugConflictError,
  updateAdminStory,
} from "../src/db/mutations/admin-stories";
import { getAdminStories, getAdminStoryForEdit } from "../src/db/queries/admin-stories";
import { getStoryDetail } from "../src/db/queries/stories";
import { authors, chapters, genres, stories, storyGenres } from "../src/db/schema";
import { isAdminUser } from "../src/lib/auth/roles";
import { adminStorySchema } from "../src/lib/validation/admin-story";

const suffix = `${Date.now()}-${randomUUID().slice(0, 8)}`;
const slugPrefix = `tc-story-${suffix}`;
const titlePrefix = `TC-${suffix}`;
const authorIds: string[] = [];
const genreIds: string[] = [];

function pass(id: string, message: string) {
  console.log(`${id} PASS - ${message}`);
}

async function main() {
try {
  const [authorOne] = await db.insert(authors).values({
    name: `Author-${suffix}`,
    slug: `author-${suffix}`,
  }).returning({ id: authors.id, name: authors.name });
  const [authorTwo] = await db.insert(authors).values({
    name: `Author-Updated-${suffix}`,
    slug: `author-updated-${suffix}`,
  }).returning({ id: authors.id });
  authorIds.push(authorOne.id, authorTwo.id);

  const insertedGenres = await db.insert(genres).values([
    { name: `Genre-A-${suffix}`, slug: `genre-a-${suffix}` },
    { name: `Genre-B-${suffix}`, slug: `genre-b-${suffix}` },
  ]).returning({ id: genres.id });
  genreIds.push(...insertedGenres.map((genre) => genre.id));

  const targetInput = adminStorySchema.parse({
    title: `${titlePrefix}-Needle`,
    slug: `${slugPrefix}-needle`,
    originalTitle: "",
    description: "Integration test story",
    coverUrl: "",
    authorId: authorOne.id,
    status: "COMPLETED",
    genreIds: [genreIds[0]],
    isPublished: true,
  });
  const target = await createAdminStory(targetInput);
  assert.ok(target.id);
  pass("TC06", "create story bằng production mutation thành công");

  const fixtureValues = Array.from({ length: 24 }, (_, index) => ({
    title: `${titlePrefix}-Story-${String(index + 1).padStart(2, "0")}`,
    slug: `${slugPrefix}-${index + 1}`,
    authorId: authorOne.id,
    status: index % 3 === 0 ? "COMPLETED" as const : index % 3 === 1 ? "ONGOING" as const : "HIATUS" as const,
    isPublished: true,
    publishedAt: new Date(),
  }));
  await db.insert(stories).values(fixtureValues);

  const list = await getAdminStories({ query: titlePrefix, status: "", requestedPage: 1 });
  assert.equal(list.total, 25);
  assert.equal(list.stories.length, 20);
  assert.ok(list.stories.every((story) => story.title && "totalChapters" in story && "viewCount" in story));
  pass("TC01", "list trả dữ liệu thật và đủ cột");

  const titleSearch = await getAdminStories({ query: `${titlePrefix}-Needle`, status: "", requestedPage: 1 });
  assert.equal(titleSearch.total, 1);
  assert.equal(titleSearch.stories[0]?.id, target.id);
  pass("TC02", "search title đúng");

  const authorSearch = await getAdminStories({ query: authorOne.name, status: "", requestedPage: 1 });
  assert.equal(authorSearch.total, 25);
  pass("TC03", "search author đúng");

  const expectedCompleted = 1 + fixtureValues.filter((story) => story.status === "COMPLETED").length;
  const statusFilter = await getAdminStories({ query: titlePrefix, status: "COMPLETED", requestedPage: 1 });
  assert.equal(statusFilter.total, expectedCompleted);
  assert.ok(statusFilter.stories.every((story) => story.status === "COMPLETED"));
  pass("TC04", "filter status đúng");

  const secondPage = await getAdminStories({ query: titlePrefix, status: "", requestedPage: 2 });
  assert.equal(secondPage.totalPages, 2);
  assert.equal(secondPage.page, 2);
  assert.equal(secondPage.stories.length, 5);
  pass("TC05", "pagination server-side đúng");

  await assert.rejects(() => createAdminStory(targetInput), StorySlugConflictError);
  pass("TC07", "duplicate slug bị chặn");

  const updatedSlug = `${slugPrefix}-updated`;
  const updatedTitle = `${titlePrefix}-Updated-Public`;
  const updateResult = await updateAdminStory(target.id, {
    ...targetInput,
    title: updatedTitle,
    slug: updatedSlug,
    authorId: authorTwo.id,
    genreIds: [genreIds[1]],
  });
  assert.ok(updateResult);
  const publicStory = await getStoryDetail(updatedSlug);
  assert.equal(publicStory?.title, updatedTitle);
  pass("TC08", "edit được public query đọc thấy ngay");

  const editedStory = await getAdminStoryForEdit(target.id);
  assert.equal(editedStory?.authorId, authorTwo.id);
  assert.deepEqual(editedStory?.genreIds, [genreIds[1]]);
  pass("TC09", "đổi author và genres đúng");

  await db.insert(chapters).values({
    storyId: target.id,
    chapterNumber: "1",
    title: "Cascade chapter",
    slug: "chuong-1",
    content: "Test",
    isPublished: true,
    publishedAt: new Date(),
  });
  await deleteAdminStory(target.id);
  const [storyCount] = await db.select({ value: count() }).from(stories).where(eq(stories.id, target.id));
  const [chapterCount] = await db.select({ value: count() }).from(chapters).where(eq(chapters.storyId, target.id));
  const [genreCount] = await db.select({ value: count() }).from(storyGenres).where(eq(storyGenres.storyId, target.id));
  assert.equal(storyCount.value, 0);
  assert.equal(chapterCount.value, 0);
  assert.equal(genreCount.value, 0);
  pass("TC10", "delete cascade không lỗi FK; confirm được kiểm tra ở component UI");

  const regularUser = { app_metadata: { role: "user" } } as unknown as User;
  assert.equal(isAdminUser(regularUser), false);
  const actionSource = await readFile(
    "src/app/admin/(dashboard)/stories/actions.ts",
    "utf8",
  );
  assert.equal((actionSource.match(/await requireAdmin\(\)/g) ?? []).length, 3);
  pass("TC11", "cả 3 mutation đều gọi requireAdmin; user thường không đạt role check");
} finally {
  await db.delete(stories).where(ilike(stories.slug, `${slugPrefix}%`));
  if (authorIds.length > 0) await db.delete(authors).where(inArray(authors.id, authorIds));
  if (genreIds.length > 0) {
    await db.delete(genres).where(inArray(genres.id, genreIds));
  }
  const [remainingStories] = await db.select({ value: count() }).from(stories).where(ilike(stories.slug, `${slugPrefix}%`));
  assert.equal(remainingStories.value, 0, "Temporary story fixtures were not cleaned up");
  console.log("CLEANUP PASS - không còn story fixture của test run");
  await dbClient.end();
}
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
