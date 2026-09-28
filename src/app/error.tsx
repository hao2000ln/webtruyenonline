"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-danger">Có lỗi xảy ra</p>
      <h1 className="mt-3 text-[32px] font-bold leading-tight text-content">Chưa thể tải nội dung</h1>
      <p className="mt-3 leading-7 text-content-secondary">Kết nối dữ liệu có thể đang gián đoạn. Vui lòng thử lại sau ít phút.</p>
      <button type="button" onClick={reset} className="button-primary button-lg mt-7">
        Thử lại
      </button>
    </main>
  );
}
