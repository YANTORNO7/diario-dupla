import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-guard"
import { getNivelActual, getNivelSiguiente, getProgreso } from "@/lib/niveles"

export async function GET() {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const userId = (session.user as any).id as string

  const now = new Date()

  // Ciclo mensual igual que Estadísticas: desde el día 10 (10 actual o 10 del mes anterior si estamos en días 1-9)
  const utcDay = now.getUTCDate()
  let cycleYear = now.getUTCFullYear()
  let cycleMonth = now.getUTCMonth() + 1
  if (utcDay < 10) {
    cycleMonth -= 1
    if (cycleMonth === 0) { cycleMonth = 12; cycleYear -= 1 }
  }
  // ART 00:00 del día 10 = UTC 03:00
  const inicioCiclo = new Date(Date.UTC(cycleYear, cycleMonth - 1, 10, 3, 0, 0, 0))

  const inicioSemana = new Date(now)
  inicioSemana.setDate(now.getDate() - now.getDay())
  inicioSemana.setHours(0, 0, 0, 0)

  const [total, estesMes, estaSemana, rankingMes] = await Promise.all([
    prisma.article.count({
      where: { authorId: userId, status: "PUBLISHED" },
    }),
    prisma.article.count({
      where: {
        authorId: userId,
        status: "PUBLISHED",
        createdAt: { gte: inicioCiclo },
      },
    }),
    prisma.article.count({
      where: {
        authorId: userId,
        status: "PUBLISHED",
        publishedAt: { gte: inicioSemana },
      },
    }),
    prisma.article.groupBy({
      by: ["authorId"],
      where: {
        status: "PUBLISHED",
        createdAt: { gte: inicioCiclo },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ])

  const rankingIds = rankingMes.map((r) => r.authorId)
  const rankingUsers = await prisma.user.findMany({
    where: { id: { in: rankingIds } },
    select: { id: true, name: true },
  })

  const ranking = rankingMes.map((r) => {
    const user = rankingUsers.find((u) => u.id === r.authorId)
    const notasMes = r._count.id
    return {
      userId: r.authorId,
      name: user?.name ?? "—",
      notasMes,
      nivel: getNivelActual(notasMes),
    }
  })

  const nivelActual = getNivelActual(total)
  const nivelSiguiente = getNivelSiguiente(total)
  const progreso = getProgreso(total)

  return NextResponse.json({
    total,
    estesMes,
    estaSemana,
    nivelActual,
    nivelSiguiente,
    progreso,
    ranking,
  })
}
