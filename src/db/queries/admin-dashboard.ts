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

  // Gom tất cả 8 phép COUNT/SUM thành 1 truy vấn duy nhất để tránh deadlock kết nối trên Transaction Pooler của Supabase
  const [statsRow] = await db.execute<{
    stories: string;
    chapters: string;
    authors: string;
    genres: string;
    published_stories: string;
    published_chapters: string;
    total_views: string;
    stale_stories: string;
  }>(sql`
    select
      (select count(*) from ${stories}) as stories,
      (select count(*) from ${chapters}) as chapters,
      (select count(*) from ${authors}) as authors,
      (select count(*) from ${genres}) as genres,
      (select count(*) from ${stories} where ${stories.isPublished} = true) as published_stories,
      (select count(*) from ${chapters} where ${chapters.isPublished} = true) as published_chapters,
      (select coalesce(sum(${stories.viewCount}), 0) from ${stories}) as total_views,
      (select count(*) from ${stories} where ${staleCondition}) as stale_stories
  `);

  // Truy vấn danh sách tuần tự để tương thích hoàn toàn với pool connection nhỏ và transaction pooler
  const topStories = await db
    .select({
      id: stories.id,
      title: stories.title,
      viewCount: stories.viewCount,
      totalChapters: stories.totalChapters,
    })
    .from(stories)
    .where(eq(stories.isPublished, true))
    .orderBy(desc(stories.viewCount), asc(stories.title))
    .limit(5);

  const staleStories = await db
    .select({
      id: stories.id,
      title: stories.title,
      latestChapterAt: stories.latestChapterAt,
      totalChapters: stories.totalChapters,
    })
    .from(stories)
    .where(staleCondition)
    .orderBy(asc(stories.latestChapterAt), asc(stories.title))
    .limit(5);

  const recentStories = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      updatedAt: stories.updatedAt,
      isPublished: stories.isPublished,
    })
    .from(stories)
    .orderBy(desc(stories.updatedAt))
    .limit(5);

  const recentChapters = await db
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
    .limit(5);

  return {
    stats: {
      stories: Number(statsRow?.stories ?? 0),
      chapters: Number(statsRow?.chapters ?? 0),
      authors: Number(statsRow?.authors ?? 0),
      genres: Number(statsRow?.genres ?? 0),
      publishedStories: Number(statsRow?.published_stories ?? 0),
      publishedChapters: Number(statsRow?.published_chapters ?? 0),
      totalViews: Number(statsRow?.total_views ?? 0),
      staleStories: Number(statsRow?.stale_stories ?? 0),
    },
    topStories,
    staleStories,
    recentStories,
    recentChapters,
  };
}
