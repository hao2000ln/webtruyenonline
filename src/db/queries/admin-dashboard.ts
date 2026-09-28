import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { authors, chapters, genres, stories } from "@/db/schema";
export async function getAdminDashboard() {
  const [[storyCount], [chapterCount], [authorCount], [genreCount], [publishedStories], [publishedChapters], recentStories, recentChapters] = await Promise.all([
    db.select({ value: count() }).from(stories), db.select({ value: count() }).from(chapters), db.select({ value: count() }).from(authors), db.select({ value: count() }).from(genres), db.select({ value: count() }).from(stories).where(eq(stories.isPublished, true)), db.select({ value: count() }).from(chapters).where(eq(chapters.isPublished, true)),
    db.select({ id: stories.id, title: stories.title, slug: stories.slug, updatedAt: stories.updatedAt, isPublished: stories.isPublished }).from(stories).orderBy(desc(stories.updatedAt)).limit(5), db.select({ id: chapters.id, title: chapters.title, number: chapters.chapterNumber, storyTitle: stories.title, updatedAt: chapters.updatedAt }).from(chapters).innerJoin(stories, eq(chapters.storyId, stories.id)).orderBy(desc(chapters.updatedAt)).limit(5),
  ]); return { stats: { stories: storyCount.value, chapters: chapterCount.value, authors: authorCount.value, genres: genreCount.value, publishedStories: publishedStories.value, publishedChapters: publishedChapters.value }, recentStories, recentChapters };
}
