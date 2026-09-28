import { and, count, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { chapters, stories } from "@/db/schema";
import { countChapterWords, sanitizeChapterContent } from "@/lib/chapter-content";
import type { AdminChapterInput } from "@/lib/validation/admin-chapter";

export class ChapterConflictError extends Error {}

function isUniqueViolation(error: unknown) {
  let current: unknown = error;
  while (typeof current === "object" && current !== null) {
    if ("code" in current && current.code === "23505") return true;
    current = "cause" in current ? current.cause : null;
  }
  return false;
}

function publishedDate(input: AdminChapterInput) {
  return input.isPublished ? (input.publishedAt ? new Date(input.publishedAt) : new Date()) : null;
}

async function syncStoryAggregates(transaction: Parameters<Parameters<typeof db.transaction>[0]>[0], storyId: string) {
  const [stats] = await transaction.select({ total: count(), latest: max(chapters.publishedAt) }).from(chapters)
    .where(and(eq(chapters.storyId, storyId), eq(chapters.isPublished, true)));
  await transaction.update(stories).set({ totalChapters: stats?.total ?? 0, latestChapterAt: stats?.latest ?? null, updatedAt: new Date() }).where(eq(stories.id, storyId));
}

export async function createAdminChapter(input: AdminChapterInput) {
  try {
    return await db.transaction(async (transaction) => {
      const sanitizedContent = sanitizeChapterContent(input.content);
      const [chapter] = await transaction.insert(chapters).values({
        storyId: input.storyId, chapterNumber: input.chapterNumber, title: input.title,
        slug: input.slug, content: sanitizedContent, wordCount: countChapterWords(sanitizedContent),
        isPublished: input.isPublished, publishedAt: publishedDate(input),
      }).returning({ id: chapters.id, storyId: chapters.storyId });
      await syncStoryAggregates(transaction, input.storyId);
      return chapter;
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new ChapterConflictError("Số chương hoặc slug đã tồn tại trong truyện.");
    throw error;
  }
}

export async function updateAdminChapter(id: string, input: AdminChapterInput) {
  const existing = await getExisting(id);
  if (!existing) return null;
  try {
    return await db.transaction(async (transaction) => {
      const sanitizedContent = sanitizeChapterContent(input.content);
      const [chapter] = await transaction.update(chapters).set({
        storyId: input.storyId, chapterNumber: input.chapterNumber, title: input.title,
        slug: input.slug, content: sanitizedContent, wordCount: countChapterWords(sanitizedContent),
        isPublished: input.isPublished, publishedAt: publishedDate(input), updatedAt: new Date(),
      }).where(eq(chapters.id, id)).returning({ id: chapters.id, storyId: chapters.storyId });
      await syncStoryAggregates(transaction, existing.storyId);
      if (existing.storyId !== input.storyId) await syncStoryAggregates(transaction, input.storyId);
      return { ...chapter, oldStoryId: existing.storyId };
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new ChapterConflictError("Số chương hoặc slug đã tồn tại trong truyện.");
    throw error;
  }
}

async function getExisting(id: string) {
  const [row] = await db.select({ id: chapters.id, storyId: chapters.storyId }).from(chapters).where(eq(chapters.id, id)).limit(1);
  return row ?? null;
}

export async function deleteAdminChapter(id: string) {
  const existing = await getExisting(id);
  if (!existing) return null;
  await db.transaction(async (transaction) => {
    await transaction.delete(chapters).where(eq(chapters.id, id));
    await syncStoryAggregates(transaction, existing.storyId);
  });
  return existing;
}
