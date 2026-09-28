import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteChapterButton } from "@/components/admin/delete-chapter-button";
import { Pagination } from "@/components/ui/pagination";
import { getAdminChapterOptions, getAdminChapters, type AdminChapterSort } from "@/db/queries/admin-chapters";
import { formatChapterNumber, formatDate, formatReadingTime } from "@/lib/format";

export const metadata: Metadata = { title: "Quản lý chương" };
type Params = Promise<{ q?: string | string[]; storyId?: string | string[]; sort?: string | string[]; page?: string | string[]; pageSize?: string | string[]; created?: string; updated?: string; deleted?: string; error?: string }>;
const read = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";
function pageNumber(value: string | string[] | undefined) { const page = Number.parseInt(read(value), 10); return Number.isSafeInteger(page) && page > 0 ? page : 1; }
function listUrl(q: string, storyId: string, sort: AdminChapterSort, page: number) { const p = new URLSearchParams({ sort }); if (q) p.set("q", q); if (storyId) p.set("storyId", storyId); if (page > 1) p.set("page", String(page)); return `/admin/chapters?${p}`; }

export default async function AdminChaptersPage({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const query = read(params.q); const storyId = read(params.storyId);
  const sort: AdminChapterSort = read(params.sort) === "oldest" ? "oldest" : "newest";
  const requestedPage = pageNumber(params.page); const pageSize = [10, 20, 30, 50, 100].includes(Number(read(params.pageSize)) ) ? Number(read(params.pageSize)) : 10;
  const [result, storyOptions] = await Promise.all([getAdminChapters({ query, storyId, sort, requestedPage, pageSize }), getAdminChapterOptions()]);
  if (requestedPage !== result.page) redirect(listUrl(result.query, storyId, sort, result.page));
  const paginationParams: Record<string, string> = { sort, pageSize: String(result.pageSize) }; if (result.query) paginationParams.q = result.query; if (storyId) paginationParams.storyId = storyId;
  const notice = read(params.created) ? "Đã tạo chương." : read(params.updated) ? "Đã cập nhật chương." : read(params.deleted) ? "Đã xóa chương." : "";
  return <>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-teal-700">Quản trị nội dung</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Chương</h1><p className="mt-2 text-slate-600">{result.total} chương trong hệ thống.</p></div><Link href="/admin/chapters/new" className="button-primary">Thêm chương</Link></div>
    {notice ? <p className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p> : null}
    {read(params.error) ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Không thể thực hiện thao tác.</p> : null}
    <form method="get" className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_minmax(180px,280px)_160px_auto_auto]">
      <input name="q" type="search" defaultValue={result.query} placeholder="Số chương hoặc tiêu đề…" className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-600" aria-label="Tìm chương" />
      <select name="storyId" defaultValue={storyId} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="">Tất cả truyện</option>{storyOptions.map((story) => <option key={story.id} value={story.id}>{story.title}</option>)}</select>
      <select name="sort" defaultValue={sort} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option></select>
      <select name="pageSize" defaultValue={String(result.pageSize)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" aria-label="Số dòng mỗi trang"><option value="10">10 dòng/trang</option><option value="20">20 dòng/trang</option><option value="30">30 dòng/trang</option><option value="50">50 dòng/trang</option><option value="100">100 dòng/trang</option></select>
      <button className="button-primary" type="submit">Lọc</button><Link href="/admin/chapters" className="button-secondary">Đặt lại</Link>
    </form>
    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Truyện</th><th className="px-4 py-3">Chương</th><th className="px-4 py-3">Tiêu đề</th><th className="px-4 py-3 text-right">Thời lượng đọc</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Ngày xuất bản</th><th className="px-4 py-3">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-200">{result.chapters.map((chapter) => <tr key={chapter.id} className="hover:bg-slate-50"><td className="px-4 py-4 font-medium text-slate-800">{chapter.storyTitle}</td><td className="px-4 py-4">{formatChapterNumber(chapter.number)}</td><td className="px-4 py-4 font-semibold text-slate-950">{chapter.title}</td><td className="px-4 py-4 text-right"><span className="font-medium text-teal-700">{formatReadingTime(chapter.wordCount)}</span><span className="block text-[11px] text-slate-400">{chapter.wordCount} từ</span></td><td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${chapter.isPublished ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>{chapter.isPublished ? "Đã xuất bản" : "Bản nháp"}</span></td><td className="px-4 py-4 text-slate-600">{formatDate(chapter.publishedAt)}</td><td className="px-4 py-4"><div className="flex gap-3"><Link href={`/admin/chapters/${chapter.id}/edit`} className="font-semibold text-teal-700 hover:underline">Sửa</Link><DeleteChapterButton id={chapter.id} title={chapter.title} /></div></td></tr>)}</tbody></table></div>{!result.chapters.length ? <p className="py-12 text-center text-sm text-slate-500">Không tìm thấy chương phù hợp.</p> : null}</section>
    <Pagination currentPage={result.page} totalPages={result.totalPages} pathname="/admin/chapters" params={paginationParams} alwaysShow />
  </>;
}
