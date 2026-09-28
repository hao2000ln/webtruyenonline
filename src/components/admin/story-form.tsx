"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { StoryFormState } from "@/app/admin/(dashboard)/stories/actions";
import { StoryCoverUpload } from "@/components/admin/story-cover-upload";
import type { AdminStoryStatus } from "@/db/queries/admin-stories";

const initialStoryFormState: StoryFormState = {};

type StoryFormAction = (
  state: StoryFormState,
  formData: FormData,
) => Promise<StoryFormState>;

type StoryFormValues = {
  title: string;
  slug: string;
  originalTitle: string | null;
  description: string | null;
  coverUrl: string | null;
  authorId: string | null;
  status: AdminStoryStatus;
  isPublished: boolean;
  genreIds: string[];
};

type StoryFormProps = {
  action: StoryFormAction;
  authors: Array<{ id: string; name: string }>;
  genres: Array<{ id: string; name: string }>;
  story?: StoryFormValues;
};

const inputClass = "mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="mt-1.5 text-sm text-red-600">{errors[0]}</p> : null;
}

export function StoryForm({ action, authors, genres, story }: StoryFormProps) {
  const [state, formAction, pending] = useActionState(action, initialStoryFormState);
  const [coverProcessing, setCoverProcessing] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {state.message ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Thông tin cơ bản</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="text-sm font-semibold text-slate-700">Tên truyện *</label>
            <input id="title" name="title" required maxLength={500} defaultValue={story?.title} className={inputClass} />
            <FieldError errors={state.fieldErrors?.title} />
          </div>
          <div>
            <label htmlFor="slug" className="text-sm font-semibold text-slate-700">Slug *</label>
            <input id="slug" name="slug" required maxLength={500} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={story?.slug} className={inputClass} />
            <p className="mt-1.5 text-xs text-slate-500">Ví dụ: pham-nhan-tu-tien</p>
            <FieldError errors={state.fieldErrors?.slug} />
          </div>
          <div>
            <label htmlFor="originalTitle" className="text-sm font-semibold text-slate-700">Tên gốc</label>
            <input id="originalTitle" name="originalTitle" maxLength={500} defaultValue={story?.originalTitle ?? ""} className={inputClass} />
            <FieldError errors={state.fieldErrors?.originalTitle} />
          </div>
          <div>
            <label htmlFor="authorId" className="text-sm font-semibold text-slate-700">Tác giả</label>
            <select id="authorId" name="authorId" defaultValue={story?.authorId ?? ""} className={inputClass}>
              <option value="">Chưa chọn tác giả</option>
              {authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
            </select>
            <FieldError errors={state.fieldErrors?.authorId} />
          </div>
          <div>
            <label htmlFor="status" className="text-sm font-semibold text-slate-700">Trạng thái</label>
            <select id="status" name="status" defaultValue={story?.status ?? "ONGOING"} className={inputClass}>
              <option value="ONGOING">Đang ra</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="HIATUS">Tạm dừng</option>
            </select>
            <FieldError errors={state.fieldErrors?.status} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="coverFile" className="text-sm font-semibold text-slate-700">Ảnh bìa</label>
            <input type="hidden" name="coverUrl" value="" />
            <StoryCoverUpload existingCover={story?.coverUrl} onProcessingChange={setCoverProcessing} />
            <FieldError errors={state.fieldErrors?.coverUrl} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="text-sm font-semibold text-slate-700">Mô tả</label>
            <textarea id="description" name="description" rows={8} maxLength={20_000} defaultValue={story?.description ?? ""} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" />
            <FieldError errors={state.fieldErrors?.description} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Thể loại</h2>
        {genres.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {genres.map((genre) => (
              <label key={genre.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
                <input type="checkbox" name="genreIds" value={genre.id} defaultChecked={story?.genreIds.includes(genre.id)} className="size-4 accent-teal-700" />
                {genre.name}
              </label>
            ))}
          </div>
        ) : <p className="mt-3 text-sm text-slate-500">Chưa có thể loại. Hãy tạo thể loại trước.</p>}
        <FieldError errors={state.fieldErrors?.genreIds} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="isPublished" defaultChecked={story?.isPublished} className="mt-1 size-4 accent-teal-700" />
          <span><span className="block font-semibold text-slate-800">Xuất bản truyện</span><span className="mt-1 block text-sm text-slate-500">Truyện chỉ xuất hiện trên public site khi được xuất bản.</span></span>
        </label>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <Link href="/admin/stories" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Hủy</Link>
        <button type="submit" disabled={pending || coverProcessing} className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">
          {coverProcessing ? "Đang xử lý ảnh…" : pending ? "Đang lưu…" : story ? "Lưu thay đổi" : "Tạo truyện"}
        </button>
      </div>
    </form>
  );
}
