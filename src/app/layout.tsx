import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
  // Preload the most common weights only — body (400) and headings (700)
  weight: ["400", "500", "600", "700", "800"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mocthu.vn";
const SITE_NAME = "Mộc Thư";
const DEFAULT_DESCRIPTION =
  "Mộc Thư — đọc truyện chữ online tiếng Việt miễn phí. Cập nhật chương mới liên tục, giao diện sạch, tốc độ nhanh.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ["đọc truyện online", "truyện chữ", "tiểu thuyết online", "mộc thư", "light novel"],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Canonical mặc định — mỗi trang sẽ override bằng alternates.canonical riêng
  alternates: {
    canonical: "/",
  },
  // Open Graph mặc định cho toàn site
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: APP_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Đọc truyện online`,
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-default.png"],
  },
  // Robots mặc định — cho phép index toàn site
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
