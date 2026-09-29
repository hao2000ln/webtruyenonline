import type { Metadata } from "next";
import { StoryResults } from "@/components/story/story-results";
import { Pagination } from "@/components/ui/pagination";
import { searchPublishedStories } from "@/db/queries/discovery";

type SearchParams = Promise<{ q?: string | string[]; page?: string | string[] }>;

// Cache kết quả tìm kiếm 60 giây — giảm tải DB khi nhiều người tìm cùng từ khóa
export const revalidate = 60;


function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readPage(value: string | string[] | undefined) {
  const page = Number.parseInt(readParam(value), 10);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const query = readParam((await searchParams).q).trim();
  return { title: query ? `Tìm kiếm: ${query}` : "Tìm kiếm truyện" };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const result = await searchPublishedStories(readParam(params.q), readPage(params.page));

  return (
    <main className="site-container min-h-[60vh] py-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Tìm trong thư viện</p>
        <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight text-content">Tìm truyện bạn muốn đọc</h1>
        <form action="/tim-kiem" className="mx-auto mt-7 flex max-w-2xl rounded-lg border border-ui-border bg-white p-1 focus-within:border-primary">
          <label htmlFor="search-query" className="sr-only">Tên truyện hoặc tác giả</label>
          <input id="search-query" name="q" type="search" defaultValue={result.query} maxLength={100} placeholder="Nhập tên truyện hoặc tác giả..." className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-content-muted" />
          <button type="submit" className="button-primary">Tìm kiếm</button>
        </form>
      </div>

      {!result.query ? (
        <section className="panel mx-auto mt-12 max-w-2xl border-dashed py-12 text-center">
          <h2 className="font-semibold text-content">Bắt đầu bằng một từ khóa</h2>
          <p className="mt-2 text-sm leading-6 text-content-secondary">Bạn có thể tìm theo tên truyện hoặc tên tác giả.</p>
        </section>
      ) : (
        <section className="mt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-ui-border pb-4">
            <div><p className="text-sm text-content-secondary">Kết quả cho</p><h2 className="mt-1 text-2xl font-bold text-content">“{result.query}”</h2></div>
            <span className="text-sm font-semibold text-content-secondary">{result.total} truyện</span>
          </div>
          {result.stories.length > 0 ? (
            <>
              <StoryResults stories={result.stories} />
              <Pagination currentPage={result.page} totalPages={result.totalPages} pathname="/tim-kiem" params={{ q: result.query }} />
            </>
          ) : (
            <div className="panel py-14 text-center">
              <h3 className="font-semibold text-content">Không tìm thấy truyện phù hợp</h3>
              <p className="mt-2 text-sm text-content-secondary">Hãy thử tên ngắn hơn hoặc kiểm tra lại chính tả.</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
