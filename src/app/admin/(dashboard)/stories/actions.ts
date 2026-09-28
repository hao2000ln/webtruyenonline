"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createAdminStory,
  deleteAdminStory,
  StorySlugConflictError,
  updateAdminStory,
} from "@/db/mutations/admin-stories";
import { requireAdmin } from "@/lib/auth/admin";
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

export async function createStory(
  _previousState: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  await requireAdmin();
  const parsed = parseAdminStoryForm(formData);
  if (!parsed.success) return validationState(parsed.error);

  try {
    await createAdminStory(parsed.data);
  } catch (error) {
    if (error instanceof StorySlugConflictError) {
      return { message: "Slug đã được sử dụng.", fieldErrors: { slug: ["Slug đã được sử dụng."] } };
    }
    return { message: "Không thể tạo truyện. Vui lòng thử lại." };
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

  let result;
  try {
    result = await updateAdminStory(id, parsed.data);
  } catch (error) {
    if (error instanceof StorySlugConflictError) {
      return { message: "Slug đã được sử dụng.", fieldErrors: { slug: ["Slug đã được sử dụng."] } };
    }
    return { message: "Không thể cập nhật truyện. Vui lòng thử lại." };
  }

  if (!result) return { message: "Truyện không còn tồn tại." };
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
  revalidateStoryPaths([result.slug]);
  redirect("/admin/stories?deleted=1");
}
