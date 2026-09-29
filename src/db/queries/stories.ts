import { cache } from "react";
import { and, asc, count, desc, eq, gt, ilike, lt, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { authors, chapters, genres, stories, storyGenres } from "@/db/schema";

const storyCardSelection = {
  id: stories.id,
  title: stories.title,
  slug: stories.slug,
  description: stories.description,
  coverUrl: stories.coverUrl,
  status: stories.status,
  totalChapters: stories.totalChapters,
  viewCount: stories.viewCount,
  latestChapterAt: stories.latestChapterAt,
  publishedAt: stories.publishedAt,
  authorName: authors.name,
};

async function selectStoryCards(where: SQL, orderBy: SQL, limit = 5) {
  return db
    .select(storyCardSelection)
    .from(stories)
    .leftJoin(authors, eq(stories.authorId, authors.id))
    .where(where)
    .orderBy(orderBy)
    .limit(limit);
}

export type StoryCardData = Awaited<ReturnType<typeof selectStoryCards>>[number];

export const CHAPTERS_PER_PAGE = 50;
export type ChapterSort = "newest" | "oldest";

export const getHomepageStories = cache(async () => {
  const published = eq(stories.isPublished, true);

  // Run homepage queries in parallel for high throughput and minimum latency
  const [latestUpdated, newest, hot, completed, allGenres] = await Promise.all([
    selectStoryCards(published, desc(stories.latestChapterAt), 8),
    selectStoryCards(published, desc(stories.publishedAt), 6),
    selectStoryCards(published, desc(stories.viewCount), 10),
    selectStoryCards(
      and(published, eq(stories.status, "COMPLETED"))!,
      desc(stories.latestChapterAt),
      6,
    ),
    db
      .select({ id: genres.id, name: genres.name, slug: genres.slug })
      .from(genres)
      .orderBy(asc(genres.name)),
  ]);

  return { latestUpdated, newest, hot, completed, allGenres };
});

export const getStoryDetail = cache(async (slug: string) => {
  const [story] = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      originalTitle: stories.originalTitle,
      description: stories.description,
      coverUrl: stories.coverUrl,
      status: stories.status,
      totalChapters: stories.totalChapters,
      viewCount: stories.viewCount,
      followCount: stories.followCount,
      ratingAvg: stories.ratingAvg,
      ratingCount: stories.ratingCount,
      latestChapterAt: stories.latestChapterAt,
      publishedAt: stories.publishedAt,
      authorName: authors.name,
      authorSlug: authors.slug,
    })
    .from(stories)
    .leftJoin(authors, eq(stories.authorId, authors.id))
    .where(and(eq(stories.slug, slug), eq(stories.isPublished, true)))
    .limit(1);

  if (!story) {
    return null;
  }

  // Parallelize genres, first chapter, and latest chapter queries
  const [storyGenreRows, [firstChapter], [latestChapter]] = await Promise.all([
    db
      .select({ id: genres.id, name: genres.name, slug: genres.slug })
      .from(storyGenres)
      .innerJoin(genres, eq(storyGenres.genreId, genres.id))
      .where(eq(storyGenres.storyId, story.id))
      .orderBy(asc(genres.name)),
    db
      .select({ number: chapters.chapterNumber, title: chapters.title })
      .from(chapters)
      .where(and(eq(chapters.storyId, story.id), eq(chapters.isPublished, true)))
      .orderBy(asc(chapters.chapterNumber))
      .limit(1),
    db
      .select({ number: chapters.chapterNumber, title: chapters.title })
      .from(chapters)
      .where(and(eq(chapters.storyId, story.id), eq(chapters.isPublished, true)))
      .orderBy(desc(chapters.chapterNumber))
      .limit(1),
  ]);

  return {
    ...story,
    genres: storyGenreRows,
    firstChapter: firstChapter ?? null,
    latestChapter: latestChapter ?? null,
  };
});

