import Link from "next/link";
import type { StoryCardData } from "@/db/queries/stories";
import { formatCompactNumber } from "@/lib/format";
import { Trophy } from "lucide-react";

type RankingLeaderboardProps = {
  stories: StoryCardData[];
};

export function RankingLeaderboard({ stories }: RankingLeaderboardProps) {
  if (stories.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block">
              BẢNG VÀNG
            </span>
            <h2 className="text-base font-bold text-slate-900">Được đọc nhiều nhất</h2>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Top Reads</span>
      </div>

      <div className="space-y-3">
        {stories.slice(0, 10).map((story, index) => {
          const rank = index + 1;
          const isTop1 = rank === 1;
          const isTop2 = rank === 2;
          const isTop3 = rank === 3;

          return (
            <Link
              key={story.id}
              href={`/truyen/${story.slug}`}
              className="group flex items-center justify-between rounded-xl p-2 transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-black transition ${
                    isTop1
                      ? "bg-amber-400 text-slate-950 shadow-xs ring-2 ring-amber-400/30"
                      : isTop2
                      ? "bg-slate-300 text-slate-900"
                      : isTop3
                      ? "bg-amber-700 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {rank}
                </span>

                <div className="min-w-0">
                  <h3 className="line-clamp-1 text-xs font-bold text-slate-800 transition group-hover:text-[#0f766e]">
                    {story.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {story.authorName ?? "Khuyết danh"}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2 text-right">
                <span className="text-xs font-bold text-teal-700">
                  {formatCompactNumber(story.viewCount)}
                </span>
                <span className="block text-[9px] text-slate-400">lượt đọc</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
