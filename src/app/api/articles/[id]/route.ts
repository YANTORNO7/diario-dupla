import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-guard"
import { slugify } from "@/lib/slugify"
import { sendNewsletter } from "@/lib/newsletter"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      primarySection: { include: { parent: true } },
      secondarySections: true,
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
  const userId = (session.user as Record<string, string>).id
  const userRole = (session.user as Record<string, string>).role
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

  const existing = await prisma.article.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json(
      { error: "Artículo no encontrado" },
      { status: 404 }
    )
  }

  // EDITOR só pode editar artigos próprios
  if (userRole === "EDITOR" && existing.authorId !== userId) {
    return NextResponse.json(
      { error: "Sin permisos para editar este artículo" },
      { status: 403 }
    )
  }

  // EDITOR não pode mudar status de PENDING para outro valor (exceto via conteúdo)
  // EDITOR não pode publicar direto — converte para PENDING
  let finalStatus = status as string | undefined
  if (userRole === "EDITOR" && finalStatus !== undefined) {
    if (existing.status === "PENDING" && finalStatus !== "PENDING") {
      // EDITOR não pode mudar status de artigo PENDING
      finalStatus = undefined // ignora a mudança de status
    } else if (finalStatus === "PUBLISHED") {
      finalStatus = "PENDING"
    }
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

  if (authorName) {
    await prisma.user.update({ where: { id: existing.authorId }, data: { name: authorName } })
  }

  const resolvedStatus = finalStatus ?? existing.status
  const wasPublished = existing.status === "PUBLISHED"
  const isPublishing = resolvedStatus === "PUBLISHED" && !wasPublished

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
      ...(sectionId !== undefined && { sectionId }),
      ...(finalStatus !== undefined && { status: finalStatus }),
      ...(featured !== undefined && { featured }),
      ...(isPublishing && { publishedAt: new Date() }),
      ...(resolvedStatus === "DRAFT" && wasPublished && { publishedAt: null }),
      // Limpar rejectionNote quando vai para PENDING
      ...(resolvedStatus === "PENDING" && { rejectionNote: null }),
      ...(tagConnections && {
        tags: { set: tagConnections.map((t) => ({ id: t.id })) },
      }),
      ...(secondarySectionIds !== undefined && {
        secondarySections: { set: secondarySectionIds.map((id: string) => ({ id })) },
      }),
    },
    include: {
      author: { select: { id: true, name: true } },
      primarySection: { include: { parent: true } },
      secondarySections: true,
      tags: true,
    },
  })

  // Disparar newsletter assincronamente só se realmente publicado
  if (isPublishing) {
    sendNewsletter(article.id).catch(console.error)
  }

  return NextResponse.json(article)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params
  const userId = (session.user as Record<string, string>).id
  const userRole = (session.user as Record<string, string>).role

  const existing = await prisma.article.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json(
      { error: "Artículo no encontrado" },
      { status: 404 }
    )
  }

  // EDITOR só pode deletar artigos próprios
  if (userRole === "EDITOR" && existing.authorId !== userId) {
    return NextResponse.json(
      { error: "Sin permisos para eliminar este artículo" },
      { status: 403 }
    )
  }

  await prisma.article.delete({ where: { id } })

  return NextResponse.json({ message: "Artículo eliminado" })
}
