import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const sections = await prisma.section.findMany({
    include: { parent: true, children: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  })

  return NextResponse.json(sections)
}
