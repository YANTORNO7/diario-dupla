import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-guard"
import { slugify } from "@/lib/slugify"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      tags: true,
    },
  })

  if (!article) {
    return NextResponse.json(
      { error: "Artículo no encontrado" },
      { status: 404 }
    )
  }

  return NextResponse.json(article)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params
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

  const existing = await prisma.article.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json(
      { error: "Artículo no encontrado" },
      { status: 404 }
    )
  }

  let slug = existing.slug
  if (title && title !== existing.title) {
    slug = slugify(title)
    const slugExists = await prisma.article.findFirst({
      where: { slug, id: { not: id } },
    })
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`
    }
  }

  let tagConnections
  if (tags) {
    tagConnections = await Promise.all(
      tags.map(async (tagName: string) => {
        const tagSlug = slugify(tagName)
        return prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName.trim(), slug: tagSlug },
        })
      })
    )
  }

  const wasPublished = existing.status === "PUBLISHED"
  const isPublishing = status === "PUBLISHED" && !wasPublished

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle: subtitle || null }),
      slug,
      ...(articleBody !== undefined && { body: articleBody }),
      ...(heroImageUrl !== undefined && { heroImageUrl: heroImageUrl || null }),
      ...(heroImageAlt !== undefined && { heroImageAlt: heroImageAlt || null }),
      ...(heroCredit !== undefined && { heroCredit: heroCredit || null }),
      ...(section !== undefined && { section: section as string }),
      ...(status !== undefined && { status: status as string }),
      ...(featured !== undefined && { featured }),
      ...(isPublishing && { publishedAt: new Date() }),
      ...(status === "DRAFT" && wasPublished && { publishedAt: null }),
      ...(tagConnections && {
        tags: { set: tagConnections.map((t) => ({ id: t.id })) },
      }),
    },
    include: {
      author: { select: { id: true, name: true } },
      tags: true,
    },
  })

  return NextResponse.json(article)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params

  const existing = await prisma.article.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json(
      { error: "Artículo no encontrado" },
      { status: 404 }
    )
  }

  await prisma.article.delete({ where: { id } })

  return NextResponse.json({ message: "Artículo eliminado" })
}
