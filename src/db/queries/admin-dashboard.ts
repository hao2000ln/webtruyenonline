import { and, asc, count, desc, eq, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { authors, chapters, genres, stories } from "@/db/schema";

export async function getAdminDashboard() {
  const staleBefore = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const staleCondition = and(
    eq(stories.status, "ONGOING"),
    eq(stories.isPublished, true),
    or(isNull(stories.latestChapterAt), lt(stories.latestChapterAt, staleBefore)),
  );

  const [storyCount] = await db.select({ value: count() }).from(stories);
  const [chapterCount] = await db.select({ value: count() }).from(chapters);
  const [authorCount] = await db.select({ value: count() }).from(authors);
  const [genreCount] = await db.select({ value: count() }).from(genres);
  const [publishedStories] = await db.select({ value: count() }).from(stories).where(eq(stories.isPublished, true));
  const [publishedChapters] = await db.select({ value: count() }).from(chapters).where(eq(chapters.isPublished, true));
  const [totalViews] = await db.select({ value: sql<string>`coalesce(sum(${stories.viewCount}), 0)` }).from(stories);
  const [staleStoryCount] = await db.select({ value: count() }).from(stories).where(staleCondition);

  const topStories = await db
    .select({ id: stories.id, title: stories.title, viewCount: stories.viewCount, totalChapters: stories.totalChapters })
    .from(stories)
    .where(eq(stories.isPublished, true))
    .orderBy(desc(stories.viewCount), asc(stories.title))
    .limit(5);
  const staleStories = await db
    .select({ id: stories.id, title: stories.title, latestChapterAt: stories.latestChapterAt, totalChapters: stories.totalChapters })
    .from(stories)
    .where(staleCondition)
    .orderBy(asc(stories.latestChapterAt), asc(stories.title))
    .limit(5);
  const recentStories = await db
    .select({ id: stories.id, title: stories.title, slug: stories.slug, updatedAt: stories.updatedAt, isPublished: stories.isPublished })
    .from(stories)
    .orderBy(desc(stories.updatedAt))
    .limit(5);
  const recentChapters = await db
    .select({ id: chapters.id, title: chapters.title, number: chapters.chapterNumber, storyTitle: stories.title, updatedAt: chapters.updatedAt })
    .from(chapters)
    .innerJoin(stories, eq(chapters.storyId, stories.id))
    .orderBy(desc(chapters.updatedAt))
    .limit(5);

  return {
    stats: {
      stories: storyCount.value,
      chapters: chapterCount.value,
      authors: authorCount.value,
      genres: genreCount.value,
      publishedStories: publishedStories.value,
      publishedChapters: publishedChapters.value,
      totalViews: Number(totalViews.value),
      staleStories: staleStoryCount.value,
    },
    topStories,
    staleStories,
    recentStories,
    recentChapters,
  };
}
