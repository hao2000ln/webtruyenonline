import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { chapters, readingHistory, stories } from "@/db/schema";
import { ensureProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

const historyRecordSchema = z.object({
  storySlug: z.string().trim().min(1).max(500),
  chapterNumber: z.string().regex(/^\d+(?:\.\d{1,3})?$/),
  readAt: z.string().datetime(),
});

const payloadSchema = z.object({
  records: z.array(historyRecordSchema).max(50),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const payload = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "invalid-payload" }, { status: 400 });

  await ensureProfile(user);
  let synced = 0;

  for (const record of payload.data.records) {
    const [chapter] = await db
      .select({ storyId: stories.id, chapterId: chapters.id })
      .from(stories)
      .innerJoin(
        chapters,
        and(
          eq(chapters.storyId, stories.id),
          eq(chapters.chapterNumber, record.chapterNumber),
          eq(chapters.isPublished, true),
        ),
      )
      .where(and(eq(stories.slug, record.storySlug), eq(stories.isPublished, true)))
      .limit(1);

    if (!chapter) continue;

    const incomingReadAt = new Date(record.readAt);
    const [existing] = await db
      .select({ lastReadAt: readingHistory.lastReadAt })
      .from(readingHistory)
      .where(and(eq(readingHistory.userId, user.id), eq(readingHistory.storyId, chapter.storyId)))
      .limit(1);

    if (!existing) {
      await db.insert(readingHistory).values({
        userId: user.id,
        storyId: chapter.storyId,
        chapterId: chapter.chapterId,
        lastReadAt: incomingReadAt,
      });
      synced += 1;
      continue;
    }

    if (incomingReadAt > existing.lastReadAt) {
      await db
        .update(readingHistory)
        .set({ chapterId: chapter.chapterId, lastReadAt: incomingReadAt })
        .where(and(eq(readingHistory.userId, user.id), eq(readingHistory.storyId, chapter.storyId)));
      synced += 1;
    }
  }

  return NextResponse.json({ synced });
}
