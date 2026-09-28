import { z } from "zod";

export const storyStatuses = ["ONGOING", "COMPLETED", "HIATUS"] as const;

export const adminStorySchema = z.object({
  title: z.string().trim().min(1, "Tên truyện là bắt buộc.").max(500, "Tên truyện quá dài."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug là bắt buộc.")
    .max(500, "Slug quá dài.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang."),
  originalTitle: z.string().trim().max(500, "Tên gốc quá dài."),
  description: z.string().trim().max(20_000, "Mô tả quá dài."),
  coverUrl: z
    .string()
    .trim()
    .max(2_000, "URL ảnh quá dài.")
    .refine((value) => value === "" || URL.canParse(value), "URL ảnh bìa không hợp lệ."),
  authorId: z.union([z.string().uuid("Tác giả không hợp lệ."), z.literal("")]),
  status: z.enum(storyStatuses),
  genreIds: z.array(z.string().uuid("Thể loại không hợp lệ.")).max(30, "Chọn tối đa 30 thể loại."),
  isPublished: z.boolean(),
});

export type AdminStoryInput = z.infer<typeof adminStorySchema>;

export function parseAdminStoryForm(formData: FormData) {
  return adminStorySchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    originalTitle: formData.get("originalTitle"),
    description: formData.get("description"),
    coverUrl: formData.get("coverUrl"),
    authorId: formData.get("authorId"),
    status: formData.get("status"),
    genreIds: formData.getAll("genreIds"),
    isPublished: formData.get("isPublished") === "on",
  });
}
