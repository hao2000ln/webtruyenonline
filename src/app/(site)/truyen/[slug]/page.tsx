import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ContinueReadingButton } from "@/components/reader/continue-reading-button";
import { ChapterFilters } from "@/components/story/chapter-filters";
import { FollowButton } from "@/components/story/follow-button";
import { HeroStoryCover } from "@/components/story/story-cover";
import { getStoryChapters, getStoryDetail, type ChapterSort } from "@/db/queries/stories";
import { formatChapterNumber, formatCompactNumber, formatDate, formatReadingTime, getStoryStatusLabel, getStoryStatusColor } from "@/lib/format";
import { Pagination } from "@/components/ui/pagination";
import { BookOpen, Eye, Calendar, Clock, Zap } from "lucide-react";

// Cache rendered HTML for 5 minutes — re-renders only when content changes or cache expires
export const revalidate = 300;


type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readPage(value: string | string[] | undefined) {
  const page = Number.parseInt(readParam(value), 10);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function chapterListUrl(slug: string, query: string, sort: ChapterSort, page: number) {
  const searchParams = new URLSearchParams({ sort });
  if (query) searchParams.set("q", query);
  if (page > 1) searchParams.set("page", String(page));
  return `/truyen/${slug}?${searchParams.toString()}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryDetail(slug);

  if (!story) return { title: "Không tìm thấy truyện" };

  return {
    title: story.title,
    description: story.description ?? `Mộc Thư ${story.title} online.`,
  };
}

export default async function StoryDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const queryParams = await searchParams;
  const query = readParam(queryParams.q).trim().slice(0, 100);
  const sort: ChapterSort = readParam(queryParams.sort) === "oldest" ? "oldest" : "newest";
  const requestedPage = readPage(queryParams.page);
  const story = await getStoryDetail(slug);

  if (!story) notFound();

  const chapterResult = await getStoryChapters(story.id, query, sort, requestedPage);
  if (requestedPage !== chapterResult.page) {
    redirect(chapterListUrl(story.slug, chapterResult.query, sort, chapterResult.page));
  }

  const paginationParams: Record<string, string> = { sort };
  if (chapterResult.query) paginationParams.q = chapterResult.query;

  const primaryGenre = story.genres[0];

  return (
    <main className="site-container py-6 sm:py-10">
      {/* 1. Breadcrumbs */}
      <nav
        className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm"
        aria-label="Điều hướng"
      >
        <Link href="/" className="transition hover:text-teal-700">
          Trang chủ
        </Link>
        <span aria-hidden="true" className="text-slate-300">
          &gt;
        </span>
        {primaryGenre && (
          <>
            <Link
              href={`/the-loai/${primaryGenre.slug}`}
              className="transition hover:text-teal-700"
            >
              {primaryGenre.name}
            </Link>
            <span aria-hidden="true" className="text-slate-300">
              &gt;
            </span>
          </>
        )}
        <span className="font-semibold text-slate-900">{story.title}</span>
      </nav>

      {/* 2. Main Story Card Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm mb-8 transition-all sm:p-8">
        {/* Decorative Accent Background Glow */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal-50/60 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col md:flex-row gap-8">
          <HeroStoryCover
            title={story.title}
            coverUrl={story.coverUrl}
            authorName={story.authorName}
            rating={story.ratingAvg ?? "4.9"}
            className="mx-auto md:mx-0"
          />

          <div className="flex flex-grow flex-col justify-between">
            <div>
              {/* Badges & Tags Row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStoryStatusColor(story.status)} bg-slate-50 border border-slate-200/80 shadow-2xs`}>
                  {getStoryStatusLabel(story.status)}
                </span>

                {story.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/the-loai/${genre.slug}`}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-teal-50 hover:text-[#0f766e] text-slate-600 border border-slate-200/60 transition"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {/* Story Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                {story.title}
              </h1>

              {/* Author & Stats Line */}
              <div className="flex flex-wrap items-center text-xs sm:text-sm text-slate-500 gap-y-2 gap-x-4 mb-5">
                <p className="flex items-center">
                  Tác giả:{" "}
                  <strong className="font-bold text-slate-800 ml-1 hover:text-[#0f766e] transition">
                    {story.authorName ?? "Khuyết danh"}
                  </strong>
                </p>
                <span className="text-slate-300">•</span>
                <p className="flex items-center gap-1 text-slate-700">
                  <BookOpen className="w-3.5 h-3.5 text-[#0f766e]" />
                  <span className="font-bold text-slate-900">{story.totalChapters}</span> chương
                </p>
                <span className="text-slate-300">•</span>
                <p className="flex items-center gap-1 text-slate-700">
                  <Eye className="w-3.5 h-3.5 text-[#0f766e]" />
                  <span className="font-bold text-slate-900">
                    {formatCompactNumber(story.viewCount)}
                  </span>{" "}
                  lượt đọc
                </p>
                <span className="text-slate-300">•</span>
                <p className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Cập nhật {formatDate(story.latestChapterAt)}
                </p>
              </div>

              {/* Synopsis Box */}
              <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-100 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tóm tắt tác phẩm
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                  {story.description ?? "Truyện chưa có mô tả tóm tắt."}
                </p>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {story.firstChapter ? (
                <div className="w-full sm:w-auto [&>a]:w-full [&>a]:justify-center">
                  <ContinueReadingButton
                    storySlug={story.slug}
                    firstChapterHref={`/truyen/${story.slug}/chuong-${formatChapterNumber(story.firstChapter.number)}`}
                  />
                </div>
              ) : null}

              {story.latestChapter ? (
                <Link
                  href={`/truyen/${story.slug}/chuong-${formatChapterNumber(story.latestChapter.number)}`}
                  className="w-full sm:w-auto justify-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold px-5 py-3.5 rounded-xl transition flex items-center space-x-2 hover:border-slate-300 shadow-2xs active:scale-95"
                >
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                  <span>Chương mới nhất</span>
                </Link>
              ) : null}

              <FollowButton storySlug={story.slug} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Chapter List Section (Mục Lục) */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-6 bg-[#0f766e] rounded-full" />
            <div>
              <span className="text-[10px] font-bold text-[#0f766e] uppercase tracking-widest block">
                MỤC LỤC
              </span>
              <h3 className="font-extrabold text-slate-900 text-lg">Danh sách chương</h3>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-full w-fit">
            <span className="font-bold text-slate-800">{chapterResult.total}</span> / {story.totalChapters} chương đã xuất bản
          </span>
        </div>

        <ChapterFilters
          key={`${chapterResult.query}:${sort}`}
          pathname={`/truyen/${story.slug}`}
          query={chapterResult.query}
          sort={sort}
        />

        {chapterResult.chapters.length > 0 ? (
          <>
            <div className="mt-6 space-y-2">
              {chapterResult.chapters.map((chapter, index) => {
                const number = formatChapterNumber(chapter.number);
                const isLatestIndex = index === 0 && sort === "newest";
                return (
                  <Link
                    key={chapter.id}
                    href={`/truyen/${story.slug}/chuong-${number}`}
                    className="group flex items-center justify-between p-3.5 rounded-xl hover:bg-teal-50/60 border border-transparent hover:border-teal-100 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 transition ${isLatestIndex
                          ? "bg-teal-100 text-[#0f766e] group-hover:bg-[#0f766e] group-hover:text-white"
                          : "bg-slate-100 text-slate-600 font-semibold group-hover:bg-[#0f766e] group-hover:text-white"
                          }`}
                      >
                        {number}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 group-hover:text-[#0f766e] transition truncate">
                        Chương {number}: {chapter.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 flex-shrink-0 ml-2">
                      <span className="hidden sm:inline">{formatDate(chapter.publishedAt)}</span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="bg-slate-100 group-hover:bg-teal-100 group-hover:text-[#0f766e] px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-500 transition flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 group-hover:text-[#0f766e]" />
                        <span>{formatReadingTime(chapter.wordCount)}</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <Pagination
                currentPage={chapterResult.page}
                totalPages={chapterResult.totalPages}
                pathname={`/truyen/${story.slug}`}
                params={paginationParams}
              />
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            <span className="text-2xl mb-2 text-slate-300 block">🔍</span>
            <p>Không tìm thấy chương nào khớp với từ khóa.</p>
            {chapterResult.query ? (
              <Link
                href={chapterListUrl(story.slug, "", sort, 1)}
                className="mt-3 inline-block text-xs font-bold text-[#0f766e] hover:underline"
              >
                Xem toàn bộ chương
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}

