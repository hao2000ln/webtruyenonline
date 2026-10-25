import type { Metadata } from "next";
import Link from "next/link";
import { signUpUser } from "@/app/(site)/auth-actions";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đăng ký",
  robots: { index: false, follow: false },
};

const errorMessages: Record<string, string> = {
  "invalid-input": "Email chưa hợp lệ, mật khẩu chưa đủ 8 ký tự hoặc hai mật khẩu không khớp.",
  "account-exists": "Email này đã có tài khoản. Hãy chuyển sang đăng nhập.",
  "signup-disabled": "Hệ thống đang tạm đóng đăng ký tài khoản mới.",
  "signup-failed": "Không thể tạo tài khoản. Vui lòng kiểm tra thông tin và thử lại.",
  "service-unavailable": "Dịch vụ tài khoản đang gián đoạn. Vui lòng thử lại sau.",
};

type Props = {
  searchParams: Promise<{ error?: string | string[]; status?: string | string[] }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignUpPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = errorMessages[readParam(params.error) ?? ""];
  const checkEmail = readParam(params.status) === "check-email";

  return (
    <AuthCard eyebrow="Tài khoản độc giả" title="Tạo tài khoản" description="Đăng ký miễn phí để đồng bộ trải nghiệm đọc giữa các thiết bị.">
      {error ? <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {checkEmail ? (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm leading-6 text-green-800">
          Kiểm tra email và mở liên kết xác nhận để hoàn tất đăng ký.
        </div>
      ) : (
        <form action={signUpUser} className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-content">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="mt-2 h-11 w-full rounded-lg border border-ui-border bg-surface px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-content">Mật khẩu</label>
            <input id="password" name="password" type="password" minLength={8} maxLength={72} autoComplete="new-password" required className="mt-2 h-11 w-full rounded-lg border border-ui-border bg-surface px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <p className="mt-2 text-xs text-content-muted">Tối thiểu 8 ký tự.</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-content">Nhập lại mật khẩu</label>
            <input id="confirmPassword" name="confirmPassword" type="password" minLength={8} maxLength={72} autoComplete="new-password" required className="mt-2 h-11 w-full rounded-lg border border-ui-border bg-surface px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>
          <AuthSubmitButton idleLabel="Tạo tài khoản" pendingLabel="Đang tạo tài khoản…" />
        </form>
      )}
      <p className="mt-5 text-sm text-content-secondary">Đã có tài khoản? <Link href="/dang-nhap" className="font-semibold text-primary">Đăng nhập</Link></p>
    </AuthCard>
  );
}
