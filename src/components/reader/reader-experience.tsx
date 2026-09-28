"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatChapterNumber, formatReadingTime } from "@/lib/format";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  List,
  SlidersHorizontal,
  Sun,
  Moon,
  Sparkles,
  Lamp,
  Coffee,
  ChevronUp,
  AlignLeft,
  AlignJustify,
  X,
  ArrowDownUp,
  Search,
} from "lucide-react";
import {
  DEFAULT_READER_SETTINGS,
  READER_CONTENT_WIDTHS,
  READER_FONT_SIZES,
  READER_LINE_HEIGHTS,
  READER_SETTINGS_EVENT,
  READER_SETTINGS_KEY,
  saveGuestHistory,
  sanitizeReaderSettings,
  writeReaderSettings,
  type ReaderFontFamily,
  type ReaderSettings,
  type ReaderTextAlign,
  type ReaderTheme,
} from "@/lib/reader-storage";

type ChapterLink = { number: string; title: string } | null;
type ChapterSummary = { number: string; title: string };

type ReaderExperienceProps = {
  story: { title: string; slug: string };
  chapter: { number: string; title: string; wordCount: number; publishedDate: string };
  paragraphs: string[];
  previousChapter: ChapterLink;
  nextChapter: ChapterLink;
  chapterList?: ChapterSummary[];
};

const themeOptions: Array<{ value: ReaderTheme; label: string; swatch: string }> = [
  { value: "light", label: "Sáng", swatch: "bg-white border-slate-300" },
  { value: "sepia", label: "Sepia", swatch: "bg-[#f4ecd8] border-[#d8ccb3]" },
  { value: "midnight", label: "Đêm xanh", swatch: "bg-[#0b1329] border-[#1e293b]" },
  { value: "dark", label: "Tối", swatch: "bg-[#18181b] border-[#3f3f46]" },
  { value: "black", label: "Đen", swatch: "bg-black border-neutral-800" },
];

const fontOptions: Array<{ value: ReaderFontFamily; label: string; preview: string }> = [
  { value: "sans", label: "Hiện đại (Sans)", preview: "Aa" },
  { value: "serif", label: "Sách in (Serif)", preview: "Aa" },
];

const alignOptions: Array<{ value: ReaderTextAlign; label: string; icon: typeof AlignLeft }> = [
  { value: "left", label: "Căn trái", icon: AlignLeft },
  { value: "justify", label: "Căn đều", icon: AlignJustify },
];

