import { cache } from "react";
import { and, asc, desc, eq, gt, lt, type SQL } from "drizzle-orm";
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

export const getHomepageStories = cache(async () => {
  const published = eq(stories.isPublished, true);

  // Keep these sequential because one application instance intentionally uses
  // a single pooled database connection.
  const latestUpdated = await selectStoryCards(published, desc(stories.latestChapterAt));
  const newest = await selectStoryCards(published, desc(stories.publishedAt));
  const hot = await selectStoryCards(published, desc(stories.viewCount));
  const completed = await selectStoryCards(
    and(published, eq(stories.status, "COMPLETED"))!,
    desc(stories.latestChapterAt),
  );

  return { latestUpdated, newest, hot, completed };
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

  const storyGenreRows = await db
    .select({ id: genres.id, name: genres.name, slug: genres.slug })
    .from(storyGenres)
    .innerJoin(genres, eq(storyGenres.genreId, genres.id))
    .where(eq(storyGenres.storyId, story.id))
    .orderBy(asc(genres.name));

  const chapterRows = await db
    .select({
      id: chapters.id,
      number: chapters.chapterNumber,
      title: chapters.title,
      slug: chapters.slug,
      publishedAt: chapters.publishedAt,
      wordCount: chapters.wordCount,
    })
    .from(chapters)
    .where(and(eq(chapters.storyId, story.id), eq(chapters.isPublished, true)))
    .orderBy(asc(chapters.chapterNumber));

  return {
    ...story,
    genres: storyGenreRows,
    chapters: chapterRows,
    firstChapter: chapterRows.at(0) ?? null,
    latestChapter: chapterRows.at(-1) ?? null,
  };
});

export const getChapterForReader = cache(async (storySlug: string, chapterNumber: string) => {
  if (!/^\d+(?:\.\d{1,3})?$/.test(chapterNumber)) {
    return null;
  }

  const [story] = await db
    .select({ id: stories.id, title: stories.title, slug: stories.slug })
    .from(stories)
    .where(and(eq(stories.slug, storySlug), eq(stories.isPublished, true)))
    .limit(1);

  if (!story) {
    return null;
  }

  const [chapter] = await db
    .select({
      id: chapters.id,
      number: chapters.chapterNumber,
      title: chapters.title,
      content: chapters.content,
      wordCount: chapters.wordCount,
      publishedAt: chapters.publishedAt,
    })
    .from(chapters)
    .where(
      and(
        eq(chapters.storyId, story.id),
        eq(chapters.chapterNumber, chapterNumber),
        eq(chapters.isPublished, true),
      ),
    )
    .limit(1);

  if (!chapter) {
    return null;
  }

  const [previousChapter] = await db
    .select({ number: chapters.chapterNumber, title: chapters.title })
    .from(chapters)
    .where(
      and(
        eq(chapters.storyId, story.id),
        eq(chapters.isPublished, true),
        lt(chapters.chapterNumber, chapter.number),
      ),
    )
    .orderBy(desc(chapters.chapterNumber))
    .limit(1);

  const [nextChapter] = await db
    .select({ number: chapters.chapterNumber, title: chapters.title })
    .from(chapters)
    .where(
      and(
        eq(chapters.storyId, story.id),
        eq(chapters.isPublished, true),
        gt(chapters.chapterNumber, chapter.number),
      ),
    )
    .orderBy(asc(chapters.chapterNumber))
    .limit(1);

  return {
    story,
    chapter,
    previousChapter: previousChapter ?? null,
    nextChapter: nextChapter ?? null,
  };
});
