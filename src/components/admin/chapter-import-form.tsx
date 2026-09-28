"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { ChapterImportState } from "@/app/admin/(dashboard)/import/actions";
import {
  MAX_IMPORT_FILE_BYTES,
  parseChapterImport,
  type ParsedImportChapter,
} from "@/lib/chapter-import";
import { countChapterWords } from "@/lib/chapter-content";

type PreviewChapter = ParsedImportChapter & { selected: boolean };
type Props = {
  action: (state: ChapterImportState, formData: FormData) => Promise<ChapterImportState>;
  stories: Array<{ id: string; title: string }>;
};

const initialState: ChapterImportState = {};
const fieldClass = "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

export function ChapterImportForm({ action, stories }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [format, setFormat] = useState<"text" | "json">("text");
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [chapters, setChapters] = useState<PreviewChapter[]>([]);
  const [conflictMode, setConflictMode] = useState<"skip" | "update" | "abort">("skip");
  const selectedChapters = useMemo(() => chapters.filter((chapter) => chapter.selected), [chapters]);
  const payload = useMemo(
    () => JSON.stringify(selectedChapters.map((chapter) => ({ chapterNumber: chapter.chapterNumber, title: chapter.title, slug: chapter.slug, content: chapter.content }))),
    [selectedChapters],
  );

  function parseSource() {
    try {
      const parsed = parseChapterImport(source, format);
      setChapters(parsed.map((chapter) => ({ ...chapter, selected: true })));
      setParseError("");
    } catch (error) {
      setChapters([]);
      setParseError(error instanceof Error ? error.message : "Không thể đọc dữ liệu import.");
    }
  }

  async function loadFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_IMPORT_FILE_BYTES) {
      setParseError("File vượt quá giới hạn 2 MB.");
      return;
    }
    const nextFormat = file.name.toLowerCase().endsWith(".json") ? "json" : "text";
    setFormat(nextFormat);
    setSource(await file.text());
    setFileName(file.name);
    setChapters([]);
    setParseError("");
  }

  function updateChapter(index: number, field: keyof ParsedImportChapter, value: string) {
    setChapters((current) => current.map((chapter, rowIndex) => rowIndex === index ? { ...chapter, [field]: value } : chapter));
  }

  function toggleChapter(index: number) {
    setChapters((current) => current.map((chapter, rowIndex) => rowIndex === index ? { ...chapter, selected: !chapter.selected } : chapter));
  }

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">1. Nguồn dữ liệu</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <label htmlFor="storyId" className="text-sm font-semibold text-slate-700">Truyện *</label>
            <select id="storyId" name="storyId" required defaultValue="" className={`${fieldClass} mt-2`}>
              <option value="" disabled>Chọn truyện cần import</option>
              {stories.map((story) => <option key={story.id} value={story.id}>{story.title}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="importFile" className="text-sm font-semibold text-slate-700">Upload file</label>
            <input id="importFile" type="file" accept=".txt,.md,.json,text/plain,application/json" onChange={(event) => void loadFile(event.target.files?.[0])} className="mt-2 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-transparent file:font-semibold file:text-teal-700" />
            <p className="mt-1 text-xs text-slate-500">TXT, Markdown hoặc JSON; tối đa 2 MB và 200 chương.{fileName ? ` Đã chọn: ${fileName}` : ""}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="w-40">
            <label htmlFor="format" className="text-sm font-semibold text-slate-700">Định dạng</label>
            <select id="format" value={format} onChange={(event) => setFormat(event.target.value as "text" | "json")} className={`${fieldClass} mt-2`}>
              <option value="text">TXT / Markdown</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <button type="button" onClick={parseSource} className="button-secondary h-10">Phân tích và xem trước</button>
        </div>
        <textarea
          value={source}
          onChange={(event) => { setSource(event.target.value); setChapters([]); }}
          rows={12}
          spellCheck={false}
          placeholder={format === "json" ? '[{"chapterNumber":"1","title":"Mở đầu","content":"Nội dung..."}]' : "Chương 1: Mở đầu\nNội dung chương...\n\nChương 2: Gặp gỡ\nNội dung chương..."}
          className="mt-4 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm leading-6 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
        />
        {parseError ? <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{parseError}</p> : null}
      </section>

      {chapters.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-bold text-slate-950">2. Kiểm tra trước khi import</h2><p className="mt-1 text-sm text-slate-500">Đã chọn {selectedChapters.length}/{chapters.length} chương.</p></div>
            <button type="button" onClick={() => setChapters((current) => current.map((chapter) => ({ ...chapter, selected: true })))} className="text-sm font-semibold text-teal-700 hover:underline">Chọn tất cả</button>
          </div>
          <div className="mt-5 space-y-4">
            {chapters.map((chapter, index) => (
              <article key={index} className={`rounded-xl border p-4 ${chapter.selected ? "border-slate-200" : "border-slate-200 bg-slate-50 opacity-60"}`}>
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-3 font-semibold text-slate-900"><input type="checkbox" checked={chapter.selected} onChange={() => toggleChapter(index)} className="size-4 accent-teal-700" />Chương #{index + 1}</label>
                  <span className="text-xs text-slate-500">{countChapterWords(chapter.content).toLocaleString("vi-VN")} từ</span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[130px_minmax(0,1fr)_minmax(0,1fr)]">
                  <div><label className="text-xs font-semibold text-slate-600">Số chương</label><input value={chapter.chapterNumber} onChange={(event) => updateChapter(index, "chapterNumber", event.target.value)} className={`${fieldClass} mt-1`} /></div>
                  <div><label className="text-xs font-semibold text-slate-600">Tiêu đề</label><input value={chapter.title} onChange={(event) => updateChapter(index, "title", event.target.value)} className={`${fieldClass} mt-1`} /></div>
                  <div className="sm:col-span-2 lg:col-span-1"><label className="text-xs font-semibold text-slate-600">Slug</label><input value={chapter.slug} onChange={(event) => updateChapter(index, "slug", event.target.value)} className={`${fieldClass} mt-1`} /></div>
                </div>
                <div className="mt-4"><label className="text-xs font-semibold text-slate-600">Nội dung</label><textarea value={chapter.content} onChange={(event) => updateChapter(index, "content", event.target.value)} rows={5} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" /></div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {chapters.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">3. Xác nhận import</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div><label htmlFor="publishMode" className="text-sm font-semibold text-slate-700">Trạng thái</label><select id="publishMode" name="publishMode" defaultValue="draft" className={`${fieldClass} mt-2`}><option value="draft">Lưu tất cả dạng nháp</option><option value="publish">Xuất bản tất cả</option></select></div>
            <div><label htmlFor="conflictMode" className="text-sm font-semibold text-slate-700">Khi chương đã tồn tại</label><select id="conflictMode" name="conflictMode" value={conflictMode} onChange={(event) => setConflictMode(event.target.value as "skip" | "update" | "abort")} className={`${fieldClass} mt-2`}><option value="skip">Bỏ qua chương cũ</option><option value="update">Cập nhật chương cũ</option><option value="abort">Dừng và không lưu gì</option></select></div>
          </div>
          {conflictMode === "update" ? <label className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"><input type="checkbox" name="applyPublishModeToUpdates" className="mt-0.5 size-4 accent-teal-700" /><span><strong className="block text-sm text-amber-900">Áp dụng trạng thái import cho chương cập nhật</strong><span className="mt-1 block text-xs leading-5 text-amber-800">Bỏ chọn để giữ nguyên draft/publish và ngày xuất bản hiện tại. ID, lượt xem và ngày tạo luôn được giữ nguyên.</span></span></label> : null}
          <input type="hidden" name="chapters" value={payload} />
          {state.message ? <div role="status" className={`mt-5 rounded-lg border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}><p className="font-semibold">{state.message}</p>{state.conflicts?.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{state.conflicts.map((conflict, index) => <li key={`${conflict}-${index}`}>{conflict}</li>)}</ul> : null}</div> : null}
          <div className="mt-6 flex flex-wrap justify-end gap-3"><Link href="/admin/chapters" className="button-secondary">Hủy</Link><button type="submit" disabled={pending || selectedChapters.length === 0} className="button-primary disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Đang import…" : `Import ${selectedChapters.length} chương`}</button></div>
        </section>
      ) : null}
    </form>
  );
}
