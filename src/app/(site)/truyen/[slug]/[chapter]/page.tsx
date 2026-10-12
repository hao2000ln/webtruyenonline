import type { Metadata } from "next";
import Script from "next/script";
import { notFound, permanentRedirect } from "next/navigation";
import { ReaderExperience } from "@/components/reader/reader-experience";
import { recordChapterView } from "@/db/mutations/public-views";
import { getChapterForReader } from "@/db/queries/stories";
import { sanitizeChapterContent } from "@/lib/chapter-content";
import { formatChapterNumber, formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string; chapter: string }> };

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mocthu.vn";

// Chapter content rarely changes after publish — cache for 1 hour
export const revalidate = 3600;

function parseChapterNumberInput(value: string) {
  // Hỗ trợ cả chuẩn "chuong-1", dạng cũ "chapter-1", "chap-1" và số trần "1"
  const match = /^(?:chuong-|chapter-|chap-)?(\d+(?:\.\d{1,3})?)$/i.exec(value);
  return match?.[1] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapter } = await params;
  const chapterNumber = parseChapterNumberInput(chapter);
  const data = chapterNumber ? await getChapterForReader(slug, chapterNumber) : null;

  if (!data) return { title: "Không tìm thấy chương" };

  const chapterNum = formatChapterNumber(data.chapter.number);
  const canonicalSegment = `chuong-${chapterNum}`;
  if (chapter !== canonicalSegment) {
    permanentRedirect(`/truyen/${data.story.slug}/${canonicalSegment}`);
  }

  const title = `${data.story.title} - Chương ${chapterNum}: ${data.chapter.title}`;
  const description = `Đọc ${data.story.title} chương ${chapterNum}: ${data.chapter.title} tại Mộc Thư.`;
  const canonicalUrl = `${APP_URL}/truyen/${data.story.slug}/${canonicalSegment}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title,
      description,
      siteName: "Mộc Thư",
      locale: "vi_VN",
      ...(data.chapter.publishedAt
        ? { publishedTime: new Date(data.chapter.publishedAt).toISOString() }
        : {}),
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { slug, chapter } = await params;
  const chapterPathNumber = parseChapterNumberInput(chapter);
  const data = chapterPathNumber ? await getChapterForReader(slug, chapterPathNumber) : null;

  if (!data) notFound();

  // Chuẩn hóa URL: Chuyển hướng 308 nếu đường dẫn không ở định dạng chuẩn SEO (ví dụ /1 hoặc /chuong-01)
  const chapterNum = formatChapterNumber(data.chapter.number);
  const canonicalSegment = `chuong-${chapterNum}`;
  if (chapter !== canonicalSegment) {
    permanentRedirect(`/truyen/${data.story.slug}/${canonicalSegment}`);
  }

  void recordChapterView(data.story.id, data.chapter.id).catch(() => {});

  const paragraphs = sanitizeChapterContent(data.chapter.content)
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const nextHref = data.nextChapter
    ? `/truyen/${data.story.slug}/chuong-${formatChapterNumber(data.nextChapter.number)}`
    : null;
  const prevHref = data.previousChapter
    ? `/truyen/${data.story.slug}/chuong-${formatChapterNumber(data.previousChapter.number)}`
    : null;

  // JSON-LD: Article (chapter)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${data.story.title} - Chương ${chapterNum}: ${data.chapter.title}`,
    name: data.chapter.title,
    url: `${APP_URL}/truyen/${data.story.slug}/chuong-${chapterNum}`,
    isPartOf: {
      "@type": "Book",
      name: data.story.title,
      url: `${APP_URL}/truyen/${data.story.slug}`,
    },
    inLanguage: "vi",
    publisher: {
      "@type": "Organization",
      name: "Mộc Thư",
      url: APP_URL,
    },
    ...(data.chapter.publishedAt
      ? {
          datePublished: new Date(data.chapter.publishedAt).toISOString().split("T")[0],
          dateModified: new Date(data.chapter.publishedAt).toISOString().split("T")[0],
        }
      : {}),
  };

  // JSON-LD: BreadcrumbList
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: APP_URL },
      { "@type": "ListItem", position: 2, name: data.story.title, item: `${APP_URL}/truyen/${data.story.slug}` },
      { "@type": "ListItem", position: 3, name: `Chương ${chapterNum}`, item: `${APP_URL}/truyen/${data.story.slug}/chuong-${chapterNum}` },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="jsonld-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="jsonld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* Prefetch next chapter while user reads current one */}
      {nextHref && <link rel="prefetch" href={nextHref} />}
      {/* Prev/next navigation hints for crawlers */}
      {prevHref && <link rel="prev" href={prevHref} />}
      {nextHref && <link rel="next" href={nextHref} />}
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
