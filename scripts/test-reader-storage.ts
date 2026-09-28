import assert from "node:assert/strict";
import {
  clearGuestHistory,
  DEFAULT_READER_SETTINGS,
  readGuestHistory,
  readReaderSettings,
  removeGuestHistory,
  saveGuestHistory,
  writeReaderSettings,
  type GuestHistoryRecord,
} from "../src/lib/reader-storage";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

function historyRecord(storySlug: string, chapterNumber: string): GuestHistoryRecord {
  return {
    storySlug,
    storyTitle: `Truyện ${storySlug}`,
    chapterNumber,
    chapterTitle: `Chương ${chapterNumber}`,
    href: `/truyen/${storySlug}/chuong-${chapterNumber}`,
    readAt: new Date(2026, 8, Number(chapterNumber)).toISOString(),
  };
}

const storage = new MemoryStorage();

assert.deepEqual(readReaderSettings(storage), DEFAULT_READER_SETTINGS);
const customSettings = {
  fontSize: 24,
  lineHeight: 2.1,
  contentWidth: 880,
  theme: "dark" as const,
  fontFamily: "serif" as const,
  textAlign: "justify" as const,
};
writeReaderSettings(customSettings, storage);
assert.deepEqual(readReaderSettings(storage), customSettings);

saveGuestHistory(historyRecord("truyen-a", "1"), storage);
saveGuestHistory(historyRecord("truyen-a", "2"), storage);
let history = readGuestHistory(storage);
assert.equal(history.length, 1, "Mỗi truyện chỉ giữ một record");
assert.equal(history[0].chapterNumber, "2", "Record phải trỏ tới chương đọc gần nhất");

saveGuestHistory(historyRecord("truyen-b", "1"), storage);
history = readGuestHistory(storage);
assert.equal(history.length, 2);
assert.equal(history[0].storySlug, "truyen-b", "Truyện vừa đọc phải đứng đầu");

removeGuestHistory("truyen-a", storage);
assert.deepEqual(readGuestHistory(storage).map((item) => item.storySlug), ["truyen-b"]);

clearGuestHistory(storage);
assert.deepEqual(readGuestHistory(storage), []);

console.log("Reader storage tests passed");
