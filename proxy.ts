import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseSessionCookieValue, SESSION_COOKIE_NAME } from "@/server/auth/session";

const authRoutes = new Set(["/login", "/register", "/forgot-password", "/reset-password"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const payload = parseSessionCookieValue(request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null);

  if (pathname.startsWith("/admin")) {
    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/profile")) {
    if (!payload || payload.role !== "user") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (authRoutes.has(pathname) && payload) {
    return NextResponse.redirect(new URL(payload.role === "admin" ? "/admin" : "/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/login", "/register", "/forgot-password", "/reset-password"],
};