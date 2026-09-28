import { z } from "zod";
import { MAX_IMPORT_CHAPTERS } from "@/lib/chapter-import";
import { countChapterWords } from "@/lib/chapter-content";

export const importChapterSchema = z.object({
  chapterNumber: z.string().trim().regex(/^\d+(?:\.\d{1,3})?$/, "Số chương không hợp lệ.").refine((value) => Number(value) > 0, "Số chương phải lớn hơn 0."),
  title: z.string().trim().min(1, "Thiếu tiêu đề.").max(500, "Tiêu đề quá dài."),
  slug: z.string().trim().min(1, "Thiếu slug.").max(500, "Slug quá dài.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ."),
  content: z.string().trim().min(1, "Thiếu nội dung.").refine((value) => countChapterWords(value) > 0, "Nội dung không có từ hợp lệ."),
});

export const adminChapterImportSchema = z.object({
  storyId: z.string().uuid("Truyện không hợp lệ."),
  publishMode: z.enum(["draft", "publish"]),
  conflictMode: z.enum(["skip", "update", "abort"]),
  applyPublishModeToUpdates: z.boolean(),
  chapters: z.array(importChapterSchema).min(1, "Cần chọn ít nhất một chương.").max(MAX_IMPORT_CHAPTERS, `Tối đa ${MAX_IMPORT_CHAPTERS} chương mỗi lần.`),
});

export type AdminChapterImportInput = z.infer<typeof adminChapterImportSchema>;
