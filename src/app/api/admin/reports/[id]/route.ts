import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAPI } from "@/lib/auth-guard"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params
  const report = await prisma.collaboratorReport.findUnique({ where: { id } })

  if (!report) {
    return NextResponse.json({ error: "Informe no encontrado" }, { status: 404 })
  }

  return NextResponse.json(report)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params
  await prisma.collaboratorReport.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
