import sanitizeHtml from "sanitize-html";

const chapterContentOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "blockquote",
    "ol",
    "ul",
    "li",
    "h2",
    "h3",
    "a",
    "code",
    "pre",
  ],
  allowedAttributes: {
    a: ["href"],
    li: ["data-list"],
    p: ["style"],
    span: ["style"],
  },
  allowedStyles: {
    '*': {
      'line-height': [/^1(?:\.\d+)?$/, /^2(?:\.\d+)?$/, /^3(?:\.\d+)?$/],
      'color': [/^.*$/],
      'background-color': [/^.*$/],
    }
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
};

export function sanitizeChapterContent(content: string) {
  return sanitizeHtml(content, chapterContentOptions).trim();
}

export function countChapterWords(content: string) {
  const sanitized = sanitizeChapterContent(content);
  const plainText = sanitizeHtml(sanitized, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&nbsp;|&#160;/giu, " ")
    .replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/giu, " ");

  return plainText.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}
