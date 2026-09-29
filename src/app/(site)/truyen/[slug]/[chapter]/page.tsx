import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReaderExperience } from "@/components/reader/reader-experience";
import { recordChapterView } from "@/db/mutations/public-views";
import { getChapterForReader } from "@/db/queries/stories";
import { sanitizeChapterContent } from "@/lib/chapter-content";
import { formatChapterNumber, formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string; chapter: string }> };

// Chapter content rarely changes after publish — cache for 1 hour
export const revalidate = 3600;


function parseChapterPath(value: string) {
  const match = /^chuong-(\d+(?:\.\d{1,3})?)$/.exec(value);
  return match?.[1] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapter } = await params;
  const chapterNumber = parseChapterPath(chapter);
  const data = chapterNumber ? await getChapterForReader(slug, chapterNumber) : null;

  if (!data) return { title: "Không tìm thấy chương" };

  return {
    title: `${data.story.title} - Chương ${formatChapterNumber(data.chapter.number)}`,
    description: `Đọc ${data.story.title}, chương ${formatChapterNumber(data.chapter.number)}: ${data.chapter.title}.`,
  };
}

export default async function ChapterPage({ params }: Props) {
  const { slug, chapter } = await params;
  const chapterPathNumber = parseChapterPath(chapter);
  const data = chapterPathNumber ? await getChapterForReader(slug, chapterPathNumber) : null;

  if (!data) notFound();
  void recordChapterView(data.story.id, data.chapter.id).catch(() => {});

  const paragraphs = sanitizeChapterContent(data.chapter.content)
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const nextHref = data.nextChapter
    ? `/truyen/${data.story.slug}/chuong-${formatChapterNumber(data.nextChapter.number)}`
    : null;

  return (
    <>
      {/* Prefetch next chapter while user reads current one */}
      {nextHref && <link rel="prefetch" href={nextHref} />}
      <ReaderExperience
        story={data.story}
        chapter={{
          number: data.chapter.number,
          title: data.chapter.title,
          wordCount: data.chapter.wordCount,
          publishedDate: formatDate(data.chapter.publishedAt),
        }}
        paragraphs={paragraphs}
        previousChapter={data.previousChapter}
        nextChapter={data.nextChapter}
        chapterList={data.chapterList}
      />
    </>
  );
}
