"use client";

import { useEffect, useRef, useState } from "react";

const SHOW_AFTER_PX = 480;
const SCROLL_DURATION_MS = 1_000;

export function ScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY >= SHOW_AFTER_PX);

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    const startY = window.scrollY;
    const startedAt = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startedAt) / SCROLL_DURATION_MS, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, startY * (1 - easedProgress));

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 z-40 flex size-11 items-center justify-center rounded-lg border border-primary bg-primary text-white shadow-sm transition hover:border-primary-hover hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:bottom-6 sm:right-6"
      aria-label="Cuộn lên đầu trang"
      title="Lên đầu trang"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m6 15 6-6 6 6" />
      </svg>
    </button>
  );
}
