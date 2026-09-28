import { z } from "zod";
import { countChapterWords } from "@/lib/chapter-content";

export const adminChapterSchema = z.object({
  storyId: z.string().uuid("Truyện không hợp lệ."),
  chapterNumber: z.string().trim().regex(/^\d+(?:\.\d{1,3})?$/, "Số chương phải là số dương, tối đa 3 chữ số thập phân.").refine((value) => Number(value) > 0, "Số chương phải lớn hơn 0."),
  title: z.string().trim().min(1, "Tiêu đề là bắt buộc.").max(500, "Tiêu đề quá dài."),
  slug: z.string().trim().min(1, "Slug là bắt buộc.").max(500, "Slug quá dài.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang."),
  content: z.string().trim().min(1, "Nội dung chương là bắt buộc.").refine((value) => countChapterWords(value) > 0, "Nội dung phải có ít nhất một từ hợp lệ."),
  isPublished: z.boolean(),
  publishedAt: z.string().trim().refine((value) => value === "" || !Number.isNaN(Date.parse(value)), "Ngày xuất bản không hợp lệ."),
});

export type AdminChapterInput = z.infer<typeof adminChapterSchema>;

export function parseAdminChapterForm(formData: FormData) {
  return adminChapterSchema.safeParse({
    storyId: formData.get("storyId"),
    chapterNumber: formData.get("chapterNumber"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    isPublished: formData.get("isPublished") === "on",
    publishedAt: formData.get("publishedAt"),
  });
}
