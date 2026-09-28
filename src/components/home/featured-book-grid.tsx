import Link from "next/link";
import { StoryCover } from "@/components/story/story-cover";
import type { StoryCardData } from "@/db/queries/stories";
import { formatCompactNumber, getStoryStatusLabel } from "@/lib/format";

type FeaturedBookGridProps = {
  stories: StoryCardData[];
};

export function FeaturedBookGrid({ stories }: FeaturedBookGridProps) {
  if (stories.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-1.5 rounded-full bg-[#0f766e]" aria-hidden="true" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0f766e] block">
              ĐỀ CỬ NỔI BẬT
            </span>
            <h2 className="text-lg font-bold text-slate-900">Truyện hot nên đọc</h2>
          </div>
        </div>
        <Link
          href="/the-loai"
          className="text-xs font-semibold text-slate-500 hover:text-[#0f766e] transition flex items-center gap-1"
        >
          <span>Xem tất cả</span>
          <span>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/truyen/${story.slug}`}
            className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/40 p-3 transition hover:bg-teal-50/40 hover:border-teal-100 hover:shadow-xs"
          >
            <div>
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-xs transition group-hover:scale-[1.02]">
                <StoryCover
                  title={story.title}
                  slug={story.slug}
                  coverUrl={story.coverUrl}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                  {story.totalChapters} chương
                </span>
              </div>

              <h3 className="mt-3 line-clamp-2 text-xs font-bold leading-snug text-slate-800 transition group-hover:text-[#0f766e] sm:text-sm">
                {story.title}
              </h3>
              <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                {story.authorName ?? "Khuyết danh"}
              </p>
            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
              <span
                className={`font-semibold ${
                  story.status === "COMPLETED" ? "text-emerald-600" : "text-teal-700"
                }`}
              >
                {getStoryStatusLabel(story.status)}
              </span>
              <span>{formatCompactNumber(story.viewCount)} đọc</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
