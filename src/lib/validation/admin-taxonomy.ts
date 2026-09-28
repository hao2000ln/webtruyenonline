import { z } from "zod";

export const taxonomySchema = z.object({
  name: z.string().trim().min(1, "Tên là bắt buộc.").max(255, "Tên quá dài."),
  slug: z.string().trim().min(1, "Slug là bắt buộc.").max(255, "Slug quá dài.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang."),
  description: z.string().trim().max(5000, "Mô tả quá dài."),
});
export type TaxonomyInput = z.infer<typeof taxonomySchema>;
export function parseTaxonomyForm(formData: FormData) { return taxonomySchema.safeParse({ name: formData.get("name"), slug: formData.get("slug"), description: formData.get("description") }); }