export function ReaderExperience({
  story,
  chapter,
  paragraphs,
  previousChapter,
  nextChapter,
  chapterList = [],
}: ReaderExperienceProps) {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chaptersDrawerOpen, setChaptersDrawerOpen] = useState(false);
  const [chapterSearch, setChapterSearch] = useState("");
  const [chapterSortAsc, setChapterSortAsc] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBarVisible, setIsBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const activeChapterRef = useRef<HTMLAnchorElement | null>(null);

  const settingsSnapshot = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(READER_SETTINGS_EVENT, onStoreChange);
      window.addEventListener("storage", onStoreChange);
      return () => {
        window.removeEventListener(READER_SETTINGS_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    () => window.localStorage.getItem(READER_SETTINGS_KEY) ?? "",
    () => "",
  );

  const settings = useMemo<ReaderSettings>(() => {
    if (!settingsSnapshot) return DEFAULT_READER_SETTINGS;
    try {
      return sanitizeReaderSettings(JSON.parse(settingsSnapshot));
    } catch {
      return DEFAULT_READER_SETTINGS;
    }
  }, [settingsSnapshot]);

  // Save guest history
  useEffect(() => {
    saveGuestHistory({
      storySlug: story.slug,
      storyTitle: story.title,
      chapterNumber: formatChapterNumber(chapter.number),
      chapterTitle: chapter.title,
      href: `/truyen/${story.slug}/chuong-${formatChapterNumber(chapter.number)}`,
      readAt: new Date().toISOString(),
    });
  }, [chapter.number, chapter.title, story.slug, story.title]);

  // Scroll Progress and Bottom Bar visibility handler
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (docHeight > 0) {
            const progress = Math.min(100, Math.max(0, (currentY / docHeight) * 100));
            setScrollProgress(progress);
          }

          // Auto-hide floating bar when scrolling down, show on scroll up
          if (currentY < 120) {
            setIsBarVisible(true);
          } else if (currentY > lastScrollY.current + 15) {
            setIsBarVisible(false);
          } else if (currentY < lastScrollY.current - 15) {
            setIsBarVisible(true);
          }
          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key === "Escape") {
        setSettingsOpen(false);
        setChaptersDrawerOpen(false);
      } else if (event.key === "ArrowLeft" && previousChapter) {
        router.push(`/truyen/${story.slug}/chuong-${formatChapterNumber(previousChapter.number)}`);
      } else if (event.key === "ArrowRight" && nextChapter) {
        router.push(`/truyen/${story.slug}/chuong-${formatChapterNumber(nextChapter.number)}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextChapter, previousChapter, router, story.slug]);

  // Prevent background scroll when modal/drawer is open
  useEffect(() => {
    if (settingsOpen || chaptersDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [settingsOpen, chaptersDrawerOpen]);

  // Auto-scroll active chapter into view when drawer opens
  useEffect(() => {
    if (chaptersDrawerOpen && activeChapterRef.current) {
      activeChapterRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [chaptersDrawerOpen]);

  const updateSettings = useCallback((partial: Partial<ReaderSettings>) => {
    writeReaderSettings({ ...settings, ...partial });
  }, [settings]);

  const handleStepFontSize = (delta: number) => {
    const currentIndex = READER_FONT_SIZES.indexOf(settings.fontSize as (typeof READER_FONT_SIZES)[number]);
    if (currentIndex === -1) {
      updateSettings({ fontSize: DEFAULT_READER_SETTINGS.fontSize });
      return;
    }
    const nextIndex = Math.max(0, Math.min(READER_FONT_SIZES.length - 1, currentIndex + delta));
    updateSettings({ fontSize: READER_FONT_SIZES[nextIndex] });
  };

  const handleToggleThemeQuick = () => {
    const nextTheme: ReaderTheme =
      settings.theme === "light"
        ? "midnight"
        : settings.theme === "midnight"
        ? "sepia"
        : settings.theme === "sepia"
        ? "dark"
        : "light";
    updateSettings({ theme: nextTheme });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredChapters = useMemo(() => {
    let list = chapterList;
    if (chapterSearch.trim()) {
      const q = chapterSearch.trim().toLowerCase();
      list = list.filter(
        (c) => c.number.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
      );
    }
    return chapterSortAsc ? list : [...list].reverse();
  }, [chapterList, chapterSearch, chapterSortAsc]);

  const readerStyle = {
    "--reader-font-size": `${settings.fontSize}px`,
    "--reader-line-height": String(settings.lineHeight),
    "--reader-content-width": `${settings.contentWidth}px`,
    "--reader-text-align": settings.textAlign,
  } as CSSProperties;

  return (
    <main
      className="reader-shell min-h-screen transition-colors duration-200"
      data-reader-theme={settings.theme}
      data-reader-font={settings.fontFamily}
      style={readerStyle}
    >
      {/* 1. Top Reading Progress Indicator */}
      <div
        className="fixed inset-x-0 top-0 z-50 h-[3px] bg-black/10 transition-opacity dark:bg-white/10"
        aria-hidden="true"
      >
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{
            width: `${scrollProgress}%`,
            backgroundColor: "var(--reader-accent, #0f766e)",
          }}
        />
      </div>

      {/* 2. Sticky Top Navigation Bar (Auto-hides on scroll down) */}
      <header
        className={`reader-topbar fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-all duration-300 ${
          isBarVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:px-6">
          <Link
            href={`/truyen/${story.slug}`}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold opacity-85 transition hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
            title="Trở về trang truyện"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Trở về</span>
          </Link>

          <div className="flex max-w-[180px] flex-col items-center text-center xs:max-w-xs sm:max-w-md">
            <span className="truncate text-xs font-bold leading-tight sm:text-sm">
              {story.title}
            </span>
            <span className="reader-muted text-[11px]">
              Chương {formatChapterNumber(chapter.number)} ({Math.round(scrollProgress)}%)
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick 1-Click Theme Toggle Button */}
            <button
              type="button"
              onClick={handleToggleThemeQuick}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm transition hover:bg-black/5 dark:hover:bg-white/10"
              title={`Đang là theme ${settings.theme}. Bấm để đổi theme nhanh.`}
              aria-label="Đổi theme đọc nhanh"
            >
              {settings.theme === "light" && <Moon className="w-4 h-4 text-slate-700" />}
              {settings.theme === "sepia" && <Coffee className="w-4 h-4 text-[#78350f]" />}
              {settings.theme === "midnight" && <Sparkles className="w-4 h-4 text-teal-400" />}
              {settings.theme === "dark" && <Sun className="w-4 h-4 text-amber-400" />}
              {settings.theme === "black" && <Lamp className="w-4 h-4 text-emerald-400" />}
            </button>

            {chapterList.length > 0 && (
              <button
                type="button"
                onClick={() => setChaptersDrawerOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition hover:bg-black/5 dark:hover:bg-white/10"
                title="Mục lục chương"
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline">Mục lục</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition hover:bg-black/5 dark:hover:bg-white/10"
              title="Cài đặt giao diện"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cài đặt</span>
            </button>
          </div>
        </div>
      </header>

      <div className="reader-container mx-auto px-3 pt-16 pb-28 sm:px-4 sm:pt-20">
        {/* Story Content Paper */}
        <article className="reader-paper rounded-2xl border px-4 py-8 shadow-sm transition-colors sm:px-10 sm:py-12">
          <header className="reader-heading-border border-b pb-6 text-center sm:pb-8">
            <Link
              href={`/truyen/${story.slug}`}
              className="reader-accent inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider transition hover:opacity-80 dark:bg-white/10"
            >
              <BookOpen className="w-3.5 h-3.5" /> {story.title}
            </Link>
            <h1 className="mt-4 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              Chương {formatChapterNumber(chapter.number)}: {chapter.title}
            </h1>
            <div className="reader-muted mt-3 flex items-center justify-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatReadingTime(chapter.wordCount)}</span>
              </span>
              <span>•</span>
              <span>{chapter.publishedDate}</span>
            </div>
            <div className="mt-4 text-xs opacity-40">✦ · · · ✦</div>
          </header>

          <div className="reader-content mt-8 select-text sm:mt-10">
            {paragraphs.map((paragraph, index) => (
              <div key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
            ))}
          </div>
        </article>

        {/* 3. Hero Chapter Transition Cards */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Chuyển chương nhanh">
          {previousChapter ? (
            <Link
              href={`/truyen/${story.slug}/chuong-${formatChapterNumber(previousChapter.number)}`}
              className="reader-card group flex flex-col justify-between rounded-2xl border p-4 transition hover:border-teal-600 hover:shadow-md"
            >
              <div className="reader-muted flex items-center gap-1.5 text-xs font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>CHƯƠNG TRƯỚC</span>
              </div>
              <div className="mt-2 font-bold text-sm line-clamp-2 group-hover:text-teal-600">
                Chương {formatChapterNumber(previousChapter.number)}: {previousChapter.title}
              </div>
            </Link>
          ) : (
            <div className="reader-card flex flex-col justify-center rounded-2xl border p-4 opacity-40">
              <span className="text-xs font-semibold">← ĐÂY LÀ CHƯƠNG ĐẦU TIÊN</span>
            </div>
          )}

          {nextChapter ? (
            <Link
              href={`/truyen/${story.slug}/chuong-${formatChapterNumber(nextChapter.number)}`}
              className="group flex flex-col justify-between rounded-2xl border border-teal-600 bg-teal-600/10 p-4 transition hover:bg-teal-600/20 hover:shadow-md dark:bg-teal-600/20"
            >
              <div className="reader-accent flex items-center justify-between text-xs font-bold">
                <span>CHƯƠNG TIẾP THEO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <div className="mt-2 font-bold text-sm line-clamp-2 group-hover:text-teal-600">
                Chương {formatChapterNumber(nextChapter.number)}: {nextChapter.title}
              </div>
            </Link>
          ) : (
            <div className="reader-card flex flex-col justify-center rounded-2xl border p-4 opacity-40">
              <span className="text-xs font-semibold">ĐÃ HẾT CHƯƠNG MỚI NHẤT →</span>
            </div>
          )}
        </section>
      </div>

      {/* 4. Floating Quick Bottom Bar (Mobile & Desktop) */}
      <div
        className={`fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[92%] max-w-md items-center justify-between rounded-full border px-3 py-2 transition-all duration-300 sm:bottom-6 sm:px-4 ${
          isBarVisible
            ? "translate-y-0 opacity-100 reader-floating-bar"
            : "pointer-events-none translate-y-16 opacity-0"
        }`}
        role="toolbar"
        aria-label="Thanh điều khiển nhanh"
      >
        {previousChapter ? (
          <Link
            href={`/truyen/${story.slug}/chuong-${formatChapterNumber(previousChapter.number)}`}
            className="flex h-10 min-w-10 items-center justify-center rounded-full text-base font-bold transition hover:bg-black/5 active:scale-95 dark:hover:bg-white/10"
            title="Chương trước"
            aria-label="Chương trước"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        ) : (
          <span className="flex h-10 min-w-10 items-center justify-center text-sm opacity-30">
            <ArrowLeft className="w-4 h-4 opacity-30" />
          </span>
        )}

        {chapterList.length > 0 ? (
          <button
            type="button"
            onClick={() => setChaptersDrawerOpen(true)}
            className="flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition hover:bg-black/5 active:scale-95 dark:hover:bg-white/10"
            title="Mục lục chương"
          >
            <List className="w-4 h-4" />
            <span>Chương {formatChapterNumber(chapter.number)}</span>
          </button>
        ) : (
          <Link
            href={`/truyen/${story.slug}`}
            className="flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition hover:bg-black/5 active:scale-95 dark:hover:bg-white/10"
          >
            <List className="w-4 h-4" />
            <span>Chương {formatChapterNumber(chapter.number)}</span>
          </Link>
        )}

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex h-10 min-w-10 items-center justify-center rounded-full text-xs font-bold transition hover:bg-black/5 active:scale-95 dark:hover:bg-white/10"
          title="Tùy chỉnh giao diện đọc"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleToggleThemeQuick}
          className="flex h-10 min-w-10 items-center justify-center rounded-full text-xs font-bold transition hover:bg-black/5 active:scale-95 dark:hover:bg-white/10"
          title="Đổi màu theme nhanh"
          aria-label="Đổi màu theme nhanh"
        >
          {settings.theme === "light" && <Moon className="w-4 h-4 text-slate-700" />}
          {settings.theme === "sepia" && <Coffee className="w-4 h-4 text-[#78350f]" />}
          {settings.theme === "midnight" && <Sparkles className="w-4 h-4 text-teal-400" />}
          {settings.theme === "dark" && <Sun className="w-4 h-4 text-amber-400" />}
          {settings.theme === "black" && <Lamp className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          type="button"
          onClick={scrollToTop}
          className="flex h-10 min-w-10 items-center justify-center rounded-full text-xs font-bold transition hover:bg-black/5 active:scale-95 dark:hover:bg-white/10"
          title="Lên đầu trang"
          aria-label="Lên đầu trang"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        {nextChapter ? (
          <Link
            href={`/truyen/${story.slug}/chuong-${formatChapterNumber(nextChapter.number)}`}
            className="flex h-10 min-w-10 items-center justify-center rounded-full text-base font-bold text-teal-600 transition hover:bg-black/5 active:scale-95 dark:hover:bg-white/10"
            title="Chương sau"
            aria-label="Chương sau"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="flex h-10 min-w-10 items-center justify-center text-sm opacity-30">
            <ArrowRight className="w-4 h-4 opacity-30" />
          </span>
        )}
      </div>

      {/* 3. Bottom Sheet / Modal: Settings */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity sm:items-center sm:p-4"
          onClick={() => setSettingsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Cài đặt hiển thị"
        >
          <div
            className="reader-bottom-sheet animate-slide-up flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-3xl border p-5 shadow-2xl sm:rounded-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold">Tùy chỉnh giao diện đọc</span>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg opacity-60 hover:opacity-100"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-black/5 overflow-y-auto py-2 dark:divide-white/5">
              {/* Color Themes */}
              <div className="py-3.5">
                <span className="mb-2.5 block text-xs font-bold uppercase tracking-wider opacity-70">
                  Màu nền
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {themeOptions.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateSettings({ theme: item.value })}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition ${
                        settings.theme === item.value
                          ? "border-teal-600 ring-2 ring-teal-600/30"
                          : "reader-settings-choice opacity-80 hover:opacity-100"
                      }`}
                    >
                      <span className={`h-6 w-6 rounded-full border shadow-xs ${item.swatch}`} />
                      <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="py-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Cỡ chữ ({settings.fontSize}px)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStepFontSize(-1)}
                      className="reader-outline-button h-8 px-3 text-xs"
                      aria-label="Giảm cỡ chữ"
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepFontSize(1)}
                      className="reader-outline-button h-8 px-3 text-xs"
                      aria-label="Tăng cỡ chữ"
                    >
                      A+
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {READER_FONT_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`h-9 rounded-lg border text-xs font-semibold transition ${
                        settings.fontSize === size
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "reader-settings-choice opacity-80 hover:opacity-100"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family & Text Align */}
              <div className="grid grid-cols-2 gap-3 py-3.5">
                <div>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider opacity-70">
                    Phông chữ
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {fontOptions.map((font) => (
                      <button
                        key={font.value}
                        type="button"
                        onClick={() => updateSettings({ fontFamily: font.value })}
                        className={`h-9 rounded-lg border text-xs font-semibold transition ${
                          settings.fontFamily === font.value
                            ? "border-teal-600 bg-teal-600 text-white"
                            : "reader-settings-choice opacity-80 hover:opacity-100"
                        } ${font.value === "serif" ? "font-serif" : "font-sans"}`}
                      >
                        {font.value === "sans" ? "Sans" : "Serif"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider opacity-70">
                    Căn lề
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {alignOptions.map((align) => (
                      <button
                        key={align.value}
                        type="button"
                        onClick={() => updateSettings({ textAlign: align.value })}
                        className={`flex h-9 items-center justify-center gap-1 rounded-lg border text-xs font-semibold transition ${
                          settings.textAlign === align.value
                            ? "border-teal-600 bg-teal-600 text-white"
                            : "reader-settings-choice opacity-80 hover:opacity-100"
                        }`}
                      >
                        <span>{align.icon}</span>
                        <span>{align.value === "left" ? "Trái" : "Đều"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Line Height */}
              <div className="py-3.5">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider opacity-70">
                  Giãn dòng
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {READER_LINE_HEIGHTS.map((lh) => (
                    <button
                      key={lh}
                      type="button"
                      onClick={() => updateSettings({ lineHeight: lh })}
                      className={`h-9 rounded-lg border text-xs font-semibold transition ${
                        settings.lineHeight === lh
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "reader-settings-choice opacity-80 hover:opacity-100"
                      }`}
                    >
                      {lh}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Width (Tablet/Desktop) */}
              <div className="hidden py-3.5 sm:block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider opacity-70">
                  Độ rộng khung đọc
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {READER_CONTENT_WIDTHS.map((width) => (
                    <button
                      key={width}
                      type="button"
                      onClick={() => updateSettings({ contentWidth: width })}
                      className={`h-9 rounded-lg border text-xs font-semibold transition ${
                        settings.contentWidth === width
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "reader-settings-choice opacity-80 hover:opacity-100"
                      }`}
                    >
                      {width}px
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 dark:border-white/10">
              <button
                type="button"
                onClick={() => writeReaderSettings(DEFAULT_READER_SETTINGS)}
                className="text-xs font-semibold underline underline-offset-4 opacity-70 hover:opacity-100"
              >
                Khôi phục mặc định
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="reader-primary-button min-h-9 px-5 text-xs"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Sheet / Drawer: Quick Chapter List */}
      {chaptersDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity sm:items-center sm:p-4"
          onClick={() => setChaptersDrawerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mục lục chương"
        >
          <div
            className="reader-bottom-sheet animate-slide-up flex h-[80vh] w-full max-w-xl flex-col rounded-t-3xl border p-4 shadow-2xl sm:h-[75vh] sm:rounded-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 pb-3 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold">Mục lục chương</h2>
                <p className="reader-muted text-xs">
                  {story.title} · {chapterList.length} chương
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChaptersDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg opacity-60 hover:opacity-100"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Filter & Sort Bar */}
            <div className="my-3 flex items-center gap-2">
              <input
                type="text"
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
                placeholder="Tìm số chương hoặc tiêu đề..."
                className="reader-settings-choice h-9 flex-1 rounded-lg border px-3 text-xs outline-none focus:ring-2 focus:ring-teal-600/30"
              />
              <button
                type="button"
                onClick={() => setChapterSortAsc((prev) => !prev)}
                className="reader-outline-button h-9 min-h-0 px-3 text-xs"
                title="Đổi thứ tự sắp xếp"
              >
                {chapterSortAsc ? "Mới nhất ↑" : "Cũ nhất ↓"}
              </button>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto pr-1">
              {filteredChapters.length === 0 ? (
                <div className="py-12 text-center text-xs opacity-60">
                  Không tìm thấy chương nào phù hợp.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredChapters.map((c) => {
                    const isCurrent = formatChapterNumber(c.number) === formatChapterNumber(chapter.number);
                    return (
                      <Link
                        key={c.number}
                        ref={isCurrent ? activeChapterRef : undefined}
                        href={`/truyen/${story.slug}/chuong-${formatChapterNumber(c.number)}`}
                        onClick={() => setChaptersDrawerOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition ${
                          isCurrent
                            ? "bg-teal-600 text-white font-bold shadow-xs"
                            : "hover:bg-black/5 dark:hover:bg-white/5 opacity-85 hover:opacity-100"
                        }`}
                      >
                        <span className="truncate pr-2">
                          Chương {formatChapterNumber(c.number)}: {c.title}
                        </span>
                        {isCurrent && (
                          <span className="shrink-0 rounded-md bg-white/20 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                            Đang đọc
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

