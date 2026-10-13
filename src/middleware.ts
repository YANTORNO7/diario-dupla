import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

  // NextAuth v5 uses "authjs" cookie prefix instead of "next-auth"
  const isSecure = req.nextUrl.protocol === "https:"
  const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token"

  const token = await getToken({ req, secret, cookieName })

  const isLoggedIn = !!token
  const userRole = token?.role as string | undefined

  // Admin pages (except login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    if (userRole !== "ADMIN" && userRole !== "EDITOR") {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  // If already logged in and visiting login page, redirect to admin
  if (pathname === "/admin/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }

  // Protect write API routes (POST, PUT, DELETE)
  if (pathname.startsWith("/api/") && req.method !== "GET") {
    // Allow NextAuth and subscriber endpoints
    if (pathname.startsWith("/api/auth/")) return NextResponse.next()
    if (pathname.startsWith("/api/subscriber/")) return NextResponse.next()

    if (!isLoggedIn) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    if (userRole !== "ADMIN" && userRole !== "EDITOR") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
}
