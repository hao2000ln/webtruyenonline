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

export function formatDate(value: Date | null) {
  return value ? dateFormatter.format(value) : "Chưa cập nhật";
}

export function getStoryStatusLabel(status: "ONGOING" | "COMPLETED" | "HIATUS") {
  return {
    ONGOING: "Đang ra",
    COMPLETED: "Hoàn thành",
    HIATUS: "Tạm dừng",
  }[status];
}

export function formatChapterNumber(value: string) {
  const [integer, decimal = ""] = value.split(".");
  const trimmedDecimal = decimal.replace(/0+$/, "");
  return trimmedDecimal ? `${integer}.${trimmedDecimal}` : integer;
}
