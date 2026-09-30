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

  // Nhóm 1: các COUNT đơn giản — chạy song song để tiết kiệm ~200ms
  const [
    [storyCount],
    [chapterCount],
    [authorCount],
    [genreCount],
    [publishedStories],
    [publishedChapters],
    [totalViews],
    [staleStoryCount],
  ] = await Promise.all([
    db.select({ value: count() }).from(stories),
    db.select({ value: count() }).from(chapters),
    db.select({ value: count() }).from(authors),
    db.select({ value: count() }).from(genres),
    db.select({ value: count() }).from(stories).where(eq(stories.isPublished, true)),
    db.select({ value: count() }).from(chapters).where(eq(chapters.isPublished, true)),
    db.select({ value: sql<string>`coalesce(sum(${stories.viewCount}), 0)` }).from(stories),
    db.select({ value: count() }).from(stories).where(staleCondition),
  ]);

  // Nhóm 2: các list query — chạy song song
  const [topStories, staleStories, recentStories, recentChapters] = await Promise.all([
    db
      .select({
        id: stories.id,
        title: stories.title,
        viewCount: stories.viewCount,
        totalChapters: stories.totalChapters,
      })
      .from(stories)
      .where(eq(stories.isPublished, true))
      .orderBy(desc(stories.viewCount), asc(stories.title))
      .limit(5),

    db
      .select({
        id: stories.id,
        title: stories.title,
        latestChapterAt: stories.latestChapterAt,
        totalChapters: stories.totalChapters,
      })
      .from(stories)
      .where(staleCondition)
      .orderBy(asc(stories.latestChapterAt), asc(stories.title))
      .limit(5),

    db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        updatedAt: stories.updatedAt,
        isPublished: stories.isPublished,
      })
      .from(stories)
      .orderBy(desc(stories.updatedAt))
      .limit(5),

    db
      .select({
        id: chapters.id,
        title: chapters.title,
        number: chapters.chapterNumber,
        storyTitle: stories.title,
        updatedAt: chapters.updatedAt,
      })
      .from(chapters)
      .innerJoin(stories, eq(chapters.storyId, stories.id))
      .orderBy(desc(chapters.updatedAt))
      .limit(5),
  ]);

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
