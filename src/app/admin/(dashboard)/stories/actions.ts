"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createAdminStory,
  deleteAdminStory,
  setAdminStoryCover,
  StorySlugConflictError,
  updateAdminStory,
} from "@/db/mutations/admin-stories";
import { getAdminStoryForEdit } from "@/db/queries/admin-stories";
import { requireAdmin } from "@/lib/auth/admin";
import { deleteStoryCover, StoryCoverValidationError, uploadStoryCover } from "@/lib/storage/story-covers";
import { parseAdminStoryForm, type AdminStoryInput } from "@/lib/validation/admin-story";

export type StoryFormState = {
  message?: string;
  fieldErrors?: Partial<Record<keyof AdminStoryInput, string[]>>;
};

function validationState(error: z.ZodError<AdminStoryInput>): StoryFormState {
  return {
    message: "Vui lòng kiểm tra lại thông tin.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

function revalidateStoryPaths(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/tim-kiem");
  revalidatePath("/the-loai");
  revalidatePath("/the-loai/[slug]", "page");
  revalidatePath("/admin/stories");
  for (const slug of new Set(slugs)) {
    revalidatePath(`/truyen/${slug}`);
    revalidatePath(`/truyen/${slug}/[chapter]`, "page");
  }
}

function coverFile(formData: FormData) {
  const value = formData.get("coverFile");
  return value instanceof File && value.size > 0 ? value : null;
}

function coverError(error: unknown): StoryFormState {
  const message = error instanceof StoryCoverValidationError ? error.message : "Không thể upload ảnh bìa. Vui lòng thử lại.";
  return { message, fieldErrors: { coverUrl: [message] } };
}

export async function createStory(
  _previousState: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  await requireAdmin();
  const parsed = parseAdminStoryForm(formData);
  if (!parsed.success) return validationState(parsed.error);
  parsed.data.coverUrl = "";

  let story;
  try {
    story = await createAdminStory(parsed.data);
  } catch (error) {
    if (error instanceof StorySlugConflictError) {
      return { message: "Slug đã được sử dụng.", fieldErrors: { slug: ["Slug đã được sử dụng."] } };
    }
    return { message: "Không thể tạo truyện. Vui lòng thử lại." };
  }

  const file = coverFile(formData);
  if (file) {
    let uploadedPath: string | null = null;
    try {
      const uploaded = await uploadStoryCover(story.id, file);
      uploadedPath = uploaded.path;
      await setAdminStoryCover(story.id, uploaded.publicUrl);
    } catch (error) {
      if (uploadedPath) await deleteStoryCover(uploadedPath).catch(() => undefined);
      await deleteAdminStory(story.id);
      return coverError(error);
    }
  }

  revalidateStoryPaths([parsed.data.slug]);
  redirect("/admin/stories?created=1");
}

export async function updateStory(
  id: string,
  _previousState: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  await requireAdmin();
  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) return { message: "ID truyện không hợp lệ." };

  const parsed = parseAdminStoryForm(formData);
  if (!parsed.success) return validationState(parsed.error);

  const existing = await getAdminStoryForEdit(id);
  if (!existing) return { message: "Truyện không còn tồn tại." };
  const file = coverFile(formData);
  const removeCover = formData.get("removeCover") === "true";
  let uploaded: Awaited<ReturnType<typeof uploadStoryCover>> | null = null;
  try {
    if (file) uploaded = await uploadStoryCover(id, file);
  } catch (error) {
    return coverError(error);
  }
  parsed.data.coverUrl = uploaded?.publicUrl ?? (removeCover ? "" : existing.coverUrl ?? "");

  let result;
  try {
    result = await updateAdminStory(id, parsed.data);
  } catch (error) {
    if (error instanceof StorySlugConflictError) {
      if (uploaded) await deleteStoryCover(uploaded.path).catch(() => undefined);
      return { message: "Slug đã được sử dụng.", fieldErrors: { slug: ["Slug đã được sử dụng."] } };
    }
    if (uploaded) await deleteStoryCover(uploaded.path).catch(() => undefined);
    return { message: "Không thể cập nhật truyện. Vui lòng thử lại." };
  }

  if (!result) return { message: "Truyện không còn tồn tại." };
  if ((uploaded || removeCover) && existing.coverUrl) await deleteStoryCover(existing.coverUrl).catch(() => undefined);
  revalidateStoryPaths([result.oldSlug, result.slug]);
  redirect("/admin/stories?updated=1");
}

export async function deleteStory(id: string, formData: FormData) {
  void formData;
  await requireAdmin();
  const idResult = z.string().uuid().safeParse(id);
  if (!idResult.success) redirect("/admin/stories?error=invalid-id");

  const result = await deleteAdminStory(id);
  if (!result) redirect("/admin/stories?error=not-found");
  if (result.coverUrl) await deleteStoryCover(result.coverUrl).catch(() => undefined);
  revalidateStoryPaths([result.slug]);
  redirect("/admin/stories?deleted=1");
}
