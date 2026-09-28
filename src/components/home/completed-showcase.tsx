import Link from "next/link";
import { StoryCover } from "@/components/story/story-cover";
import type { StoryCardData } from "@/db/queries/stories";
import { formatCompactNumber } from "@/lib/format";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type CompletedShowcaseProps = {
  stories: StoryCardData[];
};

export function CompletedShowcase({ stories }: CompletedShowcaseProps) {
  if (stories.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 block">
              TRỌN BỘ HOÀN HẢO
            </span>
            <h2 className="text-lg font-bold text-slate-900">Truyện đã hoàn thành</h2>
          </div>
        </div>
        <Link
          href="/the-loai"
          className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition flex items-center gap-1"
        >
          <span>Xem thêm</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stories.slice(0, 6).map((story) => (
          <Link
            key={story.id}
            href={`/truyen/${story.slug}`}
            className="group flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/40 p-2.5 transition hover:bg-emerald-50/40 hover:border-emerald-100 hover:shadow-xs"
          >
            <div className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-lg shadow-2xs">
              <StoryCover
                title={story.title}
                slug={story.slug}
                coverUrl={story.coverUrl}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h3 className="line-clamp-2 text-xs font-bold leading-snug text-slate-800 transition group-hover:text-emerald-700">
                  {story.title}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                  {story.authorName ?? "Khuyết danh"}
                </p>
              </div>
              <div className="text-[10px] text-slate-400">
                <span className="font-semibold text-emerald-700 block">
                  {story.totalChapters} chương (Full)
                </span>
                <span>{formatCompactNumber(story.viewCount)} đọc</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
