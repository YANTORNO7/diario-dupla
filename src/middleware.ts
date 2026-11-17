import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { neon } from "@neondatabase/serverless"

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
 * Read pt_mode directly from the database via Neon HTTP (Edge-compatible).
 * Does NOT make an HTTP call to the same domain — avoids Vercel SSO blocking.
 * Falls back to "off" on any error and logs the reason.
 */
async function fetchPtMode(_req: NextRequest): Promise<string> {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error("[middleware] DATABASE_URL not set — defaulting pt_mode to 'off'")
    return "off"
  }
  try {
    const sql = neon(dbUrl)
    const rows = await sql`SELECT value FROM site_config WHERE key = 'pt_mode' LIMIT 1`
    const value = (rows[0] as { value?: string } | undefined)?.value ?? "off"
    return value
  } catch (err) {
    console.error("[middleware] Failed to read pt_mode from DB:", err)
    return "off"
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*", "/pt/:path*"],
}
