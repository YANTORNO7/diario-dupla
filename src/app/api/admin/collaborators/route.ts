import { NextRequest, NextResponse } from "next/server"
import { requireAdminAPI } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const DEFAULT_PASSWORD = "trescinco35"

export async function POST(req: NextRequest) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { email, name } = await req.json()
  if (!email || !name) {
    return NextResponse.json({ error: "Email y nombre requeridos" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 })
  }

  // Derive username from email prefix, dedup if needed
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
  let username = base
  let suffix = 1
  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${base}${suffix++}`
  }

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  const user = await prisma.user.create({
    data: { email, name, username, password: hash, role: "EDITOR", active: true },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      active: true,
      createdAt: true,
      _count: { select: { articles: true } },
    },
  })

  return NextResponse.json({ user, temporaryPassword: DEFAULT_PASSWORD })
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { userId, active } = await req.json()
  if (!userId || typeof active !== "boolean") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }
  if (target.role === "ADMIN") {
    return NextResponse.json({ error: "No se puede desactivar al admin" }, { status: 403 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { active },
    select: { id: true, active: true },
  })

  return NextResponse.json({ user })
}
