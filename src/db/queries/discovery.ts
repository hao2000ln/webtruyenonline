import { cache } from "react";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { authors, genres, stories, storyGenres } from "@/db/schema";

export const DISCOVERY_PAGE_SIZE = 12;

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

function normalizePage(page: number) {
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function getPageMeta(total: number, requestedPage: number) {
  const totalPages = Math.max(1, Math.ceil(total / DISCOVERY_PAGE_SIZE));
  const page = Math.min(normalizePage(requestedPage), totalPages);
  return { page, totalPages, offset: (page - 1) * DISCOVERY_PAGE_SIZE };
}

export const searchPublishedStories = cache(async (rawQuery: string, requestedPage: number) => {
  const query = rawQuery.trim().slice(0, 100);

  if (!query) {
    return { query, stories: [], total: 0, page: 1, totalPages: 1 };
  }

  const safePage = normalizePage(requestedPage);
  const pattern = `%${query}%`;
  const filters = and(
    eq(stories.isPublished, true),
    or(ilike(stories.title, pattern), ilike(authors.name, pattern)),
  );

  // Run COUNT and SELECT in parallel
  const [totalResult, result] = await Promise.all([
    db
      .select({ value: count(stories.id) })
      .from(stories)
      .leftJoin(authors, eq(stories.authorId, authors.id))
      .where(filters),
    db
      .select(storyCardSelection)
      .from(stories)
      .leftJoin(authors, eq(stories.authorId, authors.id))
      .where(filters)
      .orderBy(desc(stories.latestChapterAt), asc(stories.title))
      .limit(DISCOVERY_PAGE_SIZE)
      .offset((safePage - 1) * DISCOVERY_PAGE_SIZE),
  ]);

  const total = totalResult[0]?.value ?? 0;
  const pageMeta = getPageMeta(total, requestedPage);

  return { query, stories: result, total, ...pageMeta };
});


export const getGenresWithStoryCounts = cache(async () => {
  return db
    .select({
      id: genres.id,
      name: genres.name,
      slug: genres.slug,
      description: genres.description,
      storyCount: count(stories.id),
    })
    .from(genres)
    .leftJoin(storyGenres, eq(genres.id, storyGenres.genreId))
    .leftJoin(
      stories,
      and(eq(storyGenres.storyId, stories.id), eq(stories.isPublished, true)),
    )
    .groupBy(genres.id)
    .orderBy(desc(count(stories.id)), asc(genres.name));
});

export const getGenreBySlug = cache(async (slug: string) => {
  const [genre] = await db
    .select({ id: genres.id, name: genres.name, slug: genres.slug, description: genres.description })
    .from(genres)
    .where(eq(genres.slug, slug))
    .limit(1);

  return genre ?? null;
});

export type GenreStorySort = "latest" | "hot";

export const getStoriesByGenre = cache(
  async (slug: string, requestedPage: number, sort: GenreStorySort) => {
    const genre = await getGenreBySlug(slug);

    if (!genre) return null;

    const safePage = normalizePage(requestedPage);
    const filters = and(eq(storyGenres.genreId, genre.id), eq(stories.isPublished, true));
    const orderBy = sort === "hot" ? desc(stories.viewCount) : desc(stories.latestChapterAt);

    // Run COUNT and SELECT in parallel
    const [totalResult, result] = await Promise.all([
      db
        .select({ value: count(stories.id) })
        .from(storyGenres)
        .innerJoin(stories, eq(storyGenres.storyId, stories.id))
        .where(filters),
      db
        .select(storyCardSelection)
        .from(storyGenres)
        .innerJoin(stories, eq(storyGenres.storyId, stories.id))
        .leftJoin(authors, eq(stories.authorId, authors.id))
        .where(filters)
        .orderBy(orderBy, asc(stories.title))
        .limit(DISCOVERY_PAGE_SIZE)
        .offset((safePage - 1) * DISCOVERY_PAGE_SIZE),
    ]);

    const total = totalResult[0]?.value ?? 0;
    const pageMeta = getPageMeta(total, requestedPage);

    return { genre, stories: result, total, sort, ...pageMeta };
  },
);

