import { z } from "zod";
import { READER_ANNOTATION_COLORS } from "@/lib/reader-annotations";

const isoDate = z.string().datetime({ offset: true });

export const readerAnnotationSyncRecordSchema = z.object({
  clientId: z.string().uuid(),
  chapterId: z.string().uuid(),
  quoteText: z.string().min(1).max(2_000),
  prefixText: z.string().max(200),
  suffixText: z.string().max(200),
  startOffset: z.number().int().min(0).max(10_000_000),
  endOffset: z.number().int().min(1).max(10_000_000),
  color: z.enum(READER_ANNOTATION_COLORS),
  noteText: z.string().max(5_000).nullable(),
  contentHash: z.string().min(8).max(64),
  createdAt: isoDate,
  updatedAt: isoDate,
  deletedAt: isoDate.nullable(),
}).refine((record) => record.endOffset > record.startOffset, {
  message: "Invalid annotation offsets",
  path: ["endOffset"],
});

export const readerAnnotationSyncSchema = z.object({
  chapterIds: z.array(z.string().uuid()).max(20).default([]),
  records: z.array(readerAnnotationSyncRecordSchema).max(200),
});

export type ReaderAnnotationSyncRecord = z.infer<typeof readerAnnotationSyncRecordSchema>;
