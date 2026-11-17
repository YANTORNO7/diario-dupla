/**
 * GET  /api/admin/site-config          — returns pt_mode only (public)
 * GET  /api/admin/site-config?key=...  — returns any key (admin only)
 * POST /api/admin/site-config          — sets any key (admin only)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAPI } from "@/lib/auth-guard"

const PUBLIC_KEYS = new Set(["pt_mode"])

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")

  // No key: return pt_mode publicly
  if (!key) {
    const rec = await prisma.siteConfig.findUnique({ where: { key: "pt_mode" } })
    return NextResponse.json({ value: rec?.value ?? "off" })
  }

  // Public key: no auth needed
  if (PUBLIC_KEYS.has(key)) {
    const rec = await prisma.siteConfig.findUnique({ where: { key } })
    return NextResponse.json({ value: rec?.value ?? null })
  }

  // Any other key: admin only
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const rec = await prisma.siteConfig.findUnique({ where: { key } })
  return NextResponse.json({ value: rec?.value ?? null })
}

export async function POST(req: NextRequest) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { key, value } = (await req.json()) as { key?: string; value?: string }
  if (!key || value === undefined) {
    return NextResponse.json({ error: "key y value son requeridos" }, { status: 400 })
  }

  const rec = await prisma.siteConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
  return NextResponse.json({ key: rec.key, value: rec.value })
}
