"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { Highlighter, NotebookPen, Trash2, X } from "lucide-react";
import {
  READER_ANNOTATION_COLORS,
  READER_ANNOTATIONS_EVENT,
  READER_ANNOTATIONS_KEY,
  annotationsForReader,
  createTextSelector,
  hashReaderText,
  mergeLocalAnnotations,
  parseLocalAnnotations,
  readLocalAnnotations,
  resolveTextSelector,
  writeLocalAnnotations,
  type ReaderAnnotationColor,
  type ReaderAnnotationRecord,
} from "@/lib/reader-annotations";

type Props = {
  contentRef: RefObject<HTMLDivElement | null>;
  story: { id: string; title: string; slug: string };
  chapter: { id: string; number: string; title: string };
  userId: string | null;
};

type PendingSelection = {
  startOffset: number;
  endOffset: number;
  left: number;
  top: number;
  annotationIds: string[];
};

const colorStyles: Record<ReaderAnnotationColor, string> = {
  yellow: "bg-amber-300",
  green: "bg-emerald-300",
  pink: "bg-pink-300",
  blue: "bg-sky-300",
};

function textNodes(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}

function plainText(root: Node) {
  return textNodes(root).map((node) => node.data).join("");
}

function boundaryOffset(root: Node, container: Node, offset: number) {
  const range = document.createRange();
  range.selectNodeContents(root);
  try {
    range.setEnd(container, offset);
    return range.toString().length;
  } catch {
    return null;
  }
}

function rangeFromOffsets(root: Node, startOffset: number, endOffset: number) {
  const nodes = textNodes(root);
  let cursor = 0;
  let start: { node: Text; offset: number } | null = null;
  let end: { node: Text; offset: number } | null = null;
  for (const node of nodes) {
    const next = cursor + node.data.length;
    if (!start && startOffset >= cursor && startOffset <= next) {
      start = { node, offset: startOffset - cursor };
    }
    if (endOffset >= cursor && endOffset <= next) {
      end = { node, offset: endOffset - cursor };
      break;
    }
    cursor = next;
  }
  if (!start || !end) return null;
  const range = document.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  return range;
}

type HighlightRegistry = {
  set(name: string, highlight: unknown): void;
  delete(name: string): void;
};

function getHighlightApi() {
  const css = CSS as typeof CSS & { highlights?: HighlightRegistry };
  const HighlightConstructor = (window as typeof window & { Highlight?: new (...ranges: Range[]) => unknown }).Highlight;
  return css.highlights && HighlightConstructor
    ? { registry: css.highlights, HighlightConstructor }
    : null;
}

