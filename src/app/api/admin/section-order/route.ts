import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-guard"

export async function GET() {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const sections = await prisma.section.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true, order: true, showOnHomepage: true, parentId: true },
  })

  return NextResponse.json(sections)
}

// Fix section orders to correct values
export async function POST() {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const correctOrders: { slug: string; order: number; showOnHomepage?: boolean }[] = [
    { slug: "la-dupla", order: 0, showOnHomepage: true },
    { slug: "brasil", order: 1, showOnHomepage: true },
    { slug: "argentina", order: 2, showOnHomepage: true },
    { slug: "copas", order: 3, showOnHomepage: true },
    { slug: "automovilismo", order: 4, showOnHomepage: true },
  ]

  const results = []
  for (const item of correctOrders) {
    const section = await prisma.section.findUnique({ where: { slug: item.slug } })
    if (!section) { results.push({ slug: item.slug, status: "not found" }); continue }
    await prisma.section.update({
      where: { slug: item.slug },
      data: { order: item.order, showOnHomepage: item.showOnHomepage },
    })
    results.push({ slug: item.slug, name: section.name, order: item.order, status: "fixed" })
  }

  return NextResponse.json({ ok: true, results })
}
