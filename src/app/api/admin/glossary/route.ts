/**
 * GET  /api/admin/glossary  — list all terms
 * POST /api/admin/glossary  — create term
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAPI } from "@/lib/auth-guard"

export async function GET() {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const terms = await prisma.glossaryTerm.findMany({ orderBy: { esWord: "asc" } })
  return NextResponse.json(terms)
}

export async function POST(req: NextRequest) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { esWord, ptWord, type } = (await req.json()) as {
    esWord?: string
    ptWord?: string
    type?: string
  }

  if (!esWord?.trim() || !ptWord?.trim()) {
    return NextResponse.json({ error: "esWord y ptWord son requeridos" }, { status: 400 })
  }

  const term = await prisma.glossaryTerm.create({
    data: {
      esWord: esWord.trim(),
      ptWord: ptWord.trim(),
      type: type === "NO_TRANSLATE" ? "NO_TRANSLATE" : "GLOSSARY",
    },
  })
  return NextResponse.json(term, { status: 201 })
}
