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
};

export default nextConfig;
