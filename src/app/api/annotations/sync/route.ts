import { and, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { chapters, readerAnnotations, stories } from "@/db/schema";
import { ensureProfile } from "@/lib/auth/profile";
import { auth } from "@/lib/auth/server";
import { readerAnnotationSyncSchema } from "@/lib/validation/reader-annotation";

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  const user = session?.user;
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const payload = readerAnnotationSyncSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "invalid-payload" }, { status: 400 });

  await ensureProfile(user);
  const requestedChapterIds = [...new Set([
    ...payload.data.chapterIds,
    ...payload.data.records.map((record) => record.chapterId),
  ])];
  if (requestedChapterIds.length === 0) return NextResponse.json({ userId: user.id, records: [] });

  const chapterRows = await db
    .select({
      chapterId: chapters.id,
      chapterNumber: chapters.chapterNumber,
      chapterTitle: chapters.title,
      storyId: stories.id,
      storySlug: stories.slug,
      storyTitle: stories.title,
    })
    .from(chapters)
    .innerJoin(stories, eq(chapters.storyId, stories.id))
    .where(and(
      inArray(chapters.id, requestedChapterIds),
      eq(chapters.isPublished, true),
      eq(stories.isPublished, true),
    ));

  const chaptersById = new Map(chapterRows.map((chapter) => [chapter.chapterId, chapter]));
  const validRecords = payload.data.records.filter((record) => chaptersById.has(record.chapterId));

  if (validRecords.length > 0) {
    await db
      .insert(readerAnnotations)
      .values(validRecords.map((record) => {
        const chapter = chaptersById.get(record.chapterId)!;
        return {
          userId: user.id,
          storyId: chapter.storyId,
          chapterId: chapter.chapterId,
          clientId: record.clientId,
          quoteText: record.quoteText,
          prefixText: record.prefixText,
          suffixText: record.suffixText,
          startOffset: record.startOffset,
          endOffset: record.endOffset,
          color: record.color,
          noteText: record.noteText,
          contentHash: record.contentHash,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          deletedAt: record.deletedAt ? new Date(record.deletedAt) : null,
        };
      }))
      .onConflictDoUpdate({
        target: [readerAnnotations.userId, readerAnnotations.clientId],
        set: {
          storyId: sql`excluded.story_id`,
          chapterId: sql`excluded.chapter_id`,
          quoteText: sql`excluded.quote_text`,
          prefixText: sql`excluded.prefix_text`,
          suffixText: sql`excluded.suffix_text`,
          startOffset: sql`excluded.start_offset`,
          endOffset: sql`excluded.end_offset`,
          color: sql`excluded.color`,
          noteText: sql`excluded.note_text`,
          contentHash: sql`excluded.content_hash`,
          updatedAt: sql`excluded.updated_at`,
          deletedAt: sql`excluded.deleted_at`,
        },
        where: sql`${readerAnnotations.updatedAt} < excluded.updated_at`,
      });
  }

  const syncedRows = await db
    .select({
      clientId: readerAnnotations.clientId,
      storyId: stories.id,
      storySlug: stories.slug,
      storyTitle: stories.title,
      chapterId: chapters.id,
      chapterNumber: chapters.chapterNumber,
      chapterTitle: chapters.title,
      quoteText: readerAnnotations.quoteText,
      prefixText: readerAnnotations.prefixText,
      suffixText: readerAnnotations.suffixText,
      startOffset: readerAnnotations.startOffset,
      endOffset: readerAnnotations.endOffset,
      color: readerAnnotations.color,
      noteText: readerAnnotations.noteText,
      contentHash: readerAnnotations.contentHash,
      createdAt: readerAnnotations.createdAt,
      updatedAt: readerAnnotations.updatedAt,
      deletedAt: readerAnnotations.deletedAt,
    })
    .from(readerAnnotations)
    .innerJoin(chapters, eq(readerAnnotations.chapterId, chapters.id))
    .innerJoin(stories, eq(readerAnnotations.storyId, stories.id))
    .where(and(
      eq(readerAnnotations.userId, user.id),
      inArray(readerAnnotations.chapterId, requestedChapterIds),
    ));

  return NextResponse.json({
    userId: user.id,
    records: syncedRows.map((record) => ({
      ...record,
      ownerId: user.id,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      deletedAt: record.deletedAt?.toISOString() ?? null,
    })),
  });
}
