import Link from "next/link";
import { Highlighter, NotebookPen } from "lucide-react";
import { getUserReaderAnnotations } from "@/db/queries/reader-annotations";
import { requireUser } from "@/lib/auth/user";
import { formatChapterNumber, formatDate } from "@/lib/format";

const colorClass: Record<string, string> = {
  yellow: "border-amber-300 bg-amber-50",
  green: "border-emerald-300 bg-emerald-50",
  pink: "border-pink-300 bg-pink-50",
  blue: "border-sky-300 bg-sky-50",
};

export const dynamic = "force-dynamic";

export default async function ReaderNotesPage() {
  const user = await requireUser();
  const annotations = await getUserReaderAnnotations(user.id);

  return (
    <main className="site-container py-8 sm:py-12">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
          <NotebookPen className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Sổ tay đọc truyện</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Ghi chú của tôi</h1>
          <p className="mt-2 text-sm text-slate-600">Chỉ hiển thị các đoạn bạn đã nhập nội dung ghi chú.</p>
        </div>
      </div>

      {annotations.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Highlighter className="mx-auto size-8 text-slate-400" />
          <h2 className="mt-4 text-lg font-bold text-slate-900">Chưa có ghi chú nào</h2>
          <p className="mt-2 text-sm text-slate-500">Trong Reader, hãy bôi đen một câu, chọn Ghi chú rồi nhập nội dung cần lưu.</p>
          <Link href="/" className="mt-5 inline-flex rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            Tìm truyện để đọc
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {annotations.map((annotation) => (
            <article
              key={annotation.id}
              className={`rounded-2xl border p-5 ${colorClass[annotation.color] ?? colorClass.yellow}`}
            >
              <blockquote className="text-base font-medium leading-7 text-slate-900">“{annotation.quoteText}”</blockquote>
              {annotation.noteText ? (
                <p className="mt-4 whitespace-pre-wrap rounded-xl bg-white/70 p-3 text-sm leading-6 text-slate-700">
                  {annotation.noteText}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-3 text-xs text-slate-600">
                <div>
                  <p className="font-bold text-slate-800">{annotation.storyTitle}</p>
                  <p>Chương {formatChapterNumber(annotation.chapterNumber)}: {annotation.chapterTitle}</p>
                </div>
                <div className="text-right">
                  <Link
                    href={`/truyen/${annotation.storySlug}/chuong-${formatChapterNumber(annotation.chapterNumber)}`}
                    className="font-bold text-teal-700 hover:underline"
                  >
                    Mở đoạn đọc
                  </Link>
                  <p className="mt-1">{formatDate(annotation.updatedAt)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
