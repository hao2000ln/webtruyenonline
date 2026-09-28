import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteStoryButton } from "@/components/admin/delete-story-button";
import { Pagination } from "@/components/ui/pagination";
import { getAdminStories, type AdminStoryStatus } from "@/db/queries/admin-stories";
import { formatCompactNumber, formatDate, getStoryStatusLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Quản lý truyện" };

type SearchParams = Promise<{
  q?: string | string[];
  status?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
  created?: string | string[];
  updated?: string | string[];
  deleted?: string | string[];
  error?: string | string[];
}>;

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readPage(value: string | string[] | undefined) {
  const page = Number.parseInt(readParam(value), 10);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function readStatus(value: string | string[] | undefined): AdminStoryStatus | "" {
  const status = readParam(value);
  return status === "ONGOING" || status === "COMPLETED" || status === "HIATUS" ? status : "";
}

function listUrl(query: string, status: AdminStoryStatus | "", page: number) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const value = params.toString();
  return value ? `/admin/stories?${value}` : "/admin/stories";
}

export default async function AdminStoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = readParam(params.q);
  const status = readStatus(params.status);
  const requestedPage = readPage(params.page);
  const pageSizeValue = Number(readParam(params.pageSize));
  const pageSize = [10, 20, 30, 50, 100].includes(pageSizeValue) ? pageSizeValue : 10;
  const result = await getAdminStories({ query, status, requestedPage, pageSize });

  if (requestedPage !== result.page) redirect(listUrl(result.query, status, result.page));

  const paginationParams: Record<string, string> = {};
  if (result.query) paginationParams.q = result.query;
  if (status) paginationParams.status = status;
  paginationParams.pageSize = String(result.pageSize);
  const notice = readParam(params.created)
    ? "Đã tạo truyện."
    : readParam(params.updated)
      ? "Đã cập nhật truyện."
      : readParam(params.deleted)
        ? "Đã xóa truyện và dữ liệu liên quan."
        : "";

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-teal-700">Quản trị nội dung</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Truyện</h1>
          <p className="mt-2 text-slate-600">{result.total} truyện trong hệ thống.</p>
        </div>
        <Link href="/admin/stories/new" className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">Thêm truyện</Link>
      </div>

      {notice ? <p className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p> : null}
      {readParam(params.error) ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Không thể thực hiện thao tác.</p> : null}

      <form method="get" className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
        <label className="sr-only" htmlFor="story-search">Tìm theo tên truyện hoặc tác giả</label>
        <input id="story-search" name="q" type="search" defaultValue={result.query} placeholder="Tên truyện hoặc tác giả…" className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-600" />
        <label className="sr-only" htmlFor="story-status">Lọc trạng thái</label>
        <select id="story-status" name="status" defaultValue={status} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600">
          <option value="">Tất cả trạng thái</option>
          <option value="ONGOING">Đang ra</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="HIATUS">Tạm dừng</option>
        </select>
        <select name="pageSize" defaultValue={String(result.pageSize)} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" aria-label="Số dòng mỗi trang"><option value="10">10 dòng/trang</option><option value="20">20 dòng/trang</option><option value="30">30 dòng/trang</option><option value="50">50 dòng/trang</option><option value="100">100 dòng/trang</option></select>
        <button type="submit" className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white">Lọc</button>
        <Link href="/admin/stories" className="flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Đặt lại</Link>
      </form>

      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Tên truyện</th><th className="px-4 py-3 font-semibold">Tác giả</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-semibold">Số chương</th>
                <th className="px-4 py-3 text-right font-semibold">Lượt đọc</th><th className="px-4 py-3 font-semibold">Chương mới</th>
                <th className="px-4 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {result.stories.map((story) => (
                <tr key={story.id} className="align-top hover:bg-slate-50/70">
                  <td className="px-4 py-4">
                    <p className="max-w-72 font-semibold text-slate-950">{story.title}</p><p className="mt-1 text-xs text-slate-500">/{story.slug}</p>
                    {!story.isPublished ? <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Bản nháp</span> : null}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{story.authorName ?? "Chưa có"}</td>
                  <td className="px-4 py-4"><span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">{getStoryStatusLabel(story.status)}</span></td>
                  <td className="px-4 py-4 text-right font-medium text-slate-700">{story.totalChapters}</td>
                  <td className="px-4 py-4 text-right text-slate-600">{formatCompactNumber(story.viewCount)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(story.latestChapterAt)}</td>
                  <td className="px-4 py-4"><div className="flex items-center gap-3"><Link href={`/admin/stories/${story.id}/edit`} className="font-semibold text-teal-700 hover:underline">Sửa</Link><DeleteStoryButton id={story.id} title={story.title} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {result.stories.length === 0 ? <p className="px-4 py-12 text-center text-sm text-slate-500">Không tìm thấy truyện phù hợp.</p> : null}
      </section>

      <Pagination currentPage={result.page} totalPages={result.totalPages} pathname="/admin/stories" params={paginationParams} alwaysShow />
    </>
  );
}
