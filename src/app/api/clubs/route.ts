import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-guard"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const league = searchParams.get("league")
  const q = searchParams.get("q")

  const where: Record<string, unknown> = {}
  if (league) where.league = league
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { shortName: { contains: q, mode: "insensitive" } },
      { initials: { contains: q, mode: "insensitive" } },
    ]
  }

  const clubs = await prisma.club.findMany({
    where,
    orderBy: { name: "asc" },
  })

  return NextResponse.json(clubs)
}

export async function POST(request: NextRequest) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const body = await request.json()
  const { name, shortName, initials, primaryColor, secondaryColor, league, crestUrl } = body

  if (!name || !shortName || !initials || !league) {
    return NextResponse.json(
      { error: "Nombre, nombre corto, iniciales y liga son obligatorios" },
      { status: 400 }
    )
  }

  const club = await prisma.club.create({
    data: {
      name,
      shortName,
      initials: initials.toUpperCase().slice(0, 3),
      primaryColor: primaryColor || "#000000",
      secondaryColor: secondaryColor || "#FFFFFF",
      league,
      crestUrl: crestUrl || null,
    },
  })

  return NextResponse.json(club, { status: 201 })
}
