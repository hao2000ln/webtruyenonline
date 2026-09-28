"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const MAX_SOURCE_BYTES = 5 * 1024 * 1024;
const OUTPUT_WIDTH = 600;
const OUTPUT_HEIGHT = 900;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function canvasToWebp(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Trình duyệt không thể tạo ảnh WebP.")), "image/webp", 0.82);
  });
}

async function cropCover(file: File) {
  if (!allowedTypes.has(file.type)) throw new Error("Chỉ chấp nhận JPEG, PNG hoặc WebP.");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("Ảnh gốc phải nhỏ hơn 5 MB.");

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const targetRatio = OUTPUT_WIDTH / OUTPUT_HEIGHT;
  let sourceWidth = bitmap.width;
  let sourceHeight = bitmap.height;
  let sourceX = 0;
  let sourceY = 0;
  if (bitmap.width / bitmap.height > targetRatio) {
    sourceWidth = bitmap.height * targetRatio;
    sourceX = (bitmap.width - sourceWidth) / 2;
  } else {
    sourceHeight = bitmap.width / targetRatio;
    sourceY = (bitmap.height - sourceHeight) / 2;
  }
  if (sourceWidth < 300 || sourceHeight < 450) {
    bitmap.close();
    throw new Error("Ảnh quá nhỏ. Vùng crop tối thiểu là 300×450 px.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Không thể xử lý ảnh trong trình duyệt.");
  }
  context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  bitmap.close();
  return canvasToWebp(canvas);
}

export function StoryCoverUpload({ existingCover, onProcessingChange }: { existingCover?: string | null; onProcessingChange?: (processing: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [preview, setPreview] = useState(existingCover ?? "");
  const [removeCover, setRemoveCover] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  async function handleFile(file: File | undefined) {
    if (!file || !inputRef.current) return;
    setProcessing(true);
    onProcessingChange?.(true);
    setError("");
    try {
      const blob = await cropCover(file);
      const optimized = new File([blob], `cover-${Date.now()}.webp`, { type: "image/webp" });
      const transfer = new DataTransfer();
      transfer.items.add(optimized);
      inputRef.current.files = transfer.files;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = URL.createObjectURL(optimized);
      setPreview(objectUrlRef.current);
      setRemoveCover(false);
    } catch (caught) {
      inputRef.current.value = "";
      setError(caught instanceof Error ? caught.message : "Không thể xử lý ảnh bìa.");
    } finally {
      setProcessing(false);
      onProcessingChange?.(false);
    }
  }

  function remove() {
    if (inputRef.current) inputRef.current.value = "";
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPreview("");
    setRemoveCover(true);
    setError("");
  }

  return (
    <div className="mt-2 grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)]">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        {preview ? <Image src={preview} alt="Xem trước ảnh bìa" fill sizes="160px" unoptimized={preview.startsWith("blob:")} className="object-cover" /> : <div className="flex h-full items-center justify-center px-4 text-center text-xs text-slate-400">Chưa có ảnh bìa</div>}
      </div>
      <div>
        <input ref={inputRef} id="coverFile" name="coverFile" type="file" accept="image/jpeg,image/png,image/webp" disabled={processing} onChange={(event) => void handleFile(event.target.files?.[0])} className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-transparent file:font-semibold file:text-teal-700 disabled:opacity-60" />
        <input type="hidden" name="removeCover" value={removeCover ? "true" : "false"} />
        <p className="mt-2 text-xs leading-5 text-slate-500">JPEG, PNG hoặc WebP tối đa 5 MB. Ảnh được crop giữa theo tỷ lệ 2:3, resize 600×900 và chuyển WebP trước khi upload.</p>
        {processing ? <p className="mt-2 text-sm font-semibold text-teal-700">Đang tối ưu ảnh…</p> : null}
        {error ? <p role="alert" className="mt-2 text-sm text-red-600">{error}</p> : null}
        {preview ? <button type="button" onClick={remove} className="mt-3 text-sm font-semibold text-red-600 hover:underline">Xóa ảnh bìa</button> : null}
      </div>
    </div>
  );
}
