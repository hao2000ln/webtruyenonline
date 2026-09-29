import Link from "next/link";
import { ChevronRight, Smartphone } from "lucide-react";

const exploreLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/the-loai", label: "Thể loại truyện" },
  { href: "/tim-kiem", label: "Tìm kiếm nâng cao" },
  { href: "/lich-su", label: "Lịch sử đọc truyện" },
] as const;

const policyLabels = [
  "Điều khoản sử dụng",
  "Chính sách bảo mật",
  "Quy định bản quyền",
  "Hỗ trợ / Báo lỗi",
] as const;

function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="Mộc Thư - Trang chủ">
      <svg className="size-9 shrink-0 rounded-lg shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="100" height="100" rx="24" fill="#0f766e"/>
        <path d="M28 70V30L50 52L72 30V70" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="50" cy="30" r="6" fill="#ea580c"/>
      </svg>
      <span className="text-xl font-bold tracking-tight text-white">Mộc Thư</span>
    </Link>
  );
}

function SocialPlaceholder({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span
      className="flex size-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400"
      aria-label={`${label} - sắp cập nhật`}
      title={`${label} - sắp cập nhật`}
    >
      {children}
    </span>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-900 pt-12 pb-8 text-sm text-slate-300">
      <div className="site-container">
        <div className="grid grid-cols-1 gap-8 pb-10 border-b border-slate-800 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand & Social */}
          <div className="space-y-4">
            <Brand />
            <p className="text-xs leading-relaxed text-slate-400">
              Nền tảng đọc truyện chữ trực tuyến hàng đầu. Không gian đọc yên tĩnh, tinh tế, cập nhật chương mới mỗi ngày.
            </p>
            <div className="flex gap-3 pt-1">
              <SocialPlaceholder label="Facebook">
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.8-.1-1.6-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2V10H7.5v3h2.8v8h3.2Z" /></svg>
              </SocialPlaceholder>
              <SocialPlaceholder label="Discord">
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d="M19.3 5.3A17 17 0 0 0 15 4l-.5 1a15.4 15.4 0 0 0-5 0L9 4a17 17 0 0 0-4.3 1.3C2 9.2 1.3 13 1.7 16.8A17.6 17.6 0 0 0 7 19.5l1.3-1.8-1.8-.9.4-.3c3.4 1.6 7 1.6 10.4 0l.4.3-1.8.9 1.3 1.8a17.6 17.6 0 0 0 5.2-2.7c.5-4.4-.8-8.2-3.1-11.5ZM8.8 14.5c-1 0-1.9-.9-1.9-2s.8-2 1.9-2c1 0 1.9.9 1.9 2s-.9 2-1.9 2Zm6.4 0c-1 0-1.9-.9-1.9-2s.8-2 1.9-2c1 0 1.9.9 1.9 2s-.9 2-1.9 2Z" /></svg>
              </SocialPlaceholder>
              <SocialPlaceholder label="Telegram">
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d="m21.4 3.4-3.2 16c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L5.7 13.2.8 11.7c-1.1-.3-1.1-1.1.2-1.6L20 2.8c.9-.3 1.7.2 1.4.6Z" /></svg>
              </SocialPlaceholder>
            </div>
          </div>

          {/* Col 2: Khám phá */}
          <nav aria-label="Khám phá">
            <h3 className="mb-4 border-l-2 border-amber-600 pl-2.5 text-xs font-bold uppercase tracking-wider text-white">
              Khám phá
            </h3>
            <ul className="space-y-2.5 text-xs">
              {exploreLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center gap-1.5 transition hover:text-teal-400">
                    <ChevronRight className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 3: Hỗ trợ độc giả */}
          <section aria-label="Hỗ trợ">
            <h3 className="mb-4 border-l-2 border-amber-600 pl-2.5 text-xs font-bold uppercase tracking-wider text-white">
              Hỗ trợ độc giả
            </h3>
            <ul className="space-y-2.5 text-xs">
              {policyLabels.map((label) => (
                <li key={label} className="text-slate-400 transition hover:text-teal-400 cursor-pointer">
                  {label}
                </li>
              ))}
            </ul>
          </section>

          {/* Col 4: Ứng dụng di động */}
          <section aria-label="Ứng dụng di động">
            <h3 className="mb-4 border-l-2 border-amber-600 pl-2.5 text-xs font-bold uppercase tracking-wider text-white">
              Ứng dụng di động
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-slate-400">
              Trải nghiệm đọc truyện mượt mà, tối ưu pin và hỗ trợ đọc offline trên điện thoại.
            </p>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#115e59]"
            >
              <Smartphone className="w-4 h-4" />
              <span>Ứng dụng Mộc Thư</span>
            </Link>
          </section>
        </div>

        <div className="flex flex-col items-center justify-between pt-6 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>© 2026 Mộc Thư. Tất cả các quyền được bảo lưu.</p>
          <div className="mt-3 sm:mt-0 flex gap-4">
            <Link href="/" className="hover:text-slate-300">Điều khoản sử dụng</Link>
            <span>•</span>
            <Link href="/" className="hover:text-slate-300">Chính sách riêng tư</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
