import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-guard"

export async function GET() {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const escudos = await prisma.sharedEscudo.findMany({
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(escudos)
}

export async function POST(request: NextRequest) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const { name, url } = await request.json()
  if (!name || !url) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }

  const escudo = await prisma.sharedEscudo.create({
    data: { name, url },
  })
  return NextResponse.json(escudo, { status: 201 })
}
