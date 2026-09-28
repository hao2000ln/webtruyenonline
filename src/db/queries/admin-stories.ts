import { and, asc, count, desc, eq, ilike, ne, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { authors, genres, stories, storyGenres } from "@/db/schema";

export const ADMIN_STORIES_PAGE_SIZE = 10;
export const ADMIN_PAGE_SIZES = [10, 20, 30, 50, 100] as const;
export function normalizeAdminPageSize(value: number, fallback: number) { return ADMIN_PAGE_SIZES.includes(value as (typeof ADMIN_PAGE_SIZES)[number]) ? value : fallback; }
export type AdminStoryStatus = "ONGOING" | "COMPLETED" | "HIATUS";

function normalizePage(page: number) {
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export async function getAdminStories({
  query,
  status,
  requestedPage,
  pageSize = ADMIN_STORIES_PAGE_SIZE,
}: {
  query: string;
  status: AdminStoryStatus | "";
  requestedPage: number;
  pageSize?: number;
}) {
  const normalizedPageSize = normalizeAdminPageSize(pageSize, ADMIN_STORIES_PAGE_SIZE);
  const normalizedQuery = query.trim().slice(0, 100);
  const conditions: SQL[] = [];

  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;
    const search = or(ilike(stories.title, pattern), ilike(authors.name, pattern));
    if (search) conditions.push(search);
  }
  if (status) conditions.push(eq(stories.status, status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [totalRow] = await db
    .select({ value: count(stories.id) })
    .from(stories)
    .leftJoin(authors, eq(stories.authorId, authors.id))
    .where(where);

  const total = totalRow?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / normalizedPageSize));
  const page = Math.min(normalizePage(requestedPage), totalPages);
  const rows = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      authorName: authors.name,
      status: stories.status,
      totalChapters: stories.totalChapters,
      viewCount: stories.viewCount,
      latestChapterAt: stories.latestChapterAt,
      isPublished: stories.isPublished,
    })
    .from(stories)
    .leftJoin(authors, eq(stories.authorId, authors.id))
    .where(where)
    .orderBy(desc(stories.updatedAt), asc(stories.title))
    .limit(normalizedPageSize)
    .offset((page - 1) * normalizedPageSize);

  return { stories: rows, query: normalizedQuery, status, page, total, totalPages, pageSize: normalizedPageSize };
}

export async function getAdminStoryOptions() {
  const authorRows = await db
    .select({ id: authors.id, name: authors.name })
    .from(authors)
    .orderBy(asc(authors.name));
  const genreRows = await db
    .select({ id: genres.id, name: genres.name })
    .from(genres)
    .orderBy(asc(genres.name));
  return { authors: authorRows, genres: genreRows };
}

export async function getAdminStoryForEdit(id: string) {
  const [story] = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      originalTitle: stories.originalTitle,
      description: stories.description,
      coverUrl: stories.coverUrl,
      authorId: stories.authorId,
      status: stories.status,
      isPublished: stories.isPublished,
    })
    .from(stories)
    .where(eq(stories.id, id))
    .limit(1);

  if (!story) return null;

  const genreRows = await db
    .select({ genreId: storyGenres.genreId })
    .from(storyGenres)
    .where(eq(storyGenres.storyId, id));

  return { ...story, genreIds: genreRows.map((row) => row.genreId) };
}

export async function isStorySlugTaken(slug: string, exceptId?: string) {
  const condition = exceptId
    ? and(eq(stories.slug, slug), ne(stories.id, exceptId))
    : eq(stories.slug, slug);
  const [story] = await db.select({ id: stories.id }).from(stories).where(condition).limit(1);
  return Boolean(story);
}
