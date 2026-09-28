export const READER_SETTINGS_KEY = "moc-thu:reader-settings:v1";
export const READER_SETTINGS_EVENT = "moc-thu:reader-settings-updated";
export const GUEST_HISTORY_KEY = "moc-thu:guest-history:v1";
export const GUEST_HISTORY_EVENT = "moc-thu:guest-history-updated";

export type ReaderTheme = "light" | "sepia" | "dark" | "black";

export const READER_FONT_SIZES = [16, 18, 20, 22, 24, 26] as const;
export const READER_LINE_HEIGHTS = [1.5, 1.7, 1.9, 2.1] as const;
export const READER_CONTENT_WIDTHS = [640, 760, 880] as const;

export type ReaderSettings = {
  fontSize: number;
  lineHeight: number;
  contentWidth: number;
  theme: ReaderTheme;
};

export type GuestHistoryRecord = {
  storySlug: string;
  storyTitle: string;
  chapterNumber: string;
  chapterTitle: string;
  href: string;
  readAt: string;
};

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 20,
  lineHeight: 1.9,
  contentWidth: 760,
  theme: "light",
};

const themes: ReaderTheme[] = ["light", "sepia", "dark", "black"];
const MAX_HISTORY_ITEMS = 50;

function getStorage(storage?: Storage) {
  if (storage) return storage;
  return typeof window === "undefined" ? null : window.localStorage;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function sanitizeReaderSettings(value: unknown): ReaderSettings {
  if (!value || typeof value !== "object") return DEFAULT_READER_SETTINGS;
  const candidate = value as Partial<ReaderSettings>;

  return {
    fontSize: isFiniteNumber(candidate.fontSize) && READER_FONT_SIZES.some((value) => value === candidate.fontSize)
      ? candidate.fontSize
      : DEFAULT_READER_SETTINGS.fontSize,
    lineHeight: isFiniteNumber(candidate.lineHeight) && READER_LINE_HEIGHTS.some((value) => value === candidate.lineHeight)
      ? candidate.lineHeight
      : DEFAULT_READER_SETTINGS.lineHeight,
    contentWidth: isFiniteNumber(candidate.contentWidth) && READER_CONTENT_WIDTHS.some((value) => value === candidate.contentWidth)
      ? candidate.contentWidth
      : DEFAULT_READER_SETTINGS.contentWidth,
    theme: typeof candidate.theme === "string" && themes.includes(candidate.theme as ReaderTheme)
      ? candidate.theme as ReaderTheme
      : DEFAULT_READER_SETTINGS.theme,
  };
}

export function readReaderSettings(storage?: Storage) {
  const target = getStorage(storage);
  if (!target) return DEFAULT_READER_SETTINGS;

  try {
    const rawValue = target.getItem(READER_SETTINGS_KEY);
    return rawValue ? sanitizeReaderSettings(JSON.parse(rawValue)) : DEFAULT_READER_SETTINGS;
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

export function writeReaderSettings(settings: ReaderSettings, storage?: Storage) {
  const target = getStorage(storage);
  if (!target) return;

  try {
    target.setItem(READER_SETTINGS_KEY, JSON.stringify(sanitizeReaderSettings(settings)));
    if (!storage && typeof window !== "undefined") {
      window.dispatchEvent(new Event(READER_SETTINGS_EVENT));
    }
  } catch {
    // Reader settings are optional; storage failures must not block reading.
  }
}

function isGuestHistoryRecord(value: unknown): value is GuestHistoryRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<GuestHistoryRecord>;
  return typeof record.storySlug === "string"
    && record.storySlug.length > 0
    && typeof record.storyTitle === "string"
    && typeof record.chapterNumber === "string"
    && typeof record.chapterTitle === "string"
    && typeof record.href === "string"
    && record.href.startsWith(`/truyen/${record.storySlug}/chuong-`)
    && typeof record.readAt === "string"
    && !Number.isNaN(Date.parse(record.readAt));
}

export function readGuestHistory(storage?: Storage): GuestHistoryRecord[] {
  const target = getStorage(storage);
  if (!target) return [];

  try {
    const rawValue = target.getItem(GUEST_HISTORY_KEY);
    const parsed: unknown = rawValue ? JSON.parse(rawValue) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isGuestHistoryRecord).slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

export function upsertGuestHistory(
  history: GuestHistoryRecord[],
  record: GuestHistoryRecord,
) {
  return [record, ...history.filter((item) => item.storySlug !== record.storySlug)]
    .slice(0, MAX_HISTORY_ITEMS);
}

function notifyHistoryUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(GUEST_HISTORY_EVENT));
  }
}

export function saveGuestHistory(record: GuestHistoryRecord, storage?: Storage) {
  if (!isGuestHistoryRecord(record)) return [];
  const target = getStorage(storage);
  if (!target) return [];

  const nextHistory = upsertGuestHistory(readGuestHistory(target), record);
  try {
    target.setItem(GUEST_HISTORY_KEY, JSON.stringify(nextHistory));
    if (!storage) notifyHistoryUpdated();
  } catch {
    // History is best-effort and must not interrupt the reader.
  }
  return nextHistory;
}

export function removeGuestHistory(storySlug: string, storage?: Storage) {
  const target = getStorage(storage);
  if (!target) return [];
  const nextHistory = readGuestHistory(target).filter((item) => item.storySlug !== storySlug);
  try {
    target.setItem(GUEST_HISTORY_KEY, JSON.stringify(nextHistory));
    if (!storage) notifyHistoryUpdated();
  } catch {
    // Ignore optional storage failures.
  }
  return nextHistory;
}

export function clearGuestHistory(storage?: Storage) {
  const target = getStorage(storage);
  if (!target) return;
  try {
    target.removeItem(GUEST_HISTORY_KEY);
    if (!storage) notifyHistoryUpdated();
  } catch {
    // Ignore optional storage failures.
  }
}
