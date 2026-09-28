import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { authors, follows, stories } from "@/db/schema";

export async function getFollowedStories(userId: string) {
  return db
    .select({
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
    })
    .from(follows)
    .innerJoin(stories, eq(follows.storyId, stories.id))
    .leftJoin(authors, eq(stories.authorId, authors.id))
    .where(eq(follows.userId, userId))
    .orderBy(desc(follows.createdAt));
}
