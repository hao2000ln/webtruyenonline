import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Đọc Truyện Chữ",
    template: "%s | Đọc Truyện Chữ",
  },
  description: "Đọc truyện chữ online, cập nhật chương mới.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
