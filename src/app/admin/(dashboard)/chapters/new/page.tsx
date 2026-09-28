import type { Metadata } from "next";
import Link from "next/link";
import { createChapter } from "@/app/admin/(dashboard)/chapters/actions";
import { ChapterForm } from "@/components/admin/chapter-form";
import { getAdminChapterOptions } from "@/db/queries/admin-chapters";

export const metadata: Metadata = { title: "Thêm chương" };
export default async function NewChapterPage() { const stories = await getAdminChapterOptions(); return <><nav className="text-sm text-slate-500"><Link href="/admin/chapters" className="hover:text-teal-700">Chương</Link> / Thêm mới</nav><h1 className="mt-3 text-3xl font-bold text-slate-950">Thêm chương</h1><p className="mt-2 text-slate-600">Nội dung sẽ được tính số từ tự động khi lưu.</p><ChapterForm action={createChapter} stories={stories} /></>; }
