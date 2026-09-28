"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FollowState = "loading" | "guest" | "following" | "not-following" | "error";

export function FollowButton({ storySlug }: { storySlug: string }) {
  const router = useRouter();
  const [state, setState] = useState<FollowState>("loading");

  useEffect(() => {
    let active = true;
    fetch(`/api/follows/${encodeURIComponent(storySlug)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!active) return;
        if (response.status === 401) {
          setState("guest");
          return;
        }
        if (!response.ok) throw new Error("Unable to load follow state");
        const data = await response.json() as { followed: boolean };
        setState(data.followed ? "following" : "not-following");
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
      className={state === "following" ? "button-primary button-lg" : "button-secondary button-lg"}
    >
      {label}
    </button>
  );
}
