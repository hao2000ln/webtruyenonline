import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { chapters, stories } from "@/db/schema";

export async function recordChapterView(storyId: string, chapterId: string) {
  await db.transaction(async (transaction) => {
    // Both UPDATEs are independent — run in parallel inside the transaction
    await Promise.all([
      transaction.update(stories).set({ viewCount: sql`${stories.viewCount} + 1` }).where(eq(stories.id, storyId)),
      transaction.update(chapters).set({ viewCount: sql`${chapters.viewCount} + 1` }).where(eq(chapters.id, chapterId)),
    ]);
  });
}
