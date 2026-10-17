import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-guard"

// Endpoint temporário para remover La Dupla como seção secundária indevida
export async function POST() {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const laDupla = await prisma.section.findFirst({ where: { slug: "la-dupla" } })
  if (!laDupla) return NextResponse.json({ error: "La Dupla não encontrada" }, { status: 404 })

  // Artigos que têm La Dupla como secundária mas NÃO como primária
  const articles = await prisma.article.findMany({
    where: {
      secondarySections: { some: { id: laDupla.id } },
      NOT: { sectionId: laDupla.id },
    },
    select: { id: true, title: true },
  })

  for (const article of articles) {
    await prisma.article.update({
      where: { id: article.id },
      data: { secondarySections: { disconnect: { id: laDupla.id } } },
    })
  }

  return NextResponse.json({
    fixed: articles.length,
    articles: articles.map((a) => a.title),
  })
}
