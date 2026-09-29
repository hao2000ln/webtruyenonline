import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { chapters, stories } from "@/db/schema";

export const ADMIN_CHAPTERS_PAGE_SIZE = 10;
export const ADMIN_CHAPTER_PAGE_SIZES = [10, 20, 30, 50, 100] as const;
export type AdminChapterSort = "newest" | "oldest";

export async function getAdminChapterOptions() {
  return db.select({ id: stories.id, title: stories.title }).from(stories).orderBy(asc(stories.title));
}

export async function getAdminChapters({ query, storyId, sort, requestedPage, pageSize = ADMIN_CHAPTERS_PAGE_SIZE }: { query: string; storyId: string; sort: AdminChapterSort; requestedPage: number; pageSize?: number }) {
  const normalizedPageSize = ADMIN_CHAPTER_PAGE_SIZES.includes(pageSize as (typeof ADMIN_CHAPTER_PAGE_SIZES)[number]) ? pageSize : ADMIN_CHAPTERS_PAGE_SIZE;
  const normalizedQuery = query.trim().slice(0, 100);
  const conditions: SQL[] = [];
  if (storyId) conditions.push(eq(chapters.storyId, storyId));
  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;
    const search = or(ilike(chapters.title, pattern), sql`${chapters.chapterNumber}::text ilike ${pattern}`);
    if (search) conditions.push(search);
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [totalRow] = await db.select({ value: count() }).from(chapters).where(where);
  const total = totalRow?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / normalizedPageSize));
  const requested = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const page = Math.min(requested, totalPages);
  const order = sort === "oldest" ? asc(chapters.chapterNumber) : desc(chapters.chapterNumber);

  const rows = await db
    .select({
      id: chapters.id,
      storyId: chapters.storyId,
      storyTitle: stories.title,
      number: chapters.chapterNumber,
      title: chapters.title,
      wordCount: chapters.wordCount,
      isPublished: chapters.isPublished,
      publishedAt: chapters.publishedAt,
    })
    .from(chapters)
    .innerJoin(stories, eq(chapters.storyId, stories.id))
    .where(where)
    .orderBy(order, asc(chapters.id))
    .limit(normalizedPageSize)
    .offset((page - 1) * normalizedPageSize);

  return { chapters: rows, query: normalizedQuery, storyId, sort, page, total, totalPages, pageSize: normalizedPageSize };
}

export async function getAdminChapterForEdit(id: string) {
  const [chapter] = await db.select({
    id: chapters.id, storyId: chapters.storyId, chapterNumber: chapters.chapterNumber,
    title: chapters.title, slug: chapters.slug, content: chapters.content,
    wordCount: chapters.wordCount, isPublished: chapters.isPublished, publishedAt: chapters.publishedAt,
  }).from(chapters).where(eq(chapters.id, id)).limit(1);
  return chapter ?? null;
}
