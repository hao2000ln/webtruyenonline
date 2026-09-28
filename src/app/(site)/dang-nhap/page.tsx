import type { Metadata } from "next";
import Link from "next/link";
import { loginUser } from "@/app/(site)/auth-actions";
import { AuthCard } from "@/components/auth/auth-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false },
};

const errorMessages: Record<string, string> = {
  "invalid-input": "Vui lòng nhập email và mật khẩu hợp lệ.",
  "invalid-credentials": "Email hoặc mật khẩu không chính xác.",
  confirmation: "Liên kết xác nhận không hợp lệ hoặc đã hết hạn.",
};

type Props = {
  searchParams: Promise<{ error?: string | string[]; next?: string | string[] }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = errorMessages[readParam(params.error) ?? ""];
  const next = readParam(params.next) === "/theo-doi" ? "/theo-doi" : "/tai-khoan";

  return (
    <AuthCard eyebrow="Tài khoản độc giả" title="Đăng nhập" description="Đồng bộ lịch sử đọc và quản lý danh sách truyện theo dõi.">
      {error ? <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <form action={loginUser} className="mt-6 space-y-5">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-content">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="mt-2 h-11 w-full rounded-lg border border-ui-border bg-surface px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-content">Mật khẩu</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="mt-2 h-11 w-full rounded-lg border border-ui-border bg-surface px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
        </div>
        <button type="submit" className="button-primary button-lg w-full">Đăng nhập</button>
      </form>
      <p className="mt-5 text-sm text-content-secondary">Chưa có tài khoản? <Link href="/dang-ky" className="font-semibold text-primary">Đăng ký</Link></p>
    </AuthCard>
  );
}
