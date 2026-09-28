import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContinueReadingButton } from "@/components/reader/continue-reading-button";
import { StoryCover } from "@/components/story/story-cover";
import { getStoryDetail } from "@/db/queries/stories";
import { formatChapterNumber, formatCompactNumber, formatDate, getStoryStatusLabel } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryDetail(slug);

  if (!story) return { title: "Không tìm thấy truyện" };

  return {
    title: story.title,
    description: story.description ?? `Mộc Thư ${story.title} online.`,
  };
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const story = await getStoryDetail(slug);

  if (!story) notFound();

  return (
    <main className="site-container py-8 sm:py-12">
      <nav className="mb-7 flex items-center gap-2 text-sm text-content-muted" aria-label="Điều hướng">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-content-secondary">{story.title}</span>
      </nav>

      <section className="panel grid gap-7 sm:grid-cols-[220px_1fr]">
        <StoryCover title={story.title} slug={story.slug} className="mx-auto w-[180px] sm:mx-0 sm:w-[220px]" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${story.status === "COMPLETED" ? "badge-success" : story.status === "HIATUS" ? "badge-accent" : "badge-primary"}`}>{getStoryStatusLabel(story.status)}</span>
            {story.genres.map((genre) => (
              <Link key={genre.id} href={`/the-loai/${genre.slug}`} className="badge bg-slate-100 text-content-secondary transition hover:bg-slate-200">
                {genre.name}
              </Link>
            ))}
          </div>
          <h1 className="mt-4 text-[22px] font-bold leading-tight tracking-tight text-content sm:text-[28px]">{story.title}</h1>
          <p className="mt-3 text-content-secondary">Tác giả: <span className="font-semibold text-content">{story.authorName ?? "Khuyết danh"}</span></p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-content-muted">
            <span><strong className="text-content">{story.totalChapters}</strong> chương</span>
            <span><strong className="text-content">{formatCompactNumber(story.viewCount)}</strong> lượt đọc</span>
            <span>Cập nhật {formatDate(story.latestChapterAt)}</span>
          </div>
          <p className="mt-6 max-w-3xl whitespace-pre-line leading-7 text-content-secondary">{story.description ?? "Truyện chưa có mô tả."}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {story.firstChapter ? (
              <ContinueReadingButton
                storySlug={story.slug}
                firstChapterHref={`/truyen/${story.slug}/chuong-${formatChapterNumber(story.firstChapter.number)}`}
              />
            ) : null}
            {story.latestChapter ? (
              <Link href={`/truyen/${story.slug}/chuong-${formatChapterNumber(story.latestChapter.number)}`} className="button-secondary button-lg">
                Chương mới nhất
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ui-border pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Mục lục</p>
            <h2 className="section-heading mt-1">Danh sách chương</h2>
          </div>
          <span className="text-sm text-content-secondary">{story.chapters.length} chương đã xuất bản</span>
        </div>

        {story.chapters.length > 0 ? (
          <ol className="divide-y divide-ui-border">
            {story.chapters.map((chapter) => {
              const number = formatChapterNumber(chapter.number);
              return (
                <li key={chapter.id}>
                  <Link href={`/truyen/${story.slug}/chuong-${number}`} className="grid min-h-[46px] gap-1 px-2 py-3 transition hover:bg-primary-soft/40 hover:text-primary sm:grid-cols-[1fr_auto] sm:items-center">
                    <span className="font-medium">Chương {number}: {chapter.title}</span>
                    <span className="text-xs text-content-muted">{formatDate(chapter.publishedAt)} · {chapter.wordCount} từ</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="py-10 text-center text-content-secondary">Truyện chưa có chương được xuất bản.</p>
        )}
      </section>
    </main>
  );
}
