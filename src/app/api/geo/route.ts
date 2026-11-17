/**
 * GET /api/geo
 *
 * Returns the visitor's country and the current pt_mode.
 * Used by client components (BrazilBanner, LangToggle) without blocking ISR.
 *
 * Cache: private, 5 minutes (per-user; CDN must not cache this).
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // Country from Vercel or Cloudflare headers
  const country =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    null

  const rec = await prisma.siteConfig.findUnique({ where: { key: "pt_mode" } })
  const ptMode = rec?.value ?? "off"

  return NextResponse.json(
    { country, ptMode },
    {
      headers: {
        "Cache-Control": "private, max-age=300", // 5 min, per-browser only
      },
    }
  )
}
