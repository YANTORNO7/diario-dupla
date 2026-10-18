import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params
  const placa = await prisma.golPlaca.findUnique({
    where: { id },
    include: { club: { select: { id: true, shortName: true, crestUrl: true } } },
  })

  if (!placa) return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  return NextResponse.json(placa)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const userId = (session as any).user?.id as string
  const userRole = (session as any).user?.role as string
  const { id } = await params

  const existing = await prisma.golPlaca.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  if (userRole !== "ADMIN" && existing.userId !== userId) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })
  }

  const body = await request.json()
  const { playerName, clubId, fotoUrl, fotoPosX, fotoPosY, fotoScale, escudoUrl, fondo, franja, imageUrl, version } = body

  const placa = await prisma.golPlaca.update({
    where: { id },
    data: {
      ...(playerName && { playerName }),
      ...(clubId && { clubId }),
      ...(fotoUrl && { fotoUrl }),
      ...(fotoPosX != null && { fotoPosX }),
      ...(fotoPosY != null && { fotoPosY }),
      ...(fotoScale != null && { fotoScale }),
      ...(escudoUrl && { escudoUrl }),
      ...(fondo && { fondo }),
      ...(franja && { franja }),
      ...(imageUrl && { imageUrl }),
      ...(version != null && { version }),
    },
    include: { club: { select: { id: true, shortName: true, crestUrl: true } } },
  })

  return NextResponse.json(placa)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const userId = (session as any).user?.id as string
  const userRole = (session as any).user?.role as string
  const { id } = await params

  const existing = await prisma.golPlaca.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  if (userRole !== "ADMIN" && existing.userId !== userId) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })
  }

  await prisma.golPlaca.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
