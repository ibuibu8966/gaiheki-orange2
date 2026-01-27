import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes - allow access
  if (
    pathname === "/" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/diagnosis" ||
    pathname === "/api/inquiries" ||
    pathname === "/api/partner/register" ||
    pathname.startsWith("/columns") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/partner-registration") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next()
  }

  // Admin routes protection
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Allow login/logout endpoints and public data endpoints
    if (
      pathname === "/api/admin/login" ||
      pathname === "/api/admin/logout" ||
      pathname === "/api/admin/columns"  // コラム一覧は公開
    ) {
      return NextResponse.next()
    }

    if (!session) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "認証が必要です" },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL("/auth/admin-login", req.url))
    }

    if (session.user?.userType !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "管理者権限が必要です" },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL("/auth/admin-login", req.url))
    }
  }

  // Partner routes protection
  if (pathname.startsWith("/partner-dashboard") || pathname.startsWith("/api/partner")) {
    // Allow login/logout/register endpoints
    if (
      pathname === "/api/partner/login" ||
      pathname === "/api/partner/logout" ||
      pathname === "/api/partner/register"
    ) {
      return NextResponse.next()
    }

    if (!session) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "認証が必要です" },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL("/auth/partner-login", req.url))
    }

    if (session.user?.userType !== "partner") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "パートナー権限が必要です" },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL("/auth/partner-login", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
