"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ChapterConflictError, createAdminChapter, deleteAdminChapter, updateAdminChapter } from "@/db/mutations/admin-chapters";
import { requireAdmin } from "@/lib/auth/admin";
import { parseAdminChapterForm, type AdminChapterInput } from "@/lib/validation/admin-chapter";

export type ChapterFormState = { message?: string; fieldErrors?: Partial<Record<keyof AdminChapterInput, string[]>> };

function invalid(error: z.ZodError<AdminChapterInput>): ChapterFormState {
  return { message: "Vui lòng kiểm tra lại thông tin.", fieldErrors: error.flatten().fieldErrors };
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/chapters");
  revalidatePath("/truyen/[slug]", "page");
  revalidatePath("/truyen/[slug]/[chapter]", "page");
}

export async function createChapter(_state: ChapterFormState, formData: FormData): Promise<ChapterFormState> {
  await requireAdmin();
  const parsed = parseAdminChapterForm(formData);
  if (!parsed.success) return invalid(parsed.error);
  try { await createAdminChapter(parsed.data); }
  catch (error) {
    if (error instanceof ChapterConflictError) return { message: error.message, fieldErrors: { chapterNumber: [error.message], slug: [error.message] } };
    return { message: "Không thể tạo chương. Vui lòng thử lại." };
  }
  refresh();
  redirect("/admin/chapters?created=1");
}

export async function updateChapter(id: string, _state: ChapterFormState, formData: FormData): Promise<ChapterFormState> {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { message: "ID chương không hợp lệ." };
  const parsed = parseAdminChapterForm(formData);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const result = await updateAdminChapter(id, parsed.data);
    if (!result) return { message: "Chương không còn tồn tại." };
  } catch (error) {
    if (error instanceof ChapterConflictError) return { message: error.message, fieldErrors: { chapterNumber: [error.message], slug: [error.message] } };
    return { message: "Không thể cập nhật chương. Vui lòng thử lại." };
  }
  refresh();
  redirect("/admin/chapters?updated=1");
}

export async function deleteChapter(id: string) {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) redirect("/admin/chapters?error=invalid-id");
  const result = await deleteAdminChapter(id);
  if (!result) redirect("/admin/chapters?error=not-found");
  refresh();
  redirect("/admin/chapters?deleted=1");
}
