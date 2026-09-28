import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser } from "@/lib/auth/roles";

function redirectWithSession(request: NextRequest, response: NextResponse, pathname: string) {
  const redirectResponse = NextResponse.redirect(new URL(pathname, request.url));
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  redirectResponse.headers.set("Cache-Control", "private, no-store");
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLogin = pathname === "/admin/login";

  if (isAdminLogin) {
    if (isAdminUser(user)) {
      return redirectWithSession(request, response, "/admin");
    }

    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  if (isAdminRoute) {
    if (!user) {
      return redirectWithSession(request, response, "/admin/login");
    }

    if (!isAdminUser(user)) {
      return redirectWithSession(request, response, "/");
    }
  }

  const isUserAuthPage = pathname === "/dang-nhap" || pathname === "/dang-ky";
  if (isUserAuthPage && user) {
    return redirectWithSession(request, response, "/tai-khoan");
  }

  const isProtectedUserRoute = pathname === "/tai-khoan" || pathname === "/theo-doi";
  if (isProtectedUserRoute && !user) {
    const loginUrl = new URL("/dang-nhap", request.url);
    loginUrl.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    redirectResponse.headers.set("Cache-Control", "private, no-store");
    return redirectResponse;
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
