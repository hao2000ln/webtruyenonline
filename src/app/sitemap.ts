import type { MetadataRoute } from "next";
import { db } from "@/db";
import { chapters, genres, stories } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mocthu.vn";

// Sitemap cache 1 giờ — đủ fresh mà không tốn query liên tục
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Các trang tĩnh
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/the-loai`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/tim-kiem`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Lấy stories và chapters song song để tiết kiệm thời gian
  const [publishedStories, publishedChapters, allGenres] = await Promise.all([
    db
      .select({
        slug: stories.slug,
        updatedAt: stories.updatedAt,
        latestChapterAt: stories.latestChapterAt,
      })
      .from(stories)
      .where(eq(stories.isPublished, true))
      .orderBy(desc(stories.updatedAt))
      .limit(5000), // Giới hạn để không overload sitemap

    db
      .select({
        storySlug: stories.slug,
        chapterNumber: chapters.chapterNumber,
        updatedAt: chapters.updatedAt,
      })
      .from(chapters)
      .innerJoin(stories, and(eq(chapters.storyId, stories.id), eq(stories.isPublished, true)))
      .where(eq(chapters.isPublished, true))
      .orderBy(desc(chapters.updatedAt))
      .limit(10000), // Limit tổng chapters trong sitemap

    db
      .select({ slug: genres.slug })
      .from(genres)
      .orderBy(asc(genres.name)),
  ]);

  // Story detail pages
  const storyRoutes: MetadataRoute.Sitemap = publishedStories.map((story) => ({
    url: `${APP_URL}/truyen/${story.slug}`,
    lastModified: story.latestChapterAt ?? story.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // Chapter reader pages
  const chapterRoutes: MetadataRoute.Sitemap = publishedChapters.map((ch) => ({
    url: `${APP_URL}/truyen/${ch.storySlug}/chuong-${ch.chapterNumber}`,
    lastModified: ch.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Genre pages
  const genreRoutes: MetadataRoute.Sitemap = allGenres.map((genre) => ({
    url: `${APP_URL}/the-loai/${genre.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...storyRoutes, ...chapterRoutes, ...genreRoutes];
}
