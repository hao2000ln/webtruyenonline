"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { formatChapterNumber } from "@/lib/format";
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
  type ReaderSettings,
  type ReaderTheme,
} from "@/lib/reader-storage";

type ChapterLink = { number: string; title: string } | null;

type ReaderExperienceProps = {
  story: { title: string; slug: string };
  chapter: { number: string; title: string; wordCount: number; publishedDate: string };
  paragraphs: string[];
  previousChapter: ChapterLink;
  nextChapter: ChapterLink;
};

const themeOptions: Array<{ value: ReaderTheme; label: string; swatch: string }> = [
  { value: "light", label: "Sáng", swatch: "bg-white" },
  { value: "sepia", label: "Sepia", swatch: "bg-[#f4ecd8]" },
  { value: "dark", label: "Tối", swatch: "bg-[#18181b]" },
  { value: "black", label: "Đen", swatch: "bg-black" },
];

function ChapterNavigation({ storySlug, previous, next }: { storySlug: string; previous: ChapterLink; next: ChapterLink }) {
  return (
    <nav className="grid grid-cols-3 items-center gap-2" aria-label="Điều hướng chương">
      {previous ? (
        <Link href={`/truyen/${storySlug}/chuong-${formatChapterNumber(previous.number)}`} className="reader-outline-button justify-self-start" title={previous.title}>← Trước</Link>
      ) : <span className="reader-disabled justify-self-start">← Trước</span>}
      <Link href={`/truyen/${storySlug}`} className="reader-muted justify-self-center text-center text-sm font-semibold transition hover:opacity-70">Mục lục</Link>
      {next ? (
        <Link href={`/truyen/${storySlug}/chuong-${formatChapterNumber(next.number)}`} className="reader-primary-button justify-self-end" title={next.title}>Sau →</Link>
      ) : <span className="reader-disabled justify-self-end">Sau →</span>}
    </nav>
  );
}

function SettingSelect({
  label,
  value,
  options,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  options: readonly number[];
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-semibold">
      <span className="mb-2 block">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="reader-settings-choice h-10 w-full rounded-lg border bg-transparent px-3 outline-none focus:ring-2 focus:ring-teal-600/30"
      >
        {options.map((option) => <option key={option} value={option} className="text-slate-900">{option}{suffix}</option>)}
      </select>
    </label>
  );
}

export function ReaderExperience({ story, chapter, paragraphs, previousChapter, nextChapter }: ReaderExperienceProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  const updateSettings = (partial: Partial<ReaderSettings>) => writeReaderSettings({ ...settings, ...partial });
  const readerStyle = {
    "--reader-font-size": `${settings.fontSize}px`,
    "--reader-line-height": String(settings.lineHeight),
    "--reader-content-width": `${settings.contentWidth}px`,
  } as CSSProperties;

  return (
    <main className="reader-shell min-h-screen px-4 py-8 transition-colors sm:py-12" data-reader-theme={settings.theme} style={readerStyle}>
      <div className="reader-container mx-auto">
        <nav className="reader-muted mb-6 flex flex-wrap items-center justify-center gap-2 text-center text-sm" aria-label="Điều hướng">
          <Link href="/" className="transition hover:opacity-70">Trang chủ</Link><span>/</span>
          <Link href={`/truyen/${story.slug}`} className="transition hover:opacity-70">{story.title}</Link><span>/</span>
          <span>Chương {formatChapterNumber(chapter.number)}</span>
        </nav>

        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="reader-muted text-xs">Tùy chỉnh trải nghiệm đọc theo ý bạn</span>
          <button type="button" onClick={() => setSettingsOpen((open) => !open)} aria-expanded={settingsOpen} aria-controls="reader-settings-panel" className="reader-outline-button">
            Aa · Tùy chỉnh
          </button>
        </div>

        {settingsOpen ? (
          <section id="reader-settings-panel" className="reader-settings-panel mb-7 rounded-2xl border p-4 shadow-sm sm:p-5" aria-label="Cài đặt đọc truyện">
            <div className="grid gap-5 sm:grid-cols-3">
              <SettingSelect label="Cỡ chữ" value={settings.fontSize} options={READER_FONT_SIZES} suffix="px" onChange={(fontSize) => updateSettings({ fontSize })} />
              <SettingSelect label="Giãn dòng" value={settings.lineHeight} options={READER_LINE_HEIGHTS} suffix="" onChange={(lineHeight) => updateSettings({ lineHeight })} />
              <SettingSelect label="Độ rộng" value={settings.contentWidth} options={READER_CONTENT_WIDTHS} suffix="px" onChange={(contentWidth) => updateSettings({ contentWidth })} />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm font-semibold">Màu nền</span>
              {themeOptions.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => updateSettings({ theme: theme.value })}
                  aria-pressed={settings.theme === theme.value}
                  className={`flex min-h-10 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${settings.theme === theme.value ? "border-teal-600 ring-2 ring-teal-600/20" : "reader-settings-choice"}`}
                >
                  <span className={`h-4 w-4 rounded-full border border-black/15 ${theme.swatch}`} />{theme.label}
                </button>
              ))}
              <button type="button" onClick={() => writeReaderSettings(DEFAULT_READER_SETTINGS)} className="ml-auto text-xs font-semibold underline underline-offset-4 opacity-70 hover:opacity-100">
                Mặc định
              </button>
            </div>
          </section>
        ) : null}

        <ChapterNavigation storySlug={story.slug} previous={previousChapter} next={nextChapter} />
        <article className="reader-paper mt-8 rounded-xl border px-5 py-9 transition-colors sm:px-10 sm:py-10">
          <header className="reader-heading-border border-b pb-8 text-center">
            <Link href={`/truyen/${story.slug}`} className="reader-accent text-sm font-semibold hover:opacity-70">{story.title}</Link>
            <h1 className="mt-4 text-2xl font-bold leading-[1.3] tracking-tight sm:text-[28px]">Chương {formatChapterNumber(chapter.number)}: {chapter.title}</h1>
            <p className="reader-muted mt-3 text-xs">{chapter.wordCount} từ · {chapter.publishedDate}</p>
          </header>
          <div className="reader-content mt-9">
            {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </article>
        <div className="mt-8"><ChapterNavigation storySlug={story.slug} previous={previousChapter} next={nextChapter} /></div>
      </div>
    </main>
  );
}
