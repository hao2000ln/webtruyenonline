import type { Metadata } from "next";
import { importChapters } from "@/app/admin/(dashboard)/import/actions";
import { ChapterImportForm } from "@/components/admin/chapter-import-form";
import { getAdminChapterOptions } from "@/db/queries/admin-chapters";

export const metadata: Metadata = { title: "Bulk Import Chapters" };

export default async function AdminImportPage() {
  const stories = await getAdminChapterOptions();
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Quản trị nội dung</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">Bulk Import Chapters</h1>
      <p className="mt-2 max-w-3xl text-slate-600">Nhập nhiều chương từ TXT, Markdown hoặc JSON; kiểm tra và chỉnh sửa trước khi lưu.</p>
      <ChapterImportForm action={importChapters} stories={stories} />
    </>
  );
}
