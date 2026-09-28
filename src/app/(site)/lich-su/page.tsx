import type { Metadata } from "next";
import { GuestHistoryList } from "@/components/history/guest-history-list";

export const metadata: Metadata = {
  title: "Lịch sử đọc",
  description: "Tiếp tục những truyện bạn đã đọc trên thiết bị này.",
};

export default function HistoryPage() {
  return (
    <main className="site-container min-h-[60vh] py-10">
      <div className="max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Trên thiết bị này</p>
      <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight text-content">Lịch sử đọc</h1>
      <p className="mt-3 max-w-2xl leading-7 text-content-secondary">Lịch sử được lưu cục bộ trong trình duyệt và không đồng bộ lên tài khoản hoặc database.</p>
      <GuestHistoryList />
      </div>
    </main>
  );
}
