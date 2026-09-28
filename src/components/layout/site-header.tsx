"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { href: "/", label: "Trang chủ" },
  { href: "/the-loai", label: "Thể loại" },
  { href: "/tim-kiem", label: "Tìm truyện" },
  { href: "/lich-su", label: "Lịch sử" },
  { href: "/theo-doi", label: "Theo dõi" },
  { href: "/tai-khoan", label: "Tài khoản" },
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m16 16 4 4" />
    </svg>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" aria-label="Mộc Thư - Trang chủ">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white shadow-sm" aria-hidden="true">M</span>
      <span className="text-xl font-bold tracking-tight text-content">Mộc Thư</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ui-border bg-surface/95 backdrop-blur-sm">
      <div className="site-container flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-8">
          <Brand />
          <nav className="hidden items-center gap-2 md:flex xl:gap-4" aria-label="Điều hướng chính">
            {navigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${active ? "font-semibold text-primary color-primary" : "font-medium text-slate-600"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <form action="/tim-kiem" className="relative hidden w-48 shrink-0 lg:block xl:w-64">
          <label htmlFor="header-search" className="sr-only">Tìm truyện hoặc tác giả</label>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="Tìm truyện, tác giả..."
            className="h-10 w-full rounded-lg border border-ui-border bg-slate-50 py-2 pl-3 pr-10 text-sm outline-none transition placeholder:text-content-muted focus:border-primary focus:bg-white"
          />
          <button type="submit" className="absolute right-0 top-0 flex size-10 items-center justify-center text-content-muted transition hover:text-primary" aria-label="Tìm kiếm">
            <SearchIcon />
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-ui-border text-content-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
        >
          {mobileMenuOpen ? (
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
          )}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div id="mobile-navigation" className="border-t border-ui-border bg-surface md:hidden">
          <div className="site-container py-4">
            <form action="/tim-kiem" className="relative mb-3">
              <label htmlFor="mobile-search" className="sr-only">Tìm truyện hoặc tác giả</label>
              <input
                id="mobile-search"
                name="q"
                type="search"
                placeholder="Tìm truyện, tác giả..."
                className="h-11 w-full rounded-lg border border-ui-border bg-slate-50 py-2 pl-3 pr-11 text-sm outline-none transition placeholder:text-content-muted focus:border-primary focus:bg-white"
              />
              <button type="submit" className="absolute right-0 top-0 flex size-11 items-center justify-center text-content-muted transition hover:text-primary" aria-label="Tìm kiếm">
                <SearchIcon />
              </button>
            </form>
            <nav className="grid grid-cols-2 gap-2" aria-label="Điều hướng mobile">
              {navigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-3 py-2.5 text-sm transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${active ? "font-semibold text-primary" : "font-medium text-content-secondary"}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
