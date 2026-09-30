import { and, eq, inArray, sql } from "drizzle-orm";
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

  const records = payload.data.records;
  if (records.length === 0) return NextResponse.json({ synced: 0 });

  // Bước 1: Lấy tất cả storyId + chapterId trong 1 query thay vì N queries
  const slugs = [...new Set(records.map((r) => r.storySlug))];
  const chapterRows = await db
    .select({
      storyId: stories.id,
      storySlug: stories.slug,
      chapterId: chapters.id,
      chapterNumber: chapters.chapterNumber,
    })
    .from(stories)
    .innerJoin(
      chapters,
      and(eq(chapters.storyId, stories.id), eq(chapters.isPublished, true)),
    )
    .where(and(eq(stories.isPublished, true), inArray(stories.slug, slugs)));

  // Tạo lookup map: "slug:chapterNumber" → { storyId, chapterId }
  const chapterLookup = new Map<string, { storyId: string; chapterId: string }>();
  for (const row of chapterRows) {
    chapterLookup.set(`${row.storySlug}:${row.chapterNumber}`, {
      storyId: row.storyId,
      chapterId: row.chapterId,
    });
  }

  // Lọc records có chapter hợp lệ
  type ValidRecord = { storyId: string; chapterId: string; readAt: Date };
  const validRecords: ValidRecord[] = [];
  for (const record of records) {
    const found = chapterLookup.get(`${record.storySlug}:${record.chapterNumber}`);
    if (found) {
      validRecords.push({ ...found, readAt: new Date(record.readAt) });
    }
  }

  if (validRecords.length === 0) return NextResponse.json({ synced: 0 });

  // Bước 2: Lấy lịch sử hiện có trong 1 query
  const storyIds = [...new Set(validRecords.map((r) => r.storyId))];
  const existingRows = await db
    .select({
      storyId: readingHistory.storyId,
      lastReadAt: readingHistory.lastReadAt,
    })
    .from(readingHistory)
    .where(and(eq(readingHistory.userId, user.id), inArray(readingHistory.storyId, storyIds)));

  const existingMap = new Map<string, Date>();
  for (const row of existingRows) {
    existingMap.set(row.storyId, row.lastReadAt);
  }

  // Bước 3: Chỉ upsert những record thực sự mới hơn
  const toUpsert = validRecords.filter((r) => {
    const existing = existingMap.get(r.storyId);
    return !existing || r.readAt > existing;
  });

  if (toUpsert.length === 0) return NextResponse.json({ synced: 0 });

  // Bulk upsert trong 1 query thay vì N queries
  await db
    .insert(readingHistory)
    .values(
      toUpsert.map((r) => ({
        userId: user.id,
        storyId: r.storyId,
        chapterId: r.chapterId,
        lastReadAt: r.readAt,
      })),
    )
    .onConflictDoUpdate({
      target: [readingHistory.userId, readingHistory.storyId],
      // Chỉ ghi đè nếu incoming mới hơn (tránh ghi đè tiến độ mới bằng dữ liệu cũ)
      set: {
        chapterId: sql`excluded.chapter_id`,
        lastReadAt: sql`excluded.last_read_at`,
      },
      where: sql`reading_history.last_read_at < excluded.last_read_at`,
    });

  return NextResponse.json({ synced: toUpsert.length });
}
