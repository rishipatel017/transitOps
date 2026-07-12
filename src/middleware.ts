import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth
  const userRole = req.auth?.user?.role

  const publicPaths = ["/login", "/api/auth"]
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isAuthenticated && isPublicPath && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Role-based access control
  const protectedPaths = {
    "/vehicles": ["FLEET_MANAGER", "ADMIN"],
    "/drivers": ["FLEET_MANAGER", "ADMIN", "DISPATCHER"],
    "/trips": ["FLEET_MANAGER", "ADMIN", "DISPATCHER"],
    "/maintenance": ["FLEET_MANAGER", "ADMIN", "SAFETY_OFFICER"],
    "/fuel": ["FLEET_MANAGER", "ADMIN"],
    "/expenses": ["FLEET_MANAGER", "ADMIN", "FINANCIAL_ANALYST"],
    "/analytics": ["FLEET_MANAGER", "ADMIN", "FINANCIAL_ANALYST"],
  }

  for (const [path, allowedRoles] of Object.entries(protectedPaths)) {
    if (pathname.startsWith(path) && userRole && !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api/_next/static|_next/image|favicon.ico).*)"],
}
