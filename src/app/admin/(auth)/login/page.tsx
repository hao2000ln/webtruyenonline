import type { Metadata } from "next";
import Link from "next/link";
import { login } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  robots: { index: false, follow: false },
};

const errorMessages: Record<string, string> = {
  "invalid-input": "Vui lòng nhập email và mật khẩu hợp lệ.",
  "invalid-credentials": "Email hoặc mật khẩu không chính xác.",
  forbidden: "Tài khoản này không có quyền quản trị.",
};

type Props = {
  searchParams: Promise<{ error?: string | string[]; status?: string | string[] }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = errorMessages[readParam(params.error) ?? ""];
  const loggedOut = readParam(params.status) === "logged-out";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8" aria-labelledby="admin-login-title">
        <div className="mb-7 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-teal-700 text-lg font-bold text-white">M</span>
          <div><p className="font-bold text-slate-950">Mộc Thư</p><p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Admin App</p></div>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Khu vực quản trị</p>
        <h1 id="admin-login-title" className="mt-2 text-[28px] font-bold leading-tight text-content">
          Đăng nhập Admin
        </h1>
        <p className="mt-3 text-sm text-content-secondary">
          Sử dụng tài khoản đã được cấp role <code>admin</code>.
        </p>

        {error ? (
          <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {loggedOut ? (
          <p className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Bạn đã đăng xuất.
          </p>
        ) : null}

        <form action={login} className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-content">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-2 h-11 w-full rounded-lg border border-ui-border bg-surface px-3 text-content outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-content">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 h-11 w-full rounded-lg border border-ui-border bg-surface px-3 text-content outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <button type="submit" className="button-primary button-lg w-full">Đăng nhập</button>
        </form>

        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-primary hover:text-primary-hover">
          ← Trở về trang đọc truyện
        </Link>
      </section>
    </main>
  );
}
