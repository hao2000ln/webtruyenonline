const compactNumberFormatter = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatCompactNumber(value: number) {
  return compactNumberFormatter.format(value);
}

export function formatDate(value: Date | string | number | null | undefined) {
  if (!value) return "Chưa cập nhật";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return dateFormatter.format(date);
}

export function getStoryStatusLabel(status: "ONGOING" | "COMPLETED" | "HIATUS") {
  return {
    ONGOING: "Đang ra",
    COMPLETED: "Hoàn thành",
    HIATUS: "Tạm dừng",
  }[status];
}

export function getStoryStatusColor(status: "ONGOING" | "COMPLETED" | "HIATUS") {
  return {
    ONGOING: "text-blue-600",
    COMPLETED: "text-emerald-600",
    HIATUS: "text-amber-600",
  }[status];
}

export function formatChapterNumber(value: string) {
  const [integer, decimal = ""] = value.split(".");
  const trimmedDecimal = decimal.replace(/0+$/, "");
  return trimmedDecimal ? `${integer}.${trimmedDecimal}` : integer;
}

export function formatReadingTime(wordCount: number) {
  if (!wordCount || wordCount <= 0) return "< 1 phút đọc";
  const minutes = Math.ceil(wordCount / 220);
  return `${minutes} phút đọc`;
}

