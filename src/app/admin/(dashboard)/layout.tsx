import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Mộc Thư Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100 lg:pl-[260px]">
      <aside className="hidden border-r border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[260px] lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-5">
          <Link href="/admin" className="flex items-center gap-3" aria-label="Mộc Thư Admin">
            <span className="flex size-10 items-center justify-center rounded-lg bg-teal-700 text-lg font-bold text-white">M</span>
            <div>
              <p className="font-bold text-slate-950">Mộc Thư</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Admin</p>
            </div>
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <AdminNav />
        </div>

        <div className="border-t border-slate-200 p-4">
          <form action={logout}>
            <button type="submit" className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-teal-700 font-bold text-white lg:hidden">M</span>
              <div>
                <p className="font-bold text-slate-950">Quản trị nội dung</p>
                <p className="hidden text-xs text-slate-500 sm:block">Mộc Thư Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="hidden max-w-64 truncate text-sm text-slate-600 sm:block">{user.email}</p>
              <form action={logout} className="lg:hidden">
                <button type="submit" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Đăng xuất</button>
              </form>
            </div>
          </div>
          <div className="overflow-x-auto border-t border-slate-100 lg:hidden">
            <AdminNav mobile />
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
