import { and, desc, eq, isNotNull, isNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { chapters, readerAnnotations, stories } from "@/db/schema";

export async function getUserReaderAnnotations(userId: string) {
  return db
    .select({
      id: readerAnnotations.id,
      clientId: readerAnnotations.clientId,
      quoteText: readerAnnotations.quoteText,
      noteText: readerAnnotations.noteText,
      color: readerAnnotations.color,
      updatedAt: readerAnnotations.updatedAt,
      storyTitle: stories.title,
      storySlug: stories.slug,
      chapterTitle: chapters.title,
      chapterNumber: chapters.chapterNumber,
    })
    .from(readerAnnotations)
    .innerJoin(stories, eq(readerAnnotations.storyId, stories.id))
    .innerJoin(chapters, eq(readerAnnotations.chapterId, chapters.id))
    .where(and(
      eq(readerAnnotations.userId, userId),
      isNull(readerAnnotations.deletedAt),
      isNotNull(readerAnnotations.noteText),
      ne(readerAnnotations.noteText, ""),
    ))
    .orderBy(desc(readerAnnotations.updatedAt))
    .limit(300);
}
