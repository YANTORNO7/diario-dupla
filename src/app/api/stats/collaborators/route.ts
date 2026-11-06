import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAPI } from "@/lib/auth-guard"

export async function GET() {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      createdAt: { gte: twelveMonthsAgo },
    },
    select: {
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Ciclo del 10 al 9: artículos del día 1-9 cuentan en el mes anterior
  // Ej: Nov 1-9 → "Octubre", Nov 10+ → "Noviembre"
  function getPeriodKey(date: Date): string {
    const day = date.getUTCDate()
    let year = date.getUTCFullYear()
    let month = date.getUTCMonth() + 1
    if (day < 10) {
      month -= 1
      if (month === 0) { month = 12; year -= 1 }
    }
    return `${year}-${String(month).padStart(2, "0")}`
  }

  // Período actual (el ciclo en curso)
  const now = new Date()
  let currentYear = now.getUTCFullYear()
  let currentMonth = now.getUTCMonth() + 1
  if (now.getUTCDate() < 10) {
    currentMonth -= 1
    if (currentMonth === 0) { currentMonth = 12; currentYear -= 1 }
  }

  // Agrupar por autor + período (createdAt, inmutable)
  const statsMap: Record<string, Record<string, number>> = {}
  const authorsMap: Record<string, string> = {}

  for (const article of articles) {
    const authorId = article.author.id
    const period = getPeriodKey(article.createdAt)

    authorsMap[authorId] = article.author.name

    if (!statsMap[authorId]) statsMap[authorId] = {}
    statsMap[authorId][period] = (statsMap[authorId][period] || 0) + 1
  }

  const stats = Object.entries(statsMap).map(([authorId, months]) => ({
    authorId,
    authorName: authorsMap[authorId],
    months,
    total: Object.values(months).reduce((a, b) => a + b, 0),
  }))

  // Ordenar por total descendente
  stats.sort((a, b) => b.total - a.total)

  // Últimos 6 períodos (del 10 al 9) hasta el período actual
  const monthLabels: string[] = []
  for (let i = 5; i >= 0; i--) {
    let y = currentYear
    let m = currentMonth - i
    while (m <= 0) { m += 12; y -= 1 }
    monthLabels.push(`${y}-${String(m).padStart(2, "0")}`)
  }

  return NextResponse.json({ stats, monthLabels })
}
