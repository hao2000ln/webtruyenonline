import assert from "node:assert/strict";
import {
  createTextSelector,
  hashReaderText,
  mergeLocalAnnotations,
  parseLocalAnnotations,
  resolveTextSelector,
  type ReaderAnnotationRecord,
} from "../src/lib/reader-annotations";

const original = "Mở đầu. Đây là một câu rất hay trong truyện. Kết thúc.";
const start = original.indexOf("Đây là");
const end = start + "Đây là một câu rất hay trong truyện.".length;
const selector = createTextSelector(original, start, end);
assert.ok(selector);
assert.deepEqual(resolveTextSelector(original, selector), { startOffset: start, endOffset: end });

const edited = `Lời dẫn mới. ${original}`;
assert.deepEqual(resolveTextSelector(edited, selector), {
  startOffset: start + "Lời dẫn mới. ".length,
  endOffset: end + "Lời dẫn mới. ".length,
});

const now = new Date().toISOString();
const base: ReaderAnnotationRecord = {
  clientId: "00000000-0000-4000-8000-000000000001",
  ownerId: null,
  storyId: "00000000-0000-4000-8000-000000000002",
  storySlug: "truyen-mau",
  storyTitle: "Truyện mẫu",
  chapterId: "00000000-0000-4000-8000-000000000003",
  chapterNumber: "1",
  chapterTitle: "Mở đầu",
  ...selector,
  color: "yellow",
  noteText: null,
  contentHash: hashReaderText(original),
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
};

assert.equal(parseLocalAnnotations(JSON.stringify([base])).length, 1);
assert.equal(parseLocalAnnotations("invalid-json").length, 0);

const newer = { ...base, color: "green" as const, updatedAt: new Date(Date.now() + 1_000).toISOString() };
assert.equal(mergeLocalAnnotations([base], [newer])[0]?.color, "green");

console.log("Reader annotation tests passed.");
