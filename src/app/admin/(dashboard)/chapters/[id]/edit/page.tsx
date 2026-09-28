import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { updateChapter } from "@/app/admin/(dashboard)/chapters/actions";
import { ChapterForm } from "@/components/admin/chapter-form";
import { getAdminChapterForEdit, getAdminChapterOptions } from "@/db/queries/admin-chapters";

export const metadata: Metadata = { title: "Sửa chương" };
export default async function EditChapterPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; if (!z.string().uuid().safeParse(id).success) notFound(); const [chapter, stories] = await Promise.all([getAdminChapterForEdit(id), getAdminChapterOptions()]); if (!chapter) notFound(); return <><nav className="text-sm text-slate-500"><Link href="/admin/chapters" className="hover:text-teal-700">Chương</Link> / Sửa</nav><h1 className="mt-3 text-3xl font-bold text-slate-950">Sửa chương</h1><p className="mt-2 text-slate-600">Cập nhật chương {chapter.chapterNumber}: {chapter.title}.</p><ChapterForm action={updateChapter.bind(null, chapter.id)} stories={stories} chapter={chapter} /></>; }
