import { NextRequest, NextResponse } from "next/server"
import { requireAdminAPI } from "@/lib/auth-guard"
import {
  generateAndSaveReport,
  getPreviousMondayUTC,
  getPreviousMonth,
  getWeekBounds,
  getMonthBounds,
} from "@/lib/reports"

export async function POST(request: NextRequest) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const body = await request.json()
  const { type, periodStart, periodEnd } = body as {
    type: "weekly" | "monthly"
    periodStart?: string
    periodEnd?: string
  }

  if (type !== "weekly" && type !== "monthly") {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  }

  let start: Date
  let end: Date

  if (periodStart && periodEnd) {
    start = new Date(periodStart)
    end = new Date(periodEnd)
  } else if (type === "weekly") {
    const monday = getPreviousMondayUTC()
    const bounds = getWeekBounds(monday)
    start = bounds.start
    end = bounds.end
  } else {
    const { year, month } = getPreviousMonth()
    const bounds = getMonthBounds(year, month)
    start = bounds.start
    end = bounds.end
  }

  const result = await generateAndSaveReport(type, start, end)
  return NextResponse.json(result)
}
