import { NextRequest, NextResponse } from "next/server"
import { generateAndSaveReport, getPreviousMondayUTC, getWeekBounds } from "@/lib/reports"

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const monday = getPreviousMondayUTC()
  const { start, end } = getWeekBounds(monday)
  const result = await generateAndSaveReport("weekly", start, end)
  return NextResponse.json({ ok: true, ...result })
}
