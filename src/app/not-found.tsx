import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">404</p>
      <h1 className="mt-3 text-[32px] font-bold leading-tight text-content">Không tìm thấy trang</h1>
      <p className="mt-3 leading-7 text-content-secondary">Truyện hoặc chương bạn đang tìm không tồn tại, hoặc chưa được xuất bản.</p>
      <Link href="/" className="button-primary button-lg mt-7">
        Về trang chủ
      </Link>
    </main>
  );
}
