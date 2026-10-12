import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-guard"
import { slugify } from "@/lib/slugify"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const section = searchParams.get("section") as string | null
  const status = searchParams.get("status") as string | null
  const featured = searchParams.get("featured")
  const limit = parseInt(searchParams.get("limit") || "20")
  const cursor = searchParams.get("cursor")

  const where: Record<string, unknown> = {}
  if (section) where.section = section
  if (status) where.status = status
  if (featured === "true") where.featured = true

  const articles = await prisma.article.findMany({
    where,
    include: {
      author: { select: { id: true, name: true } },
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
    status,
    featured,
    tags,
  } = body

  if (!title || !articleBody || !section) {
    return NextResponse.json(
      { error: "Título, cuerpo y sección son obligatorios" },
      { status: 400 }
    )
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

  const article = await prisma.article.create({
    data: {
      title,
      subtitle: subtitle || null,
      slug,
      body: articleBody,
      heroImageUrl: heroImageUrl || null,
      heroImageAlt: heroImageAlt || null,
      heroCredit: heroCredit || null,
      section: section as string,
      status: (status as string) || "DRAFT",
      featured: featured || false,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      authorId: (session.user as Record<string, string>).id,
      tags: { connect: tagConnections.map((t) => ({ id: t.id })) },
    },
    include: {
      author: { select: { id: true, name: true } },
      tags: true,
    },
  })

  return NextResponse.json(article, { status: 201 })
}
