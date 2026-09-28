export const MAX_IMPORT_CHAPTERS = 200;
export const MAX_IMPORT_FILE_BYTES = 2 * 1024 * 1024;

export type ParsedImportChapter = {
  chapterNumber: string;
  title: string;
  slug: string;
  content: string;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createChapterImportSlug(chapterNumber: string, title: string) {
  const numberPart = chapterNumber.replace(".", "-");
  const titlePart = slugify(title.replace(/^ch(?:ương|uong|apter)\s+[\d.]+\s*[:–—-]?\s*/iu, ""));
  return `chuong-${numberPart}${titlePart ? `-${titlePart}` : ""}`;
}

function parseText(source: string): ParsedImportChapter[] {
  const headingPattern = /^\s*(?:#{1,6}\s*)?(?:chương|chuong|chapter)\s+(\d+(?:\.\d{1,3})?)\s*[:–—-]?\s*(.*?)\s*$/gimu;
  const headings = [...source.matchAll(headingPattern)];

  return headings.map((heading, index) => {
    const chapterNumber = heading[1];
    const rawTitle = heading[2]?.trim() ?? "";
    const title = rawTitle || `Chương ${chapterNumber}`;
    const contentStart = (heading.index ?? 0) + heading[0].length;
    const contentEnd = headings[index + 1]?.index ?? source.length;
    return {
      chapterNumber,
      title,
      slug: createChapterImportSlug(chapterNumber, title),
      content: source.slice(contentStart, contentEnd).trim(),
    };
  });
}

function parseJson(source: string): ParsedImportChapter[] {
  const parsed: unknown = JSON.parse(source);
  const rows = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" && parsed !== null && "chapters" in parsed
      ? (parsed as { chapters?: unknown }).chapters
      : null;

  if (!Array.isArray(rows)) throw new Error("JSON phải là một mảng hoặc object có thuộc tính chapters.");

  return rows.map((row, index) => {
    if (typeof row !== "object" || row === null) throw new Error(`Chương ở vị trí ${index + 1} không hợp lệ.`);
    const item = row as Record<string, unknown>;
    const chapterNumber = String(item.chapterNumber ?? item.number ?? "").trim();
    const title = String(item.title ?? `Chương ${chapterNumber}`).trim();
    return {
      chapterNumber,
      title,
      slug: String(item.slug ?? createChapterImportSlug(chapterNumber, title)).trim(),
      content: String(item.content ?? "").trim(),
    };
  });
}

export function parseChapterImport(source: string, format: "text" | "json") {
  const chapters = format === "json" ? parseJson(source) : parseText(source);
  if (chapters.length === 0) {
    throw new Error("Không tìm thấy chương. Hãy dùng tiêu đề dạng “Chương 1: Tên chương”.");
  }
  if (chapters.length > MAX_IMPORT_CHAPTERS) {
    throw new Error(`Mỗi lần chỉ được import tối đa ${MAX_IMPORT_CHAPTERS} chương.`);
  }
  return chapters;
}
