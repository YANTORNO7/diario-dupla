import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAPI } from "@/lib/auth-guard"

export async function DELETE(req: Request) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 })
  }

  await prisma.subscriber.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 })
  }

  await prisma.subscriber.update({
    where: { id },
    data: { emailVerified: true, verificationToken: null },
  })

  return NextResponse.json({ ok: true })
}
