"use server";

import { revalidatePath } from "next/cache";
import {
  ChapterImportConflictError,
  ChapterImportStoryNotFoundError,
  importAdminChapters,
} from "@/db/mutations/admin-chapter-import";
import { requireAdmin } from "@/lib/auth/admin";
import { adminChapterImportSchema } from "@/lib/validation/admin-chapter-import";

export type ChapterImportState = {
  message?: string;
  success?: boolean;
  imported?: number;
  updated?: number;
  skipped?: number;
  conflicts?: string[];
};

const MAX_PAYLOAD_LENGTH = 4 * 1024 * 1024;

function refreshPublicPages(storySlug: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/chapters");
  revalidatePath("/admin/stories");
  revalidatePath("/admin/import");
  revalidatePath("/tim-kiem");
  revalidatePath("/the-loai/[slug]", "page");
  revalidatePath(`/truyen/${storySlug}`);
  revalidatePath("/truyen/[slug]/[chapter]", "page");
}

export async function importChapters(_state: ChapterImportState, formData: FormData): Promise<ChapterImportState> {
  await requireAdmin();
  const payload = formData.get("chapters");
  if (typeof payload !== "string" || payload.length > MAX_PAYLOAD_LENGTH) {
    return { message: "Dữ liệu import rỗng hoặc vượt quá giới hạn cho phép." };
  }

  let chapters: unknown;
  try {
    chapters = JSON.parse(payload);
  } catch {
    return { message: "Dữ liệu chương không phải JSON hợp lệ." };
  }

  const parsed = adminChapterImportSchema.safeParse({
    storyId: formData.get("storyId"),
    publishMode: formData.get("publishMode"),
    conflictMode: formData.get("conflictMode"),
    applyPublishModeToUpdates: formData.get("applyPublishModeToUpdates") === "on",
    chapters,
  });
  if (!parsed.success) {
    const errors = parsed.error.issues.slice(0, 5).map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    return { message: "Dữ liệu import chưa hợp lệ.", conflicts: errors };
  }

  try {
    const result = await importAdminChapters(parsed.data);
    refreshPublicPages(result.storySlug);
    return {
      success: true,
      message: `Đã thêm ${result.imported} chương, cập nhật ${result.updated} chương${result.skipped ? `, bỏ qua ${result.skipped} chương` : ""}.`,
      imported: result.imported,
      updated: result.updated,
      skipped: result.skipped,
      conflicts: result.conflicts,
    };
  } catch (error) {
    if (error instanceof ChapterImportConflictError) {
      return { message: error.message, conflicts: error.conflicts.slice(0, 20) };
    }
    if (error instanceof ChapterImportStoryNotFoundError) return { message: error.message };
    return { message: "Không thể import chương. Dữ liệu chưa được lưu." };
  }
}
