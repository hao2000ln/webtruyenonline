import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryResults } from "@/components/story/story-results";
import { Pagination } from "@/components/ui/pagination";
import { getGenreBySlug, getStoriesByGenre, type GenreStorySort } from "@/db/queries/discovery";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[]; sort?: string | string[] }>;
};

// Cache rendered HTML 5 phút — thể loại ít thay đổi
export const revalidate = 300;


function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readPage(value: string | string[] | undefined) {
  const page = Number.parseInt(readParam(value), 10);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mocthu.vn";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const genre = await getGenreBySlug((await params).slug);
  if (!genre) return { title: "Không tìm thấy thể loại" };
  const description = genre.description ?? `Danh sách truyện thể loại ${genre.name} hay nhất tại Mộc Thư.`;
  const canonicalUrl = `${APP_URL}/the-loai/${genre.slug}`;
  return {
    title: `Truyện ${genre.name}`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: `Truyện ${genre.name} | Mộc Thư`,
      description,
    },
  };
}


export default async function GenreDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const sort: GenreStorySort = readParam(query.sort) === "hot" ? "hot" : "latest";
  const result = await getStoriesByGenre(slug, readPage(query.page), sort);

  if (!result) notFound();

  return (
    <main className="site-container min-h-[60vh] py-10">
      <nav className="flex items-center gap-2 text-sm text-content-muted" aria-label="Điều hướng">
        <Link href="/the-loai" className="hover:text-primary">Thể loại</Link><span>/</span><span className="text-content-secondary">{result.genre.name}</span>
      </nav>
      <header className="mt-7 border-b border-ui-border pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Thể loại</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-content">{result.genre.name}</h1>
            <p className="mt-3 leading-7 text-content-secondary">{result.genre.description ?? "Danh sách truyện thuộc thể loại này."}</p>
          </div>
          <span className="text-sm font-semibold text-content-secondary">{result.total} truyện</span>
        </div>
      </header>

      <div className="my-6 flex items-center gap-2 text-sm">
        <span className="mr-1 text-content-secondary">Sắp xếp:</span>
        <Link href={`/the-loai/${slug}`} className={sort === "latest" ? "button-primary" : "button-secondary"}>Mới cập nhật</Link>
        <Link href={`/the-loai/${slug}?sort=hot`} className={sort === "hot" ? "button-primary" : "button-secondary"}>Đọc nhiều</Link>
      </div>

      {result.stories.length > 0 ? (
        <>
          <StoryResults stories={result.stories} />
          <Pagination currentPage={result.page} totalPages={result.totalPages} pathname={`/the-loai/${slug}`} params={sort === "hot" ? { sort: "hot" } : {}} />
        </>
      ) : (
        <div className="panel py-14 text-center text-content-secondary">Chưa có truyện nào thuộc thể loại này.</div>
      )}
    </main>
  );
}
