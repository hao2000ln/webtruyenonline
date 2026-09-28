"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type Quill from "quill";
import type { ChapterFormState } from "@/app/admin/(dashboard)/chapters/actions";

type Values = { storyId: string; chapterNumber: string; title: string; slug: string; content: string; isPublished: boolean; publishedAt: Date | null };
type Props = { action: (state: ChapterFormState, formData: FormData) => Promise<ChapterFormState>; stories: Array<{ id: string; title: string }>; chapter?: Values };
const initialState: ChapterFormState = {};
const inputClass = "mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function localDate(value: Date | null | undefined) {
  if (!value) return "";
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}
function ErrorText({ value }: { value?: string[] }) { return value?.[0] ? <p className="mt-1 text-sm text-red-600">{value[0]}</p> : null; }

export function ChapterForm({ action, stories, chapter }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [slug, setSlug] = useState(chapter?.slug ?? slugify(chapter?.title ?? ""));
  const [slugTouched, setSlugTouched] = useState(Boolean(chapter));
  const [title, setTitle] = useState(chapter?.title ?? "");
  const [content, setContent] = useState(chapter?.content ?? "");
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const wordCount = content.trim() ? content.trim().split(/\s+/u).length : 0;
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    let active = true;
    void import("quill").then(({ default: QuillEditor }) => {
      if (!active || !editorRef.current || quillRef.current) return;
      const editor = new QuillEditor(editorRef.current, {
        theme: "snow",
        placeholder: "Viết nội dung chương tại đây...",
        modules: {
          toolbar: [
            [{ header: [2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "link"],
            ["clean"],
          ],
        },
      });
      if (/<[a-z][\s\S]*>/i.test(content)) {
        editor.clipboard.dangerouslyPasteHTML(0, content, "silent");
      } else {
        editor.setText(content, "silent");
      }
      editor.on("text-change", () => {
        setDirty(true);
        setContent(editor.root.innerHTML);
      });
      quillRef.current = editor;
    });
    return () => { active = false; };
  // The editor intentionally initializes once; later content edits are Quill-owned.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form action={formAction} onSubmit={() => setDirty(false)} className="mt-8 space-y-6">
      {state.message ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Thông tin chương</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><label htmlFor="storyId" className="text-sm font-semibold text-slate-700">Truyện *</label><select id="storyId" name="storyId" required defaultValue={chapter?.storyId ?? ""} className={inputClass}><option value="" disabled>Chọn truyện</option>{stories.map((story) => <option key={story.id} value={story.id}>{story.title}</option>)}</select><ErrorText value={state.fieldErrors?.storyId} /></div>
          <div><label htmlFor="chapterNumber" className="text-sm font-semibold text-slate-700">Số chương *</label><input id="chapterNumber" name="chapterNumber" required inputMode="decimal" pattern="\d+(?:\.\d{1,3})?" defaultValue={chapter?.chapterNumber} className={inputClass} /><ErrorText value={state.fieldErrors?.chapterNumber} /></div>
          <div><label htmlFor="title" className="text-sm font-semibold text-slate-700">Tiêu đề *</label><input id="title" name="title" required maxLength={500} value={title} onChange={(event) => { setDirty(true); setTitle(event.target.value); if (!slugTouched) setSlug(slugify(event.target.value)); }} className={inputClass} /><ErrorText value={state.fieldErrors?.title} /></div>
          <div className="sm:col-span-2"><label htmlFor="slug" className="text-sm font-semibold text-slate-700">Slug *</label><input id="slug" name="slug" required maxLength={500} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value); }} className={inputClass} /><p className="mt-1 text-xs text-slate-500">Tự tạo từ tiêu đề, admin có thể chỉnh lại.</p><ErrorText value={state.fieldErrors?.slug} /></div>
          <div className="sm:col-span-2"><div className="flex flex-wrap items-center justify-between gap-3"><label htmlFor="content-editor" className="text-sm font-semibold text-slate-700">Nội dung *</label><div className="flex items-center gap-3"><span className="text-xs text-slate-500">{wordCount.toLocaleString("vi-VN")} từ</span><button type="button" onClick={() => setPreview((value) => !value)} className="text-xs font-semibold text-teal-700 hover:underline">{preview ? "Chỉnh sửa" : "Xem trước"}</button></div></div>{preview ? <div className="chapter-preview mt-2 min-h-[300px] rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-[15px] leading-7 text-slate-700" dangerouslySetInnerHTML={{ __html: content || "<p class='text-slate-400'>Chưa có nội dung để xem trước.</p>" }} /> : <div id="content-editor" ref={editorRef} className="chapter-quill mt-2 overflow-hidden rounded-lg border border-slate-300 bg-white" />}<input type="hidden" name="content" value={content} /><ErrorText value={state.fieldErrors?.content} /></div>
          <div><label htmlFor="publishedAt" className="text-sm font-semibold text-slate-700">Ngày xuất bản</label><input id="publishedAt" name="publishedAt" type="datetime-local" defaultValue={localDate(chapter?.publishedAt)} className={inputClass} /><ErrorText value={state.fieldErrors?.publishedAt} /></div>
          <label className="flex items-center gap-3 self-end pb-3"><input type="checkbox" name="isPublished" defaultChecked={chapter?.isPublished} className="size-4 accent-teal-700" /><span className="font-semibold text-slate-800">Xuất bản chương</span></label>
        </div>
      </section>
      <div className="flex justify-end gap-3"><Link href="/admin/chapters" className="button-secondary">Hủy</Link><button type="submit" disabled={pending} className="button-primary disabled:cursor-wait disabled:opacity-60">{pending ? "Đang lưu…" : chapter ? "Lưu thay đổi" : "Tạo chương"}</button></div>
    </form>
  );
}
