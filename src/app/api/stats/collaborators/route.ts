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
      publishedAt: { gte: twelveMonthsAgo },
    },
    select: {
      publishedAt: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: { publishedAt: "desc" },
  })

  // Agrupar por autor + mês
  const statsMap: Record<string, Record<string, number>> = {}
  const authorsMap: Record<string, string> = {}

  for (const article of articles) {
    if (!article.publishedAt) continue
    const authorId = article.author.id
    const month = `${article.publishedAt.getFullYear()}-${String(article.publishedAt.getMonth() + 1).padStart(2, "0")}`

    authorsMap[authorId] = article.author.name

    if (!statsMap[authorId]) statsMap[authorId] = {}
    statsMap[authorId][month] = (statsMap[authorId][month] || 0) + 1
  }

  const stats = Object.entries(statsMap).map(([authorId, months]) => ({
    authorId,
    authorName: authorsMap[authorId],
    months,
    total: Object.values(months).reduce((a, b) => a + b, 0),
  }))

  // Ordenar por total descendente
  stats.sort((a, b) => b.total - a.total)

  // Gerar lista dos últimos 6 meses
  const monthLabels: string[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthLabels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }

  return NextResponse.json({ stats, monthLabels })
}
