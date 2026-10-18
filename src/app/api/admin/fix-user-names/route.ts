import { NextResponse } from "next/server"
import { requireAdminAPI } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"

// GET — corrige nomes de usuários e mostra estado atual
// Renomeia bartyantorno@gmail.com → "Bart Yantorno"
// Renomeia bartjyantorno@gmail.com → "Bart Yantorno"
export async function GET() {
  const auth = await requireAdminAPI()
  if (auth instanceof NextResponse) return auth

  const fixes: string[] = []

  // Corrigir conta admin (bartyantorno@gmail.com)
  const adminUser = await prisma.user.findFirst({ where: { email: "bartyantorno@gmail.com" } })
  if (adminUser && adminUser.name !== "Bart Yantorno") {
    await prisma.user.update({ where: { id: adminUser.id }, data: { name: "Bart Yantorno" } })
    fixes.push(`Admin "${adminUser.name}" (${adminUser.email}) renomeado para "Bart Yantorno"`)
  }

  // Corrigir conta colaborador (bartjyantorno@gmail.com)
  const collabUser = await prisma.user.findFirst({ where: { email: "bartjyantorno@gmail.com" } })
  if (collabUser && collabUser.name !== "Bart Yantorno") {
    await prisma.user.update({ where: { id: collabUser.id }, data: { name: "Bart Yantorno" } })
    fixes.push(`Colaborador "${collabUser.name}" (${collabUser.email}) renomeado para "Bart Yantorno"`)
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ ok: true, fixes, users })
}
