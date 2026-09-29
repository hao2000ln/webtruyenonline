import Link from "next/link";
import { HeroStoryCover } from "@/components/story/story-cover";
import type { StoryCardData } from "@/db/queries/stories";
import { formatCompactNumber } from "@/lib/format";
import { BookOpen, Eye, Compass, Sparkles } from "lucide-react";

type HeroSpotlightProps = {
  featuredStory?: StoryCardData | null;
  genres: Array<{ id: string; name: string; slug: string }>;
};

export function HeroSpotlight({ featuredStory, genres }: HeroSpotlightProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-teal-50/40 via-white to-slate-50/50 py-8 sm:py-8">
      {/* Decorative Glow */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal-100/50 blur-3xl"
        aria-hidden="true"
      />

      <div className="site-container relative z-10">
        {featuredStory ? (
          <div className="grid items-center gap-8 rounded-3xl border border-teal-700/10 bg-white/90 p-6 shadow-sm backdrop-blur-xs sm:p-8 lg:grid-cols-[1fr_260px] xl:grid-cols-[1fr_300px]">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                  MỘC THƯ NỔI BẬT
                </span>
                <span className="text-xs text-slate-400">Được biên tập viên đề xuất</span>
              </div>

              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                <Link
                  href={`/truyen/${featuredStory.slug}`}
                  className="transition hover:text-teal-700"
                >
                  {featuredStory.title}
                </Link>
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 sm:text-sm">
                <span>
                  Tác giả: <strong className="font-bold text-slate-800">{featuredStory.authorName ?? "Khuyết danh"}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                  <span><strong className="font-bold text-slate-800">{featuredStory.totalChapters}</strong> chương</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-teal-700" />
                  <span><strong className="font-bold text-slate-800">{formatCompactNumber(featuredStory.viewCount)}</strong> lượt đọc</span>
                </span>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 line-clamp-3">
                {featuredStory.description ?? "Khám phá những câu chuyện dài đầy cảm xúc và lôi cuốn trên Mộc Thư."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/truyen/${featuredStory.slug}`}
                  className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-teal-700/20 transition hover:bg-teal-800 active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Đọc ngay tác phẩm</span>
                </Link>
                <Link
                  href="/the-loai"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
                >
                  <Compass className="w-4 h-4 text-slate-500" />
                  <span>Khám phá thể loại</span>
                </Link>
              </div>
            </div>

            <div className="hidden justify-center lg:flex">
              <Link href={`/truyen/${featuredStory.slug}`} className="transition duration-300 hover:scale-[1.02]">
                <HeroStoryCover
                  title={featuredStory.title}
                  coverUrl={featuredStory.coverUrl}
                  authorName={featuredStory.authorName}
                  className="w-52"
                />
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900">Thư viện truyện chữ Mộc Thư</h1>
            <p className="mt-2 text-slate-600">Không gian đọc yên tĩnh cho những câu chuyện dài.</p>
          </div>
        )}

        {/* Quick Genre Pills Bar */}
        {genres.length > 0 && (
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Thể loại hot:
            </span>
            {genres.map((genre) => (
              <Link
                key={genre.id}
                href={`/the-loai/${genre.slug}`}
                className="shrink-0 rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-teal-600 hover:bg-teal-50 hover:text-teal-700 shadow-2xs"
              >
                {genre.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
