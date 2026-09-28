import { and, count, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { chapters, stories } from "@/db/schema";
import { countChapterWords, sanitizeChapterContent } from "@/lib/chapter-content";
import type { AdminChapterImportInput } from "@/lib/validation/admin-chapter-import";

export class ChapterImportConflictError extends Error {
  constructor(public readonly conflicts: string[]) {
    super(`Có ${conflicts.length} chương xung đột với dữ liệu hiện tại.`);
  }
}

export class ChapterImportStoryNotFoundError extends Error {}

function normalizedChapterNumber(value: string) {
  return Number(value).toFixed(3);
}

function isUniqueViolation(error: unknown) {
  let current: unknown = error;
  while (typeof current === "object" && current !== null) {
    if ("code" in current && current.code === "23505") return true;
    current = "cause" in current ? current.cause : null;
  }
  return false;
}

export async function importAdminChapters(input: AdminChapterImportInput) {
  try {
    return await db.transaction(async (transaction) => {
      const [story] = await transaction
        .select({ id: stories.id, slug: stories.slug })
        .from(stories)
        .where(eq(stories.id, input.storyId))
        .limit(1);
      if (!story) throw new ChapterImportStoryNotFoundError("Truyện không còn tồn tại.");

      const existing = await transaction
        .select({
          id: chapters.id,
          chapterNumber: chapters.chapterNumber,
          slug: chapters.slug,
          isPublished: chapters.isPublished,
          publishedAt: chapters.publishedAt,
        })
        .from(chapters)
        .where(eq(chapters.storyId, input.storyId));
      const existingByNumber = new Map(existing.map((chapter) => [normalizedChapterNumber(chapter.chapterNumber), chapter]));
      const slugOwners = new Map(existing.map((chapter) => [chapter.slug, chapter.id]));
      const seenInputNumbers = new Set<string>();
      const reservedInputSlugs = new Set<string>();
      const inserts: AdminChapterImportInput["chapters"] = [];
      const updates: Array<{ chapter: AdminChapterImportInput["chapters"][number]; existing: (typeof existing)[number] }> = [];
      const conflicts: string[] = [];

      for (const chapter of input.chapters) {
        const numberKey = normalizedChapterNumber(chapter.chapterNumber);
        const existingChapter = existingByNumber.get(numberKey);
        const slugOwner = slugOwners.get(chapter.slug);
        const duplicateInFile = seenInputNumbers.has(numberKey) || reservedInputSlugs.has(chapter.slug);
        const slugBelongsToAnotherChapter = Boolean(slugOwner && slugOwner !== existingChapter?.id);
        seenInputNumbers.add(numberKey);
        reservedInputSlugs.add(chapter.slug);

        if (duplicateInFile || slugBelongsToAnotherChapter) {
          conflicts.push(`Chương ${chapter.chapterNumber}: ${duplicateInFile ? "bị lặp trong file import" : "slug thuộc về chương khác"}`);
          continue;
        }

        if (existingChapter) {
          if (input.conflictMode === "update") updates.push({ chapter, existing: existingChapter });
          else conflicts.push(`Chương ${chapter.chapterNumber}: đã tồn tại`);
          continue;
        }
        inserts.push(chapter);
      }

      if (conflicts.length > 0 && input.conflictMode === "abort") throw new ChapterImportConflictError(conflicts);

      const now = new Date();
      if (inserts.length > 0) {
        await transaction.insert(chapters).values(inserts.map((chapter) => {
          const content = sanitizeChapterContent(chapter.content);
          return {
            storyId: input.storyId,
            chapterNumber: chapter.chapterNumber,
            title: chapter.title,
            slug: chapter.slug,
            content,
            wordCount: countChapterWords(content),
            isPublished: input.publishMode === "publish",
            publishedAt: input.publishMode === "publish" ? now : null,
          };
        }));
      }

      for (const { chapter, existing: current } of updates) {
        const content = sanitizeChapterContent(chapter.content);
        const applyPublishMode = input.applyPublishModeToUpdates;
        const isPublished = applyPublishMode ? input.publishMode === "publish" : current.isPublished;
        const publishedAt = applyPublishMode
          ? (isPublished ? current.publishedAt ?? now : null)
          : current.publishedAt;
        await transaction
          .update(chapters)
          .set({
            title: chapter.title,
            slug: chapter.slug,
            content,
            wordCount: countChapterWords(content),
            isPublished,
            publishedAt,
            updatedAt: now,
          })
          .where(eq(chapters.id, current.id));
      }

      const [stats] = await transaction
        .select({ total: count(), latest: max(chapters.publishedAt) })
        .from(chapters)
        .where(and(eq(chapters.storyId, input.storyId), eq(chapters.isPublished, true)));
      await transaction
        .update(stories)
        .set({ totalChapters: stats?.total ?? 0, latestChapterAt: stats?.latest ?? null, updatedAt: now })
        .where(eq(stories.id, input.storyId));

      return {
        imported: inserts.length,
        updated: updates.length,
        skipped: conflicts.length,
        conflicts,
        storySlug: story.slug,
      };
    });
  } catch (error) {
    if (error instanceof ChapterImportConflictError || error instanceof ChapterImportStoryNotFoundError) throw error;
    if (isUniqueViolation(error)) throw new ChapterImportConflictError(["Dữ liệu đã thay đổi trong lúc import. Hãy tải lại và kiểm tra danh sách chương."]);
    throw error;
  }
}
