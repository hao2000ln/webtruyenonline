import "server-only";

import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

export const STORY_COVER_BUCKET = "story-covers";
export const MAX_STORY_COVER_BYTES = 1024 * 1024;

export class StoryCoverValidationError extends Error {}

function getStoryCoverStorage() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("Neon Object Storage chưa được cấu hình đầy đủ.");
  }

  const publicBaseUrl = `${endpoint.replace(/\/$/, "")}/${STORY_COVER_BUCKET}`;
  return new Files({
    adapter: neon({
      bucket: STORY_COVER_BUCKET,
      endpoint,
      region,
      accessKeyId,
      secretAccessKey,
      publicBaseUrl,
    }),
  });
}

async function validateWebp(file: File) {
  if (file.type !== "image/webp") {
    throw new StoryCoverValidationError("Ảnh bìa phải được xử lý thành WebP.");
  }
  if (file.size === 0 || file.size > MAX_STORY_COVER_BYTES) {
    throw new StoryCoverValidationError("Ảnh bìa WebP phải nhỏ hơn 1 MB.");
  }
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const signature = String.fromCharCode(...header);
  if (!signature.startsWith("RIFF") || signature.slice(8, 12) !== "WEBP") {
    throw new StoryCoverValidationError("File ảnh bìa không phải WebP hợp lệ.");
  }
}

export async function uploadStoryCover(storyId: string, file: File) {
  await validateWebp(file);
  const path = `stories/${storyId}/${crypto.randomUUID()}.webp`;
  const storage = getStoryCoverStorage();
  await storage.upload(path, await file.arrayBuffer(), {
    cacheControl: "public, max-age=31536000, immutable",
    contentType: "image/webp",
  });
  return { path, publicUrl: await storage.url(path) };
}

function storagePathFromUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const marker = `/${STORY_COVER_BUCKET}/`;
    const markerIndex = parsed.pathname.indexOf(marker);
    return markerIndex >= 0 ? decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length)) : null;
  } catch {
    return null;
  }
}

export async function deleteStoryCover(urlOrPath: string | null | undefined) {
  const path = urlOrPath?.startsWith("stories/") ? urlOrPath : storagePathFromUrl(urlOrPath);
  if (!path) return;
  await getStoryCoverStorage().delete(path);
}
