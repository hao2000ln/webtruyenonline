import Link from "next/link";
import { StoryCover } from "@/components/story/story-cover";
import { StorySection } from "@/components/story/story-section";
import { getHomepageStories } from "@/db/queries/stories";
import { formatCompactNumber } from "@/lib/format";

export const revalidate = 60;

export default async function HomePage() {
  const { latestUpdated, newest, hot, completed } = await getHomepageStories();
  const featured = latestUpdated[0];

  return (
    <main>
      <section className="border-b border-ui-border bg-surface">
        <div className="site-container grid gap-8 py-10 lg:grid-cols-[1fr_360px] lg:items-center lg:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Thư viện truyện chữ</p>
            <h1 className="mt-3 max-w-2xl text-[32px] font-bold leading-tight tracking-tight text-content">
              Một góc yên tĩnh cho những câu chuyện dài.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-content-secondary">
              Khám phá truyện mới, theo dõi chương vừa cập nhật và tận hưởng trải nghiệm đọc tập trung trên mọi thiết bị.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {featured ? (
                <Link href={`/truyen/${featured.slug}`} className="button-primary button-lg">
                  Mộc Thư nổi bật
                </Link>
              ) : null}
              <Link href="/the-loai" className="button-secondary button-lg">
                Khám phá thể loại
              </Link>
            </div>
          </div>

          {featured ? (
            <Link href={`/truyen/${featured.slug}`} className="story-card group grid grid-cols-[112px_1fr] gap-5 shadow-sm">
              <StoryCover title={featured.title} slug={featured.slug} className="w-28 transition group-hover:opacity-90" />
              <div className="self-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">Mới cập nhật</p>
                <h2 className="mt-2 text-xl font-bold leading-tight text-content group-hover:text-primary">{featured.title}</h2>
                <p className="mt-2 text-sm text-content-secondary">{featured.authorName ?? "Khuyết danh"}</p>
                <p className="mt-4 text-xs text-content-muted">{featured.totalChapters} chương · {formatCompactNumber(featured.viewCount)} lượt đọc</p>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <div className="site-container grid gap-6 py-10 lg:grid-cols-2">
        <StorySection title="Mới lên chương" eyebrow="Vừa cập nhật" stories={latestUpdated} />
        <StorySection title="Truyện mới" eyebrow="Bắt đầu hành trình" stories={newest} />
        <StorySection title="Được đọc nhiều" eyebrow="Đang được quan tâm" stories={hot} />
        <StorySection title="Truyện hoàn thành" eyebrow="Đọc trọn bộ" stories={completed} />
      </div>
    </main>
  );
}
