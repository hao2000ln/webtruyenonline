import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { chapters, stories } from "@/db/schema";

export async function recordChapterView(storyId: string, chapterId: string) {
  // Gom cả update story view và chapter view vào 1 câu lệnh SQL duy nhất (tiết kiệm 50% round-trips và connections)
  await db.execute(sql`
    with updated_story as (
      update ${stories}
      set view_count = ${stories.viewCount} + 1
      where ${stories.id} = ${storyId}
    )
    update ${chapters}
    set view_count = ${chapters.viewCount} + 1
    where ${chapters.id} = ${chapterId}
  `);
}