export const getStoryChapters = cache(async function getStoryChapters(
  storyId: string,
  query: string,
  sort: ChapterSort,
  requestedPage: number,
) {
  const normalizedQuery = query.trim().slice(0, 100);
  const safePage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const conditions: SQL[] = [
    eq(chapters.storyId, storyId),
    eq(chapters.isPublished, true),
  ];

  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;
    const searchCondition = or(
      ilike(chapters.title, pattern),
      sql`${chapters.chapterNumber}::text ilike ${pattern}`,
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  const where = and(...conditions)!;
  const chapterOrder = sort === "oldest"
    ? asc(chapters.chapterNumber)
    : desc(chapters.chapterNumber);

  // Run COUNT and SELECT in parallel — saves one full DB round trip
  const [countResult, chapterRows] = await Promise.all([
    db.select({ total: count() }).from(chapters).where(where),
    db
      .select({
        id: chapters.id,
        number: chapters.chapterNumber,
        title: chapters.title,
        publishedAt: chapters.publishedAt,
        wordCount: chapters.wordCount,
      })
      .from(chapters)
      .where(where)
      .orderBy(chapterOrder, asc(chapters.id))
      .limit(CHAPTERS_PER_PAGE)
      .offset((safePage - 1) * CHAPTERS_PER_PAGE),
  ]);

  const total = countResult[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CHAPTERS_PER_PAGE));
  const page = Math.min(safePage, totalPages);

  return {
    // If safePage was out of bounds, chapterRows will be empty — the page
    // component compares requestedPage vs page and redirects automatically.
    chapters: chapterRows,
    query: normalizedQuery,
    sort,
    page,
    total,
    totalPages,
    pageSize: CHAPTERS_PER_PAGE,
  };
});

export const getChapterForReader = cache(async (storySlug: string, chapterNumber: string) => {
  if (!/^\d+(?:\.\d{1,3})?$/.test(chapterNumber)) {
    return null;
  }

  // Single JOIN query replaces 2 sequential round-trips
  const [row] = await db
    .select({
      storyId: stories.id,
      storyTitle: stories.title,
      storySlug: stories.slug,
      chapterId: chapters.id,
      chapterNumber: chapters.chapterNumber,
      chapterTitle: chapters.title,
      chapterContent: chapters.content,
      chapterWordCount: chapters.wordCount,
      chapterPublishedAt: chapters.publishedAt,
    })
    .from(stories)
    .innerJoin(
      chapters,
      and(
        eq(chapters.storyId, stories.id),
        eq(chapters.chapterNumber, chapterNumber),
        eq(chapters.isPublished, true),
      ),
    )
    .where(and(eq(stories.slug, storySlug), eq(stories.isPublished, true)))
    .limit(1);

  if (!row) return null;

  // Run prev, next, and chapter list all in parallel
  const [[previousChapter], [nextChapter], chapterList] = await Promise.all([
    db
      .select({ number: chapters.chapterNumber, title: chapters.title })
      .from(chapters)
      .where(
        and(
          eq(chapters.storyId, row.storyId),
          eq(chapters.isPublished, true),
          lt(chapters.chapterNumber, row.chapterNumber),
        ),
      )
      .orderBy(desc(chapters.chapterNumber))
      .limit(1),
    db
      .select({ number: chapters.chapterNumber, title: chapters.title })
      .from(chapters)
      .where(
        and(
          eq(chapters.storyId, row.storyId),
          eq(chapters.isPublished, true),
          gt(chapters.chapterNumber, row.chapterNumber),
        ),
      )
      .orderBy(asc(chapters.chapterNumber))
      .limit(1),
    // Cap at 500 chapters for the drawer list – avoids sending megabytes for long series
    db
      .select({ number: chapters.chapterNumber, title: chapters.title })
      .from(chapters)
      .where(and(eq(chapters.storyId, row.storyId), eq(chapters.isPublished, true)))
      .orderBy(asc(chapters.chapterNumber))
      .limit(500),
  ]);

  return {
    story: { id: row.storyId, title: row.storyTitle, slug: row.storySlug },
    chapter: {
      id: row.chapterId,
      number: row.chapterNumber,
      title: row.chapterTitle,
      content: row.chapterContent,
      wordCount: row.chapterWordCount,
      publishedAt: row.chapterPublishedAt,
    },
    previousChapter: previousChapter ?? null,
    nextChapter: nextChapter ?? null,
    chapterList,
  };
});

