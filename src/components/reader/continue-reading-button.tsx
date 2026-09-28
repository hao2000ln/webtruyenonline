"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GUEST_HISTORY_EVENT, readGuestHistory, type GuestHistoryRecord } from "@/lib/reader-storage";

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
      className="button-primary button-lg"
    >
      {history ? `Đọc tiếp chương ${history.chapterNumber}` : "Đọc từ đầu"}
    </Link>
  );
}
