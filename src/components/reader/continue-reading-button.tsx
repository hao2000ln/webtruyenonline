"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GUEST_HISTORY_EVENT, readGuestHistory, type GuestHistoryRecord } from "@/lib/reader-storage";

import { BookOpen } from "lucide-react";

type ContinueReadingButtonProps = {
  storySlug: string;
  firstChapterHref: string;
};

export function ContinueReadingButton({ storySlug, firstChapterHref }: ContinueReadingButtonProps) {
  const [history, setHistory] = useState<GuestHistoryRecord | null>(null);

  useEffect(() => {
    const syncHistory = () => {
      setHistory(readGuestHistory().find((item) => item.storySlug === storySlug) ?? null);
    };

    syncHistory();
    window.addEventListener(GUEST_HISTORY_EVENT, syncHistory);
    window.addEventListener("storage", syncHistory);
    return () => {
      window.removeEventListener(GUEST_HISTORY_EVENT, syncHistory);
      window.removeEventListener("storage", syncHistory);
    };
  }, [storySlug]);

  return (
    <Link
      href={history?.href ?? firstChapterHref}
      className="flex items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-700/20 transition hover:bg-[#115e59] active:scale-95"
    >
      <BookOpen className="w-4 h-4" />
      <span>{history ? `Đọc tiếp chương ${history.chapterNumber}` : "Đọc từ đầu"}</span>
    </Link>
  );
}
