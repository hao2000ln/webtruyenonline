"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Bookmark, Loader2 } from "lucide-react";

type FollowState = "loading" | "guest" | "following" | "not-following" | "error";

export function FollowButton({ storySlug }: { storySlug: string }) {
  const router = useRouter();
  const [state, setState] = useState<FollowState>("loading");

  useEffect(() => {
    let active = true;
    fetch(`/api/follows/${encodeURIComponent(storySlug)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!active) return;
        if (!response.ok) throw new Error("Unable to load follow state");
        const data = await response.json() as { followed: boolean; guest?: boolean };
        setState(data.guest ? "guest" : data.followed ? "following" : "not-following");
      })
      .catch(() => active && setState("error"));
    return () => { active = false; };
  }, [storySlug]);

  async function toggleFollow() {
    if (state === "guest") {
      router.push("/dang-nhap?next=/theo-doi");
      return;
    }
    if (state !== "following" && state !== "not-following") return;

    const wasFollowing = state === "following";
    setState("loading");
    try {
      const response = await fetch(`/api/follows/${encodeURIComponent(storySlug)}`, {
        method: wasFollowing ? "DELETE" : "POST",
      });
      if (response.status === 401) {
        setState("guest");
        router.push("/dang-nhap?next=/theo-doi");
        return;
      }
      if (!response.ok) throw new Error("Unable to update follow state");
      setState(wasFollowing ? "not-following" : "following");
    } catch {
      setState("error");
    }
  }

  const label = state === "following"
    ? "Đang theo dõi"
    : state === "loading"
      ? "Đang tải…"
      : state === "error"
        ? "Có lỗi"
        : "Theo dõi";

  return (
    <button
      type="button"
      onClick={toggleFollow}
      disabled={state === "loading" || state === "error"}
      aria-pressed={state === "following"}
      className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-semibold shadow-2xs transition active:scale-95 disabled:opacity-50 ${
        state === "following"
          ? "border-teal-200 bg-teal-50 text-[#0f766e]"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
      }`}
    >
      {state === "loading" ? (
        <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
      ) : (
        <Bookmark
          className={`w-4 h-4 ${
            state === "following" ? "fill-[#0f766e] text-[#0f766e]" : "text-slate-500"
          }`}
        />
      )}
      <span>{label}</span>
    </button>
  );
}
