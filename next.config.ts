import type { NextConfig } from "next";

const storageEndpoint = process.env.AWS_ENDPOINT_URL_S3;
const storyCoverImagePattern = storageEndpoint
  ? new URL("/story-covers/**", storageEndpoint.endsWith("/") ? storageEndpoint : `${storageEndpoint}/`)
  : null;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    optimizePackageImports: ["lucide-react"],
  },
  compiler: {
    // Tự động loại bỏ console.log trên production để giảm bundle size, giữ lại console.error và warn
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: storyCoverImagePattern ? [storyCoverImagePattern] : [],
  },
  headers: async () => [
    {
      source: "/:all*(svg|jpg|jpeg|png|webp|ico|woff|woff2)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/truyen/:slug/:chapter",
      headers: [
        {
          key: "Cloudflare-CDN-Cache-Control",
          value: "public, max-age=3600, stale-while-revalidate=86400",
        },
        {
          key: "CDN-Cache-Control",
          value: "public, max-age=3600, stale-while-revalidate=86400",
        },
      ],
    },
  ],
};

export default nextConfig;
