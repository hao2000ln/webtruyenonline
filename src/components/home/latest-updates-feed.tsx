import Link from "next/link";
import type { StoryCardData } from "@/db/queries/stories";
import { formatDate } from "@/lib/format";

type LatestUpdatesFeedProps = {
  stories: StoryCardData[];
};

export function LatestUpdatesFeed({ stories }: LatestUpdatesFeedProps) {
  if (stories.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-1.5 rounded-full bg-[#0f766e]" aria-hidden="true" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0f766e] block">
              CẬP NHẬT MỚI
            </span>
            <h2 className="text-lg font-bold text-slate-900">Mới lên chương</h2>
          </div>
        </div>
        <span className="text-xs text-slate-400">Tự động làm mới</span>
      </div>

      <div className="divide-y divide-slate-100">
        {stories.map((story) => (
          <div
            key={story.id}
            className="group flex flex-col sm:flex-row sm:items-center justify-between py-3 px-2 rounded-xl transition hover:bg-slate-50 gap-1.5"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href={`/truyen/${story.slug}`}
                className="font-bold text-sm text-slate-900 transition group-hover:text-[#0f766e] truncate max-w-[200px] sm:max-w-xs"
              >
                {story.title}
              </Link>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 text-xs text-slate-500">
              <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md text-[11px]">
                {story.totalChapters} chương
              </span>
              <span className="truncate text-slate-500 max-w-[120px] hidden md:inline">
                {story.authorName ?? "Khuyết danh"}
              </span>
              <span className="text-slate-400 text-[11px] shrink-0">
                {formatDate(story.latestChapterAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
