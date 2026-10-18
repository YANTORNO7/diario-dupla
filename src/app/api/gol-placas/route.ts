import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const { searchParams } = new URL(request.url)
  const clubId = searchParams.get("clubId")
  const playerName = searchParams.get("playerName")

  const where: Record<string, unknown> = {}
  if (clubId) where.clubId = clubId
  if (playerName) where.playerName = { equals: playerName, mode: "insensitive" }

  const placas = await prisma.golPlaca.findMany({
    where,
    include: { club: { select: { id: true, shortName: true, crestUrl: true } } },
    orderBy: { playerName: "asc" },
  })

  return NextResponse.json(placas)
}

export async function POST(request: NextRequest) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const userId = (session as any).user?.id as string
  const body = await request.json()

  const { playerName, clubId, fotoUrl, fotoPosX, fotoPosY, fotoScale, escudoUrl, fondo, franja, imageUrl, version } = body

  if (!playerName || !clubId || !fotoUrl || !escudoUrl || !imageUrl) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
  }

  const placa = await prisma.golPlaca.create({
    data: {
      playerName,
      clubId,
      userId,
      fotoUrl,
      fotoPosX: fotoPosX ?? 50,
      fotoPosY: fotoPosY ?? 50,
      fotoScale: fotoScale ?? 1,
      escudoUrl,
      fondo: fondo ?? "azul",
      franja: franja ?? "4",
      imageUrl,
      version: version ?? 1,
    },
    include: { club: { select: { id: true, shortName: true, crestUrl: true } } },
  })

  return NextResponse.json(placa, { status: 201 })
}
