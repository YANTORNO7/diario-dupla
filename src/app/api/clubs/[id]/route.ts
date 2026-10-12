import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-guard"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const club = await prisma.club.findUnique({ where: { id } })
  if (!club) {
    return NextResponse.json({ error: "Club no encontrado" }, { status: 404 })
  }
  return NextResponse.json(club)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params
  const body = await request.json()
  const { name, shortName, initials, primaryColor, secondaryColor, league, crestUrl } = body

  const club = await prisma.club.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(shortName && { shortName }),
      ...(initials && { initials: initials.toUpperCase().slice(0, 3) }),
      ...(primaryColor && { primaryColor }),
      ...(secondaryColor && { secondaryColor }),
      ...(league && { league }),
      ...(crestUrl !== undefined && { crestUrl: crestUrl || null }),
    },
  })

  return NextResponse.json(club)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params
  await prisma.club.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
