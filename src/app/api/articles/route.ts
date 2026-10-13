import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-guard"
import { slugify } from "@/lib/slugify"
import { sendNewsletter } from "@/lib/newsletter"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const section = searchParams.get("section") as string | null
  const sectionId = searchParams.get("sectionId") as string | null
  const status = searchParams.get("status") as string | null
  const featured = searchParams.get("featured")
  const limit = parseInt(searchParams.get("limit") || "20")
  const cursor = searchParams.get("cursor")

  const where: Record<string, unknown> = {}
  if (section) where.section = section
  if (sectionId) where.sectionId = sectionId
  if (status) where.status = status
  if (featured === "true") where.featured = true

  const articles = await prisma.article.findMany({
    where,
    include: {
      author: { select: { id: true, name: true } },
      primarySection: { include: { parent: true } },
      secondarySections: true,
      tags: true,
    },
    orderBy: { publishedAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  let nextCursor: string | undefined
  if (articles.length > limit) {
    const nextItem = articles.pop()
    nextCursor = nextItem?.id
  }

  return NextResponse.json({ articles, nextCursor })
}

export async function POST(request: NextRequest) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const body = await request.json()
  const {
    title,
    subtitle,
    body: articleBody,
    heroImageUrl,
    heroImageAlt,
    heroCredit,
    section,
    sectionId,
    secondarySectionIds,
    status,
    featured,
    tags,
    authorName,
  } = body

  if (!title || !articleBody || (!section && !sectionId)) {
    return NextResponse.json(
      { error: "Título, cuerpo y sección son obligatorios" },
      { status: 400 }
    )
  }

  // Derive legacy section from sectionId if needed
  let legacySection = section || "ARGENTINA"
  if (sectionId && !section) {
    const sec = await prisma.section.findUnique({ where: { id: sectionId }, include: { parent: true } })
    if (sec) {
      const slug = (sec.parent?.slug || sec.slug).toUpperCase()
      legacySection = slug === "ARGENTINA" || slug === "BRASIL" ? slug : "ARGENTINA"
    }
  }

  let slug = slugify(title)
  const existing = await prisma.article.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const tagConnections = tags?.length
    ? await Promise.all(
        tags.map(async (tagName: string) => {
          const tagSlug = slugify(tagName)
          return prisma.tag.upsert({
            where: { slug: tagSlug },
            update: {},
            create: { name: tagName.trim(), slug: tagSlug },
          })
        })
      )
    : []

  const userId = (session.user as Record<string, string>).id
  if (authorName) {
    await prisma.user.update({ where: { id: userId }, data: { name: authorName } })
  }

  const article = await prisma.article.create({
    data: {
      title,
      subtitle: subtitle || null,
      slug,
      body: articleBody,
      heroImageUrl: heroImageUrl || null,
      heroImageAlt: heroImageAlt || null,
      heroCredit: heroCredit || null,
      section: legacySection,
      sectionId: sectionId || null,
      status: (status as string) || "DRAFT",
      featured: featured || false,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      authorId: userId,
      tags: { connect: tagConnections.map((t) => ({ id: t.id })) },
      ...(secondarySectionIds?.length && {
        secondarySections: { connect: secondarySectionIds.map((id: string) => ({ id })) },
      }),
    },
    include: {
      author: { select: { id: true, name: true } },
      primarySection: { include: { parent: true } },
      secondarySections: true,
      tags: true,
    },
  })

  // Disparar newsletter assincronamente se publicado
  if (status === "PUBLISHED") {
    sendNewsletter(article.id).catch(console.error)
  }

  return NextResponse.json(article, { status: 201 })
}
