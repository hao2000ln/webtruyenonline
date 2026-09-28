import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-ui-border bg-surface">
      <div className="site-container flex flex-wrap items-center gap-4 py-4 sm:flex-nowrap">
        <Link href="/" className="shrink-0 text-[22px] font-bold tracking-tight text-primary">
          Mộc Thư
        </Link>
        <nav className="order-3 flex w-full items-center gap-5 text-sm font-medium text-content-secondary sm:order-2 sm:w-auto">
          <Link href="/" className="transition hover:text-primary">Trang chủ</Link>
          <Link href="/the-loai" className="transition hover:text-primary">Thể loại</Link>
          <Link href="/tim-kiem" className="transition hover:text-primary">Tìm truyện</Link>
          <Link href="/lich-su" className="transition hover:text-primary">Lịch sử</Link>
        </nav>
        <form action="/tim-kiem" className="order-2 ml-auto flex w-full max-w-sm sm:order-3">
          <label htmlFor="site-search" className="sr-only">Tìm truyện</label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="Tìm truyện, tác giả..."
            className="h-10 min-w-0 flex-1 rounded-l-lg border border-r-0 border-ui-border bg-white px-3 text-sm outline-none transition placeholder:text-content-muted focus:border-primary"
          />
          <button
            type="submit"
            className="h-10 rounded-r-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Tìm
          </button>
        </form>
      </div>
    </header>
  );
}
