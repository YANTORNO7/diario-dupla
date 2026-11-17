/**
 * PATCH  /api/admin/glossary/[id]  — update term
 * DELETE /api/admin/glossary/[id]  — delete term
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAPI } from "@/lib/auth-guard"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params
  const { esWord, ptWord, type } = (await req.json()) as Partial<{
    esWord: string; ptWord: string; type: string
  }>

  const term = await prisma.glossaryTerm.update({
    where: { id },
    data: {
      ...(esWord ? { esWord: esWord.trim() } : {}),
      ...(ptWord ? { ptWord: ptWord.trim() } : {}),
      ...(type   ? { type: type === "NO_TRANSLATE" ? "NO_TRANSLATE" : "GLOSSARY" } : {}),
    },
  })
  return NextResponse.json(term)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params
  await prisma.glossaryTerm.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
