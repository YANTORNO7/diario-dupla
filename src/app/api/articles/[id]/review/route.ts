import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAPI } from "@/lib/auth-guard"
import { parseDateInput } from "@/lib/utils"
import { sendNewsletter } from "@/lib/newsletter"
import { notifyAuthor } from "@/lib/notify-author"
import { pingGoogle } from "@/lib/ping-google"
import { getArticlePath } from "@/lib/sections"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params
  const body = await request.json()
  const { action, rejectionNote, publishedAt } = body as {
    action: "approve" | "reject"
    rejectionNote?: string
    publishedAt?: string
  }

  if (!action || (action !== "approve" && action !== "reject")) {
    return NextResponse.json(
      { error: "Acción inválida. Usar 'approve' o 'reject'" },
      { status: 400 }
    )
  }

  const existing = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { id: true, email: true, name: true } } },
  })

  if (!existing) {
    return NextResponse.json(
      { error: "Artículo no encontrado" },
      { status: 404 }
    )
  }

  if (existing.status !== "PENDING") {
    return NextResponse.json(
      { error: "Solo se pueden revisar artículos pendientes" },
      { status: 400 }
    )
  }

  if (action === "approve") {
    // Si la fecha elegida es hoy, usar la hora exacta actual para que el artículo
    // aparezca al tope de los publicados ese día (parseDateInput fija mediodía UTC).
    let resolvedPublishedAt: Date
    if (publishedAt) {
      const parsed = parseDateInput(publishedAt)
      const todayStr = new Date().toISOString().slice(0, 10)
      resolvedPublishedAt = parsed.toISOString().slice(0, 10) === todayStr ? new Date() : parsed
    } else {
      resolvedPublishedAt = existing.publishedAt ?? new Date()
    }
    const article = await prisma.article.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: resolvedPublishedAt,
        rejectionNote: null,
      },
      include: {
        author: { select: { id: true, name: true } },
        primarySection: { include: { parent: true } },
        secondarySections: true,
        tags: true,
      },
    })

    // Disparar newsletter (await para garantir envio antes de fechar a função)
    await sendNewsletter(article.id)

    // Notificar autor por email
    notifyAuthor(existing.author.email, existing.title, "approve").catch(console.error)

    // Pingar Google para indexar o artigo
    pingGoogle(getArticlePath(article)).catch(console.error)

    return NextResponse.json(article)
  }

  // action === "reject"
  const article = await prisma.article.update({
    where: { id },
    data: {
      status: "DRAFT",
      rejectionNote: rejectionNote || null,
    },
    include: {
      author: { select: { id: true, name: true } },
      primarySection: { include: { parent: true } },
      secondarySections: true,
      tags: true,
    },
  })

  // Notificar autor por email
  notifyAuthor(existing.author.email, existing.title, "reject", rejectionNote).catch(console.error)

  return NextResponse.json(article)
}
