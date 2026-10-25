"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronDown, Clock3, Heart, LogIn, LogOut, Menu, NotebookPen, Search, UserRound, X } from "lucide-react";
import { logoutUser } from "@/app/(site)/auth-actions";
import { authClient } from "@/lib/auth/client";

const primaryNavigation = [
  { href: "/", label: "Trang chủ" },
  { href: "/the-loai", label: "Thể loại" },
  { href: "/lich-su", label: "Lịch sử" },
] as const;

const accountNavigation = [
  { href: "/theo-doi", label: "Truyện theo dõi", icon: Heart },
  { href: "/ghi-chu", label: "Ghi chú", icon: NotebookPen },
  { href: "/tai-khoan", label: "Tài khoản", icon: UserRound },
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function Brand() {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700" aria-label="Mộc Thư - Trang chủ">
      <svg className="size-10 shrink-0 rounded-xl shadow-md shadow-teal-700/20 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="100" height="100" rx="24" fill="#0f766e" />
        <path d="M28 70V30L50 52L72 30V70" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="30" r="6" fill="#ea580c" />
      </svg>
      <span className="hidden text-xl font-black tracking-tight text-slate-900 sm:inline xl:text-2xl">Mộc Thư</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const user = session?.user;

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const displayName = user?.name || user?.email?.split("@")[0] || "Độc giả";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-md">
      <div className="site-container flex h-16 items-center gap-3 lg:gap-6">
        <Brand />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
          {primaryNavigation.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${active ? "bg-teal-50 font-bold text-teal-700" : "font-medium text-slate-600 hover:bg-slate-50 hover:text-teal-700"}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action="/tim-kiem" className="relative ml-auto hidden min-w-0 flex-1 sm:block sm:max-w-xs xl:max-w-sm">
          <label htmlFor="header-search" className="sr-only">Tìm truyện hoặc tác giả</label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input id="header-search" name="q" type="search" placeholder="Tìm truyện, tác giả…" className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-700/10" />
        </form>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {isPending ? (
            <span className="h-10 w-28 animate-pulse rounded-full bg-slate-100" aria-label="Đang kiểm tra tài khoản" />
          ) : user ? (
            <div ref={accountMenuRef} className="relative">
              <button type="button" onClick={() => setAccountMenuOpen((open) => !open)} className="flex h-10 max-w-48 items-center gap-2 rounded-full border border-slate-200 bg-white pl-1.5 pr-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50" aria-expanded={accountMenuOpen} aria-haspopup="menu">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-black uppercase text-white">{displayName.charAt(0)}</span>
                <span className="truncate">{displayName}</span>
                <ChevronDown className={`size-4 shrink-0 transition ${accountMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {accountMenuOpen ? (
                <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl" role="menu">
                  <div className="border-b border-slate-100 px-3 py-2.5"><p className="truncate text-sm font-bold text-slate-900">{displayName}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
                  <div className="py-1">
                    {accountNavigation.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setAccountMenuOpen(false)} role="menuitem" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700"><Icon className="size-4" />{item.label}</Link>; })}
                  </div>
                  <form action={logoutUser} className="border-t border-slate-100 pt-1"><button type="submit" role="menuitem" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"><LogOut className="size-4" />Đăng xuất</button></form>
                </div>
              ) : null}
            </div>
          ) : (
            <><Link href="/dang-nhap" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700">Đăng nhập</Link><Link href="/dang-ky" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-800">Đăng ký</Link></>
          )}
        </div>

        <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="ml-auto flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 sm:ml-0 lg:hidden" aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}>
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div id="mobile-navigation" className="border-t border-slate-200 bg-white lg:hidden">
          <div className="site-container max-h-[calc(100vh-4rem)] overflow-y-auto py-4">
            <form action="/tim-kiem" className="relative mb-4 sm:hidden">
              <label htmlFor="mobile-search" className="sr-only">Tìm truyện hoặc tác giả</label>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input id="mobile-search" name="q" type="search" placeholder="Tìm truyện, tác giả…" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-teal-600 focus:bg-white" />
            </form>
            <nav className="grid gap-1" aria-label="Điều hướng mobile">
              {[...primaryNavigation, { href: "/tim-kiem", label: "Tìm truyện" }].map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.href === "/lich-su" ? Clock3 : item.href === "/tim-kiem" ? Search : item.href === "/" ? BookOpen : null;
                return <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${active ? "bg-teal-50 font-bold text-teal-700" : "font-semibold text-slate-700 hover:bg-slate-50"}`}>{Icon ? <Icon className="size-4" /> : <span className="size-4 rounded border-2 border-current opacity-60" />}{item.label}</Link>;
              })}
            </nav>
            <div className="my-3 border-t border-slate-100" />
            {isPending ? <div className="h-20 animate-pulse rounded-xl bg-slate-100" /> : user ? (
              <div>
                <div className="mb-2 px-3 py-2"><p className="truncate text-sm font-bold text-slate-900">{displayName}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
                {accountNavigation.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Icon className="size-4" />{item.label}</Link>; })}
                <form action={logoutUser} className="mt-2"><button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"><LogOut className="size-4" />Đăng xuất</button></form>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2"><Link href="/dang-nhap" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"><LogIn className="size-4" />Đăng nhập</Link><Link href="/dang-ky" className="flex items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white">Đăng ký</Link></div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
