import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { chapters, stories } from "@/db/schema";

export async function recordChapterView(storyId: string, chapterId: string) {
  // Ghi nhận view song song không cần transaction wrapper để tránh giữ connection pooler
  await Promise.all([
    db.update(stories).set({ viewCount: sql`${stories.viewCount} + 1` }).where(eq(stories.id, storyId)),
    db.update(chapters).set({ viewCount: sql`${chapters.viewCount} + 1` }).where(eq(chapters.id, chapterId)),
  ]);
}
