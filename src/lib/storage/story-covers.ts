import "server-only";

import { createClient } from "@/lib/supabase/server";

export const STORY_COVER_BUCKET = "story-covers";
export const MAX_STORY_COVER_BYTES = 1024 * 1024;

export class StoryCoverValidationError extends Error {}

async function validateWebp(file: File) {
  if (file.type !== "image/webp") throw new StoryCoverValidationError("Ảnh bìa phải được xử lý thành WebP.");
  if (file.size === 0 || file.size > MAX_STORY_COVER_BYTES) throw new StoryCoverValidationError("Ảnh bìa WebP phải nhỏ hơn 1 MB.");
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const signature = String.fromCharCode(...header);
  if (!signature.startsWith("RIFF") || signature.slice(8, 12) !== "WEBP") {
    throw new StoryCoverValidationError("File ảnh bìa không phải WebP hợp lệ.");
  }
}

export async function uploadStoryCover(storyId: string, file: File) {
  await validateWebp(file);
  const supabase = await createClient();
  const path = `stories/${storyId}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(STORY_COVER_BUCKET).upload(path, await file.arrayBuffer(), {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw new Error(`Không thể upload ảnh bìa: ${error.message}`);
  return { path, publicUrl: supabase.storage.from(STORY_COVER_BUCKET).getPublicUrl(path).data.publicUrl };
}

function storagePathFromUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${STORY_COVER_BUCKET}/`;
    const markerIndex = parsed.pathname.indexOf(marker);
    return markerIndex >= 0 ? decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length)) : null;
  } catch {
    return null;
  }
}

export async function deleteStoryCover(urlOrPath: string | null | undefined) {
  const path = urlOrPath?.startsWith("stories/") ? urlOrPath : storagePathFromUrl(urlOrPath);
  if (!path) return;
  const supabase = await createClient();
  const { error } = await supabase.storage.from(STORY_COVER_BUCKET).remove([path]);
  if (error) throw new Error(`Không thể xóa ảnh bìa: ${error.message}`);
}
