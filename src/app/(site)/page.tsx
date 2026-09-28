import Link from "next/link";
import { HeroSpotlight } from "@/components/home/hero-spotlight";
import { FeaturedBookGrid } from "@/components/home/featured-book-grid";
import { LatestUpdatesFeed } from "@/components/home/latest-updates-feed";
import { RankingLeaderboard } from "@/components/home/ranking-leaderboard";
import { CompletedShowcase } from "@/components/home/completed-showcase";
import { getHomepageStories } from "@/db/queries/stories";
import { LayoutGrid, Lightbulb } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const { latestUpdated, newest, hot, completed, allGenres } =
    await getHomepageStories();
  const featured = hot[0] ?? latestUpdated[0] ?? null;

  return (
    <main className="min-h-screen bg-slate-50/50 pb-16">
      {/* Hero Spotlight */}
      <HeroSpotlight featuredStory={featured} genres={allGenres} />

      {/* Main Content Sections */}
      <div className="site-container py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Column */}
          <div className="space-y-8 lg:col-span-8">
            <FeaturedBookGrid stories={newest} />
            <LatestUpdatesFeed stories={latestUpdated} />
            <CompletedShowcase stories={completed} />
          </div>

          {/* Sidebar Column */}
          <aside className="space-y-8 lg:col-span-4">
            <RankingLeaderboard stories={hot} />

            {/* Genre Navigation Card */}
            {allGenres.length > 0 && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#0f766e]">
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#0f766e] block">
                        DANH MỤC
                      </span>
                      <h2 className="text-base font-bold text-slate-900">Khám phá theo thể loại</h2>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allGenres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/the-loai/${genre.slug}`}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-[#0f766e]"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reading tip card */}
            <div className="rounded-3xl border border-teal-200/60 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent p-5 sm:p-6">
              <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-teal-700" />
                <span>Mẹo đọc truyện</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-slate-900">
                Lưu tiến độ đọc tự động
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Mộc Thư tự động ghi nhớ chương bạn đang đọc dở trên trình duyệt, không cần đăng nhập vẫn tiếp tục đọc mượt mà.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
