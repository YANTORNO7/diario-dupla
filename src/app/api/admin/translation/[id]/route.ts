/**
 * GET    /api/admin/translation/[id]  — get translation by articleId or translationId
 * PATCH  /api/admin/translation/[id]  — update fields (manual edit / status change)
 * DELETE /api/admin/translation/[id]  — delete translation
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAPI } from "@/lib/auth-guard"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params

  const translation = await prisma.articleTranslation.findFirst({
    where: { OR: [{ id }, { articleId: id }] },
  })
  if (!translation) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(translation)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params
  const data = (await req.json()) as Partial<{
    titlePt:    string
    subtitlePt: string
    bodyPt:     string
    slugPt:     string
    metaTitlePt: string
    metaDescPt:  string
    heroAltPt:   string
    status:      string
  }>

  const translation = await prisma.articleTranslation.findFirst({
    where: { OR: [{ id }, { articleId: id }] },
  })
  if (!translation) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const updated = await prisma.articleTranslation.update({
    where: { id: translation.id },
    data,
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params

  const translation = await prisma.articleTranslation.findFirst({
    where: { OR: [{ id }, { articleId: id }] },
  })
  if (!translation) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await prisma.articleTranslation.delete({ where: { id: translation.id } })
  return NextResponse.json({ deleted: true })
}
