"use client";

import { useEffect, useRef, useState } from "react";
import { readGuestHistory } from "@/lib/reader-storage";

type SyncState = "idle" | "syncing" | "done" | "error";

export function HistorySync() {
  const started = useRef(false);
  const [state, setState] = useState<SyncState>("idle");
  const [synced, setSynced] = useState(0);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const records = readGuestHistory();
    if (records.length === 0) return;

    fetch("/api/history/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        records: records.map(({ storySlug, chapterNumber, readAt }) => ({
          storySlug,
          chapterNumber,
          readAt,
        })),
      }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to sync history");
        const data = await response.json() as { synced: number };
        setSynced(data.synced);
        setState("done");
      })
      .catch(() => setState("error"));
  }, []);

  if (state === "idle") return null;

  return (
    <p className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
      state === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-teal-200 bg-teal-50 text-teal-800"
    }`}>
      {state === "done" ? `Đã đồng bộ ${synced} mục lịch sử mới hơn.` : null}
      {state === "error" ? "Chưa thể đồng bộ lịch sử. Lịch sử trên thiết bị vẫn được giữ nguyên." : null}
    </p>
  );
}
