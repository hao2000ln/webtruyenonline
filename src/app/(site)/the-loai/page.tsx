import type { Metadata } from "next";
import Link from "next/link";
import { getGenresWithStoryCounts } from "@/db/queries/discovery";

export const metadata: Metadata = { title: "Thể loại truyện", description: "Khám phá truyện theo thể loại yêu thích." };

// Danh sách thể loại rất ít thay đổi — cache 10 phút
export const revalidate = 600;


export default async function GenresPage() {
  const genreList = await getGenresWithStoryCounts();

  return (
    <main className="site-container min-h-[60vh] py-10">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Khám phá</p>
        <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight text-content">Thể loại truyện</h1>
        <p className="mt-4 leading-7 text-content-secondary">Chọn một thể loại để bắt đầu hành trình đọc tiếp theo của bạn.</p>
      </div>
      <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {genreList.map((genre, index) => (
          <Link key={genre.id} href={`/the-loai/${genre.slug}`} className="panel group relative overflow-hidden transition hover:border-teal-300">
            <span className="absolute right-4 top-2 text-6xl font-bold text-slate-50 transition group-hover:text-teal-50">{String(index + 1).padStart(2, "0")}</span>
            <div className="relative">
              <h2 className="text-xl font-bold text-content transition group-hover:text-primary">{genre.name}</h2>
              <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-content-secondary">{genre.description ?? "Khám phá các tác phẩm thuộc thể loại này."}</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">{genre.storyCount} truyện →</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
