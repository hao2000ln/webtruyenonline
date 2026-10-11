import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseImagePattern = supabaseUrl ? new URL("/storage/v1/object/public/story-covers/**", supabaseUrl) : null;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: supabaseImagePattern ? [supabaseImagePattern] : [],
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
