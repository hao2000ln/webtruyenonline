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
    <Link
      href="/"
      className="group flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
      aria-label="Mộc Thư - Trang chủ"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-[#0f766e] text-xl font-black text-white shadow-md shadow-teal-700/20 transition-all duration-300 group-hover:scale-105 group-hover:bg-[#115e59]">
        M
      </div>
      <span className="text-2xl font-black tracking-tight text-slate-900">Mộc Thư</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="site-container flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-8">
          <Brand />
          <nav className="hidden items-center gap-1 md:flex xl:gap-2 text-sm font-medium text-slate-600" aria-label="Điều hướng chính">
            {navigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm transition ${active
                      ? "font-bold text-[#0f766e] bg-teal-50/70 color-primary"
                      : "text-slate-600 hover:text-[#0f766e] hover:bg-slate-50"
                    }`}
                >
                  {item.label === "Lịch sử" && <span className="mr-1.5 opacity-70">🕒</span>}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <form action="/tim-kiem" className="relative hidden sm:block w-48 lg:w-64">
            <label htmlFor="header-search" className="sr-only">
              Tìm truyện hoặc tác giả
            </label>
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Tìm truyện, tác giả..."
              className="h-10 w-full rounded-full border border-slate-200/80 bg-slate-100/80 py-2 pl-9 pr-4 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-teal-700/10"
            />
            <span className="pointer-events-none absolute left-3.5 top-3 text-xs text-slate-400">
              🔍
            </span>
          </form>

          <Link
            href="/tai-khoan"
            className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            aria-label="Thông báo"
            title="Thông báo"
          >
            <span className="text-sm">🔔</span>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#0f766e] hover:bg-teal-50 hover:text-[#0f766e] md:hidden"
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
