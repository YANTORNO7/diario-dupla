import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAPI } from "@/lib/auth-guard"

export async function GET() {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  // Últimas 8 semanas
  const eightWeeksAgo = new Date()
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 8 * 7)

  const subscribers = await prisma.subscriber.findMany({
    where: { createdAt: { gte: eightWeeksAgo } },
    select: { createdAt: true, signupSource: true },
    orderBy: { createdAt: "asc" },
  })

  // Agrupar por semana (início da semana = segunda-feira)
  const weekMap: Record<string, { email: number; google: number; popup_email: number; popup_google: number }> = {}

  for (const sub of subscribers) {
    const d = new Date(sub.createdAt)
    // Ajustar para início da semana (segunda)
    const day = d.getDay() // 0=domingo, 1=segunda...
    const diff = (day === 0 ? -6 : 1 - day)
    const monday = new Date(d)
    monday.setDate(d.getDate() + diff)
    const weekKey = monday.toISOString().slice(0, 10)

    if (!weekMap[weekKey]) {
      weekMap[weekKey] = { email: 0, google: 0, popup_email: 0, popup_google: 0 }
    }

    const src = sub.signupSource
    if (src === "email") weekMap[weekKey].email++
    else if (src === "google") weekMap[weekKey].google++
    else if (src === "popup-email") weekMap[weekKey].popup_email++
    else if (src === "popup-google") weekMap[weekKey].popup_google++
    else weekMap[weekKey].email++ // fallback
  }

  const result = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, counts]) => ({ week, ...counts }))

  return NextResponse.json(result)
}
