import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { chapters, stories } from "@/db/schema";

export async function recordChapterView(storyId: string, chapterId: string) {
  await db.transaction(async (transaction) => {
    await transaction.update(stories).set({ viewCount: sql`${stories.viewCount} + 1` }).where(eq(stories.id, storyId));
    await transaction.update(chapters).set({ viewCount: sql`${chapters.viewCount} + 1` }).where(eq(chapters.id, chapterId));
  });
}
