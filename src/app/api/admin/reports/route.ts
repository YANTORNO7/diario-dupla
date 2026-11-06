import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAPI } from "@/lib/auth-guard"

export async function GET() {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const reports = await prisma.collaboratorReport.findMany({
    select: {
      id: true,
      type: true,
      title: true,
      periodStart: true,
      periodEnd: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(reports)
}
