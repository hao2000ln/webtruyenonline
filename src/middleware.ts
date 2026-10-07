import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dang-nhap",
    "/dang-ky",
    "/tai-khoan",
    "/theo-doi",
  ],
};
