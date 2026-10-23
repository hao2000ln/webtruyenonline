import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

const adminAuthMiddleware = auth.middleware({ loginUrl: "/admin/login" });
const userAuthMiddleware = auth.middleware({ loginUrl: "/dang-nhap" });

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Trang đăng nhập admin không cần middleware chặn
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Tuyến quản trị viên
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return adminAuthMiddleware(request);
  }

  // Tuyến độc giả cần đăng nhập (/tai-khoan, /theo-doi)
  return userAuthMiddleware(request);
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/tai-khoan",
    "/theo-doi",
    "/ghi-chu",
  ],
};
