import Link from "next/link";
import { getAdminDashboard } from "@/db/queries/admin-dashboard";
import { formatChapterNumber, formatCompactNumber, formatDate } from "@/lib/format";

export default async function AdminPage() {
  const { stats, topStories, staleStories, recentStories, recentChapters } = await getAdminDashboard();
  const cards = [
    ["Truyện", stats.stories, "/admin/stories"],
    ["Chương", stats.chapters, "/admin/chapters"],
    ["Tác giả", stats.authors, "/admin/authors"],
    ["Thể loại", stats.genres, "/admin/genres"],
    ["Tổng lượt đọc", formatCompactNumber(stats.totalViews), "/admin/stories"],
    ["Ít cập nhật >30 ngày", stats.staleStories, "/admin/stories?status=ONGOING"],
  ] as const;

  return (
    <>
      <div>
        <p className="text-sm font-semibold text-teal-700">Tổng quan</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-2 text-slate-600">Theo dõi nhanh nội dung và hiệu suất đọc truyện.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-200 hover:shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
            <p className="mt-2 text-xs font-semibold text-teal-700">Xem chi tiết →</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-slate-950">Top truyện theo lượt đọc</h2></div>
          <div className="divide-y divide-slate-100">
            {topStories.map((story, index) => (
              <Link key={story.id} href={`/admin/stories/${story.id}/edit`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">{index + 1}</span>
                <div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900">{story.title}</p><p className="mt-1 text-xs text-slate-500">{story.totalChapters} chương</p></div>
                <span className="shrink-0 text-sm font-bold text-slate-700">{formatCompactNumber(story.viewCount)}</span>
              </Link>
            ))}
            {!topStories.length ? <p className="px-5 py-8 text-sm text-slate-500">Chưa có dữ liệu.</p> : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-slate-950">Truyện đang ra ít cập nhật</h2><p className="mt-1 text-xs text-slate-500">Không có chương mới trong ít nhất 30 ngày.</p></div>
          <div className="divide-y divide-slate-100">
            {staleStories.map((story) => (
              <Link key={story.id} href={`/admin/stories/${story.id}/edit`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50">
                <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{story.title}</p><p className="mt-1 text-xs text-slate-500">{story.totalChapters} chương</p></div>
                <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{formatDate(story.latestChapterAt)}</span>
              </Link>
            ))}
            {!staleStories.length ? <p className="px-5 py-8 text-sm text-slate-500">Không có truyện chậm cập nhật.</p> : null}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-slate-950">Truyện cập nhật gần đây</h2><Link href="/admin/stories" className="text-sm font-semibold text-teal-700 hover:underline">Xem tất cả</Link></div>
          <div className="divide-y divide-slate-100">{recentStories.map((story) => <Link key={story.id} href={`/admin/stories/${story.id}/edit`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{story.title}</p><p className="mt-1 text-xs text-slate-500">/{story.slug}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${story.isPublished ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>{story.isPublished ? "Đã xuất bản" : "Bản nháp"}</span></Link>)}{!recentStories.length ? <p className="px-5 py-8 text-sm text-slate-500">Chưa có truyện.</p> : null}</div>
        </section>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-slate-950">Chương cập nhật gần đây</h2><Link href="/admin/chapters" className="text-sm font-semibold text-teal-700 hover:underline">Xem tất cả</Link></div>
          <div className="divide-y divide-slate-100">{recentChapters.map((chapter) => <Link key={chapter.id} href={`/admin/chapters/${chapter.id}/edit`} className="block px-5 py-4 hover:bg-slate-50"><p className="truncate font-semibold text-slate-900">Chương {formatChapterNumber(chapter.number)}: {chapter.title}</p><p className="mt-1 text-xs text-slate-500">{chapter.storyTitle} · {formatDate(chapter.updatedAt)}</p></Link>)}{!recentChapters.length ? <p className="px-5 py-8 text-sm text-slate-500">Chưa có chương.</p> : null}</div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-slate-950">Trạng thái xuất bản</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-teal-50 p-4"><p className="text-sm text-teal-800">Truyện đã xuất bản</p><p className="mt-1 text-2xl font-bold text-teal-900">{stats.publishedStories} <span className="text-sm font-medium">/ {stats.stories}</span></p></div><div className="rounded-lg bg-amber-50 p-4"><p className="text-sm text-amber-800">Chương đã xuất bản</p><p className="mt-1 text-2xl font-bold text-amber-900">{stats.publishedChapters} <span className="text-sm font-medium">/ {stats.chapters}</span></p></div></div>
      </section>
    </>
  );
}
