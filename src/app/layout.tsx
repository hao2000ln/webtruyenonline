import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const inter = localFont({
  src: [
    {
      path: "../fonts/Inter/Inter-VariableFont_opsz,wght.ttf",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "../fonts/Inter/Inter-Italic-VariableFont_opsz,wght.ttf",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Mộc Thư",
    template: "%s | Mộc Thư",
  },
  description: "Mộc Thư online, cập nhật chương mới.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={inter.variable}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
