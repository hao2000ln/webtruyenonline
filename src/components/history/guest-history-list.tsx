"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearGuestHistory,
  GUEST_HISTORY_EVENT,
  readGuestHistory,
  removeGuestHistory,
  type GuestHistoryRecord,
} from "@/lib/reader-storage";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function GuestHistoryList() {
  const [history, setHistory] = useState<GuestHistoryRecord[] | null>(null);

  useEffect(() => {
    const syncHistory = () => setHistory(readGuestHistory());
    syncHistory();
    window.addEventListener(GUEST_HISTORY_EVENT, syncHistory);
    window.addEventListener("storage", syncHistory);
    return () => {
      window.removeEventListener(GUEST_HISTORY_EVENT, syncHistory);
      window.removeEventListener("storage", syncHistory);
    };
  }, []);

  if (history === null) {
    return <div className="mt-8 h-40 animate-pulse rounded-xl bg-slate-200" aria-label="Đang tải lịch sử" />;
  }

  if (history.length === 0) {
    return (
      <div className="panel mt-8 border-dashed py-14 text-center">
        <h2 className="text-lg font-semibold text-content">Chưa có lịch sử đọc</h2>
        <p className="mt-2 text-sm leading-6 text-content-secondary">Mở một chương truyện, lịch sử sẽ tự động xuất hiện tại đây.</p>
        <Link href="/" className="button-primary button-lg mt-6">Khám phá truyện</Link>
      </div>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-content-secondary">{history.length} truyện đã đọc</p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Xóa toàn bộ lịch sử đọc trên thiết bị này?")) {
              clearGuestHistory();
              setHistory([]);
            }
          }}
          className="text-sm font-semibold text-danger hover:underline"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="grid gap-4">
        {history.map((item) => (
          <article key={item.storySlug} className="story-card flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <Link href={`/truyen/${item.storySlug}`} className="text-lg font-semibold text-content transition hover:text-primary">{item.storyTitle}</Link>
              <p className="mt-1 truncate text-sm text-content-secondary">Chương {item.chapterNumber}: {item.chapterTitle}</p>
              {typeof item.progressPercent === "number" && item.progressPercent > 0 ? (
                <div className="mt-3 max-w-sm">
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-content-muted">
                    <span>Tiến độ chương</span><span>{Math.round(item.progressPercent)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-teal-600" style={{ width: `${item.progressPercent}%` }} />
                  </div>
                </div>
              ) : null}
              <p className="mt-2 text-xs text-content-muted">Đọc lúc {dateFormatter.format(new Date(item.readAt))}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link href={item.href} className="button-primary">Đọc tiếp</Link>
              <button
                type="button"
                onClick={() => setHistory(removeGuestHistory(item.storySlug))}
                className="button-secondary hover:border-red-300 hover:text-danger"
                aria-label={`Xóa lịch sử ${item.storyTitle}`}
              >
                Xóa
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
