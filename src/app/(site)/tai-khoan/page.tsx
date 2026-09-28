import type { Metadata } from "next";
import { logoutUser } from "@/app/(site)/auth-actions";
import { HistorySync } from "@/components/history/history-sync";
import { isAdminUser } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tài khoản",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <main className="site-container py-10 sm:py-12">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Tài khoản độc giả</p>
        <h1 className="mt-2 text-[32px] font-bold leading-tight text-content">Tài khoản của bạn</h1>
        <HistorySync />
        <section className="panel mt-7">
          <dl className="space-y-4">
            <div><dt className="text-sm text-content-muted">Email</dt><dd className="mt-1 font-semibold text-content">{user.email}</dd></div>
            <div><dt className="text-sm text-content-muted">Vai trò</dt><dd className="mt-1 font-semibold text-content">{isAdminUser(user) ? "Admin" : "Độc giả"}</dd></div>
          </dl>
          <form action={logoutUser} className="mt-7">
            <button type="submit" className="button-secondary">Đăng xuất</button>
          </form>
        </section>
      </div>
    </main>
  );
}