export function ReaderAnnotations({ contentRef, story, chapter, userId }: Props) {
  const [pending, setPending] = useState<PendingSelection | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editor, setEditor] = useState<{ record: ReaderAnnotationRecord; note: string; isNew: boolean } | null>(null);
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "offline">("idle");
  const syncStarted = useRef(false);
  const syncQueue = useRef(new Map<string, ReaderAnnotationRecord>());
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const annotationsSnapshot = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(READER_ANNOTATIONS_EVENT, onStoreChange);
      window.addEventListener("storage", onStoreChange);
      return () => {
        window.removeEventListener(READER_ANNOTATIONS_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    () => window.localStorage.getItem(READER_ANNOTATIONS_KEY) ?? "",
    () => "",
  );
  const records = useMemo(() => parseLocalAnnotations(annotationsSnapshot), [annotationsSnapshot]);

  const chapterRecords = useMemo(
    () => annotationsForReader(records, chapter.id, userId),
    [chapter.id, records, userId],
  );

  const selectedAnnotations = useMemo(
    () => pending
      ? chapterRecords.filter((record) => pending.annotationIds.includes(record.clientId))
      : [],
    [chapterRecords, pending],
  );

  const sync = useCallback(async (changed: ReaderAnnotationRecord[] = []) => {
    if (!userId) return;
    setSyncState("syncing");
    try {
      const response = await fetch("/api/annotations/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chapterIds: [chapter.id],
          records: changed.map(({ chapterId, clientId, quoteText, prefixText, suffixText, startOffset, endOffset, color, noteText, contentHash, createdAt, updatedAt, deletedAt }) => ({
            chapterId, clientId, quoteText, prefixText, suffixText, startOffset, endOffset, color, noteText, contentHash, createdAt, updatedAt, deletedAt,
          })),
        }),
      });
      if (!response.ok) throw new Error("sync-failed");
      const payload = await response.json() as { records: ReaderAnnotationRecord[] };
      const local = readLocalAnnotations().map((record) =>
        record.ownerId === null && record.chapterId === chapter.id
          ? { ...record, ownerId: userId }
          : record,
      );
      writeLocalAnnotations(mergeLocalAnnotations(local, payload.records));
      setSyncState("idle");
    } catch {
      setSyncState("offline");
    }
  }, [chapter.id, userId]);

  const scheduleSync = useCallback((changed: ReaderAnnotationRecord[]) => {
    if (!userId) return;
    for (const record of changed) syncQueue.current.set(record.clientId, record);
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const batch = [...syncQueue.current.values()];
      syncQueue.current.clear();
      syncTimer.current = null;
      void sync(batch);
    }, 500);
  }, [sync, userId]);

  useEffect(() => () => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
  }, []);

  useEffect(() => {
    if (!userId || syncStarted.current) return;
    syncStarted.current = true;
    const local = readLocalAnnotations().filter(
      (record) => record.chapterId === chapter.id && (record.ownerId === null || record.ownerId === userId),
    );
    void sync(local);
  }, [chapter.id, sync, userId]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const api = getHighlightApi();
    if (!api) return;
    const text = plainText(root);
    for (const color of READER_ANNOTATION_COLORS) {
      const ranges = chapterRecords
        .filter((record) => record.color === color)
        .map((record) => resolveTextSelector(text, record))
        .filter((position): position is { startOffset: number; endOffset: number } => Boolean(position))
        .map((position) => rangeFromOffsets(root, position.startOffset, position.endOffset))
        .filter((range): range is Range => Boolean(range));
      const name = `reader-annotation-${color}`;
      if (ranges.length) api.registry.set(name, new api.HighlightConstructor(...ranges));
      else api.registry.delete(name);
    }
    return () => {
      for (const color of READER_ANNOTATION_COLORS) api.registry.delete(`reader-annotation-${color}`);
    };
  }, [chapterRecords, contentRef]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const capture = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) return;
      const start = boundaryOffset(root, range.startContainer, range.startOffset);
      const end = boundaryOffset(root, range.endContainer, range.endOffset);
      if (start === null || end === null || end <= start || end - start > 2_000) return;
      const rect = range.getBoundingClientRect();
      const text = plainText(root);
      const annotationIds = chapterRecords.flatMap((record) => {
        const position = resolveTextSelector(text, record);
        return position && start < position.endOffset && end > position.startOffset
          ? [record.clientId]
          : [];
      });
      setPending({
        startOffset: start,
        endOffset: end,
        left: Math.min(window.innerWidth - 150, Math.max(150, rect.left + rect.width / 2)),
        top: Math.max(72, rect.top - 12),
        annotationIds,
      });
    };
    root.addEventListener("mouseup", capture);
    root.addEventListener("touchend", capture);
    return () => {
      root.removeEventListener("mouseup", capture);
      root.removeEventListener("touchend", capture);
    };
  }, [chapterRecords, contentRef]);

  const persist = useCallback((record: ReaderAnnotationRecord) => {
    writeLocalAnnotations(mergeLocalAnnotations(readLocalAnnotations(), [record]));
    scheduleSync([record]);
  }, [scheduleSync]);

  const createRecord = useCallback((color: ReaderAnnotationColor, withNote: boolean) => {
    const root = contentRef.current;
    if (!root || !pending) return;
    const text = plainText(root);
    const selector = createTextSelector(text, pending.startOffset, pending.endOffset);
    if (!selector) return;
    const now = new Date().toISOString();
    const record: ReaderAnnotationRecord = {
      clientId: crypto.randomUUID(),
      ownerId: userId,
      storyId: story.id,
      storySlug: story.slug,
      storyTitle: story.title,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      chapterTitle: chapter.title,
      ...selector,
      color,
      noteText: null,
      contentHash: hashReaderText(text),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    setPending(null);
    window.getSelection()?.removeAllRanges();
    if (withNote) setEditor({ record, note: "", isNew: true });
    else persist(record);
  }, [chapter, contentRef, pending, persist, story, userId]);

  const saveNote = () => {
    if (!editor) return;
    if (editor.isNew && !editor.note.trim()) return;
    const updated = { ...editor.record, noteText: editor.note.trim() || null, updatedAt: new Date().toISOString() };
    persist(updated);
    setEditor(null);
  };

  const removeSelected = () => {
    if (selectedAnnotations.length === 0) return;
    const now = new Date().toISOString();
    const deleted = selectedAnnotations.map((record) => ({ ...record, deletedAt: now, updatedAt: now }));
    writeLocalAnnotations(mergeLocalAnnotations(readLocalAnnotations(), deleted));
    scheduleSync(deleted);
    setPending(null);
    window.getSelection()?.removeAllRanges();
  };

  const applyColor = (color: ReaderAnnotationColor) => {
    if (selectedAnnotations.length === 0) {
      createRecord(color, false);
      return;
    }
    const now = new Date().toISOString();
    const updated = selectedAnnotations.map((record) => ({ ...record, color, updatedAt: now }));
    writeLocalAnnotations(mergeLocalAnnotations(readLocalAnnotations(), updated));
    scheduleSync(updated);
    setPending(null);
    window.getSelection()?.removeAllRanges();
  };

  const remove = (record: ReaderAnnotationRecord) => {
    if (!window.confirm("Xóa highlight và ghi chú này?")) return;
    const now = new Date().toISOString();
    persist({ ...record, deletedAt: now, updatedAt: now });
  };

  const jumpTo = (record: ReaderAnnotationRecord) => {
    const root = contentRef.current;
    if (!root) return;
    const position = resolveTextSelector(plainText(root), record);
    const range = position && rangeFromOffsets(root, position.startOffset, position.endOffset);
    if (!range) return;
    const rect = range.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight / 3, behavior: "smooth" });
    setDrawerOpen(false);
  };

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <style>{`
        ::highlight(reader-annotation-yellow) { background-color: #fde68a; color: inherit; }
        ::highlight(reader-annotation-green) { background-color: #a7f3d0; color: inherit; }
        ::highlight(reader-annotation-pink) { background-color: #fbcfe8; color: inherit; }
        ::highlight(reader-annotation-blue) { background-color: #bae6fd; color: inherit; }
      `}</style>
      {pending ? (
        <div
          className="fixed z-[70] flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl"
          style={{ left: pending.left, top: pending.top }}
          role="toolbar"
          aria-label="Lưu đoạn đã chọn"
        >
          {READER_ANNOTATION_COLORS.map((color) => (
            <button key={color} type="button" onClick={() => applyColor(color)} className={`size-7 rounded-full border-2 border-white shadow ${colorStyles[color]}`} aria-label={`Highlight màu ${color}`} />
          ))}
          <button type="button" onClick={() => createRecord("yellow", true)} className="ml-1 flex h-8 items-center gap-1 rounded-lg bg-slate-900 px-2.5 text-xs font-bold text-white">
            <NotebookPen className="size-3.5" /> Ghi chú
          </button>
          {selectedAnnotations.length > 0 ? (
            <button type="button" onClick={removeSelected} className="flex h-8 items-center gap-1 rounded-lg bg-rose-600 px-2.5 text-xs font-bold text-white">
              <Trash2 className="size-3.5" /> Xóa
            </button>
          ) : null}
          <button type="button" onClick={() => setPending(null)} className="flex size-7 items-center justify-center" aria-label="Đóng"><X className="size-4" /></button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-lg hover:bg-slate-50 sm:bottom-6 sm:right-6"
      >
        <Highlighter className="size-4 text-teal-700" /> Đánh dấu ({chapterRecords.length})
      </button>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/50" role="dialog" aria-modal="true" onClick={() => setDrawerOpen(false)}>
          <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-5 text-slate-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b pb-4">
              <div><h2 className="text-lg font-black">Highlight & ghi chú</h2><p className="mt-1 text-xs text-slate-500">Chương {chapter.number} · {syncState === "syncing" ? "Đang đồng bộ…" : syncState === "offline" ? "Đã lưu trên thiết bị" : userId ? "Đã đồng bộ" : "Lưu trên thiết bị"}</p></div>
              <button type="button" onClick={() => setDrawerOpen(false)} className="p-2" aria-label="Đóng"><X className="size-5" /></button>
            </div>
            {chapterRecords.length ? <div className="mt-4 space-y-3">{chapterRecords.map((record) => (
              <article key={record.clientId} className="rounded-xl border border-slate-200 p-4">
                <div className={`mb-3 h-1.5 w-12 rounded-full ${colorStyles[record.color]}`} />
                <blockquote className="line-clamp-4 text-sm font-medium leading-6">“{record.quoteText}”</blockquote>
                {record.noteText ? <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{record.noteText}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <button type="button" onClick={() => jumpTo(record)} className="rounded-lg bg-teal-50 px-3 py-2 text-teal-700">Đến đoạn</button>
                  <button type="button" onClick={() => setEditor({ record, note: record.noteText ?? "", isNew: false })} className="rounded-lg bg-slate-100 px-3 py-2">{record.noteText ? "Sửa ghi chú" : "Thêm ghi chú"}</button>
                  <button type="button" onClick={() => remove(record)} className="ml-auto flex items-center gap-1 rounded-lg px-2 py-2 text-rose-600"><Trash2 className="size-3.5" /> Xóa</button>
                </div>
              </article>
            ))}</div> : <p className="py-16 text-center text-sm text-slate-500">Bôi đen một đoạn trong nội dung để bắt đầu.</p>}
          </aside>
        </div>
      ) : null}

      {editor ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" onClick={() => setEditor(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 text-slate-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-black">Ghi chú đoạn hay</h2>
            <blockquote className="mt-3 max-h-28 overflow-y-auto rounded-xl bg-amber-50 p-3 text-sm leading-6">“{editor.record.quoteText}”</blockquote>
            <textarea autoFocus maxLength={5_000} value={editor.note} onChange={(event) => setEditor({ ...editor, note: event.target.value })} placeholder="Viết suy nghĩ của bạn…" className="mt-4 min-h-36 w-full resize-y rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />
            <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setEditor(null)} className="rounded-lg px-4 py-2 text-sm font-bold">Hủy</button><button type="button" disabled={editor.isNew && !editor.note.trim()} onClick={saveNote} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Lưu ghi chú</button></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
