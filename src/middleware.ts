import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const adminOnlyPaths = ["/admin/pendientes", "/admin/estadisticas", "/admin/usuarios", "/admin/configuracion"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

  // NextAuth v5 uses "authjs" cookie prefix instead of "next-auth"
  const isSecure = req.nextUrl.protocol === "https:"
  const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token"

  const token = await getToken({ req, secret, cookieName })

  const isLoggedIn = !!token
  const userRole = token?.role as string | undefined

  // ── /pt/* routes ───────────────────────────────────────────────────────────
  if (pathname.startsWith("/pt")) {
    const ptMode = await fetchPtMode(req)

    if (ptMode === "off") {
      return NextResponse.rewrite(new URL("/not-found", req.url))
    }

    if (ptMode === "admin") {
      // Only logged-in admins/editors can see /pt/ in admin mode
      if (!isLoggedIn || (userRole !== "ADMIN" && userRole !== "EDITOR")) {
        // Show 404, not a login redirect
        return NextResponse.rewrite(new URL("/not-found", req.url))
      }
    }

    // mode === "public": pass through
    return NextResponse.next()
  }

  // ── Admin pages (except login) ─────────────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    if (userRole !== "ADMIN" && userRole !== "EDITOR") {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    if (userRole === "EDITOR" && adminOnlyPaths.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/admin", req.url))
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

/**
 * Fetch pt_mode from the internal site-config API.
 * Uses Edge-compatible fetch with 60-second revalidation cache.
 * Falls back to "off" on any error.
 */
async function fetchPtMode(req: NextRequest): Promise<string> {
  try {
    const url = `${req.nextUrl.origin}/api/admin/site-config?key=pt_mode`
    const res = await fetch(url, {
      next: { revalidate: 60 }, // 1-minute edge cache
    })
    if (!res.ok) return "off"
    const data = (await res.json()) as { value?: string }
    return data.value ?? "off"
  } catch {
    return "off"
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*", "/pt/:path*"],
}
