export const READER_ANNOTATIONS_KEY = "moc-thu:reader-annotations:v1";
export const READER_ANNOTATIONS_EVENT = "moc-thu:reader-annotations-updated";
export const READER_ANNOTATION_COLORS = ["yellow", "green", "pink", "blue"] as const;

export type ReaderAnnotationColor = (typeof READER_ANNOTATION_COLORS)[number];

export type ReaderAnnotationRecord = {
  clientId: string;
  ownerId: string | null;
  storyId: string;
  storySlug: string;
  storyTitle: string;
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  quoteText: string;
  prefixText: string;
  suffixText: string;
  startOffset: number;
  endOffset: number;
  color: ReaderAnnotationColor;
  noteText: string | null;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type TextSelector = Pick<
  ReaderAnnotationRecord,
  "quoteText" | "prefixText" | "suffixText" | "startOffset" | "endOffset"
>;

const MAX_LOCAL_ANNOTATIONS = 1_000;
const CONTEXT_LENGTH = 80;

function getStorage(storage?: Storage) {
  if (storage) return storage;
  return typeof window === "undefined" ? null : window.localStorage;
}

function isDateString(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isAnnotation(value: unknown): value is ReaderAnnotationRecord {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ReaderAnnotationRecord>;
  return typeof item.clientId === "string"
    && (typeof item.ownerId === "string" || item.ownerId === null)
    && typeof item.storyId === "string"
    && typeof item.storySlug === "string"
    && typeof item.storyTitle === "string"
    && typeof item.chapterId === "string"
    && typeof item.chapterNumber === "string"
    && typeof item.chapterTitle === "string"
    && typeof item.quoteText === "string"
    && item.quoteText.length > 0
    && item.quoteText.length <= 2_000
    && typeof item.prefixText === "string"
    && typeof item.suffixText === "string"
    && Number.isInteger(item.startOffset)
    && Number.isInteger(item.endOffset)
    && (item.startOffset ?? -1) >= 0
    && (item.endOffset ?? 0) > (item.startOffset ?? -1)
    && READER_ANNOTATION_COLORS.includes(item.color as ReaderAnnotationColor)
    && (typeof item.noteText === "string" || item.noteText === null)
    && typeof item.contentHash === "string"
    && isDateString(item.createdAt)
    && isDateString(item.updatedAt)
    && (item.deletedAt === null || isDateString(item.deletedAt));
}

export function readLocalAnnotations(storage?: Storage): ReaderAnnotationRecord[] {
  const target = getStorage(storage);
  if (!target) return [];
  try {
    const raw = target.getItem(READER_ANNOTATIONS_KEY);
    return parseLocalAnnotations(raw ?? "");
  } catch {
    return [];
  }
}

export function parseLocalAnnotations(raw: string): ReaderAnnotationRecord[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAnnotation).slice(0, MAX_LOCAL_ANNOTATIONS);
  } catch {
    return [];
  }
}

export function writeLocalAnnotations(records: ReaderAnnotationRecord[], storage?: Storage) {
  const target = getStorage(storage);
  if (!target) return;
  const safeRecords = records
    .filter(isAnnotation)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, MAX_LOCAL_ANNOTATIONS);
  try {
    target.setItem(READER_ANNOTATIONS_KEY, JSON.stringify(safeRecords));
    if (!storage && typeof window !== "undefined") {
      window.dispatchEvent(new Event(READER_ANNOTATIONS_EVENT));
    }
  } catch {
    // Annotation storage is best-effort and must never block reading.
  }
}

export function mergeLocalAnnotations(
  current: ReaderAnnotationRecord[],
  incoming: ReaderAnnotationRecord[],
) {
  const byId = new Map(current.map((record) => [record.clientId, record]));
  for (const record of incoming) {
    const existing = byId.get(record.clientId);
    if (!existing || Date.parse(record.updatedAt) >= Date.parse(existing.updatedAt)) {
      byId.set(record.clientId, record);
    }
  }
  return [...byId.values()].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function annotationsForReader(
  records: ReaderAnnotationRecord[],
  chapterId: string,
  userId: string | null,
) {
  return records.filter((record) =>
    record.chapterId === chapterId
    && record.deletedAt === null
    && (userId ? record.ownerId === userId || record.ownerId === null : record.ownerId === null),
  );
}

export function createTextSelector(text: string, startOffset: number, endOffset: number): TextSelector | null {
  if (!Number.isInteger(startOffset) || !Number.isInteger(endOffset) || startOffset < 0 || endOffset <= startOffset) {
    return null;
  }
  const quoteText = text.slice(startOffset, endOffset);
  if (!quoteText.trim() || quoteText.length > 2_000) return null;
  return {
    quoteText,
    prefixText: text.slice(Math.max(0, startOffset - CONTEXT_LENGTH), startOffset),
    suffixText: text.slice(endOffset, endOffset + CONTEXT_LENGTH),
    startOffset,
    endOffset,
  };
}

function commonSuffixLength(left: string, right: string) {
  const max = Math.min(left.length, right.length);
  let length = 0;
  while (length < max && left[left.length - 1 - length] === right[right.length - 1 - length]) length += 1;
  return length;
}

function commonPrefixLength(left: string, right: string) {
  const max = Math.min(left.length, right.length);
  let length = 0;
  while (length < max && left[length] === right[length]) length += 1;
  return length;
}

export function resolveTextSelector(text: string, selector: TextSelector) {
  const expected = text.slice(selector.startOffset, selector.endOffset);
  if (expected === selector.quoteText) {
    return { startOffset: selector.startOffset, endOffset: selector.endOffset };
  }

  let match = text.indexOf(selector.quoteText);
  let best: { startOffset: number; endOffset: number; score: number } | null = null;
  let inspected = 0;
  while (match >= 0 && inspected < 1_000) {
    const end = match + selector.quoteText.length;
    const prefix = text.slice(Math.max(0, match - selector.prefixText.length), match);
    const suffix = text.slice(end, end + selector.suffixText.length);
    const score = commonSuffixLength(prefix, selector.prefixText)
      + commonPrefixLength(suffix, selector.suffixText)
      - Math.min(Math.abs(match - selector.startOffset), 500) / 500;
    if (!best || score > best.score) best = { startOffset: match, endOffset: end, score };
    inspected += 1;
    match = text.indexOf(selector.quoteText, match + Math.max(1, selector.quoteText.length));
  }
  return best ? { startOffset: best.startOffset, endOffset: best.endOffset } : null;
}

export function hashReaderText(text: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
