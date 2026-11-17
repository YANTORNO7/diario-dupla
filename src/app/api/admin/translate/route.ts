/**
 * POST /api/admin/translate
 *
 * Translates one article to PT and saves/updates the ArticleTranslation.
 * Body: { articleId: string; force?: boolean }
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAPI } from "@/lib/auth-guard"
import { translateArticle } from "@/lib/deepl-translator"

export async function POST(req: NextRequest) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { articleId, force } = (await req.json()) as { articleId?: string; force?: boolean }
  if (!articleId) {
    return NextResponse.json({ error: "articleId requerido" }, { status: 400 })
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      title: true,
      subtitle: true,
      body: true,
      heroImageAlt: true,
      translation: { select: { id: true, slugPt: true } },
    },
  })
  if (!article) {
    return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 })
  }

  // Skip if already translated (unless force=true)
  if (article.translation && !force) {
    return NextResponse.json({ skipped: true, existing: article.translation })
  }

  try {
    const result = await translateArticle({
      title:     article.title,
      subtitle:  article.subtitle,
      body:      article.body,
      heroAlt:   article.heroImageAlt,
      metaTitle: article.title, // default: same as title
      metaDesc:  article.subtitle,
    })

    const translation = await prisma.articleTranslation.upsert({
      where: { articleId },
      update: {
        titlePt:     result.titlePt,
        subtitlePt:  result.subtitlePt,
        bodyPt:      result.bodyPt,
        slugPt:      result.slugPt,
        heroAltPt:   result.heroAltPt,
        metaTitlePt: result.metaTitlePt,
        metaDescPt:  result.metaDescPt,
        status:      result.status,
        translatedAt: new Date(),
      },
      create: {
        articleId,
        titlePt:     result.titlePt,
        subtitlePt:  result.subtitlePt,
        bodyPt:      result.bodyPt,
        slugPt:      result.slugPt,
        heroAltPt:   result.heroAltPt,
        metaTitlePt: result.metaTitlePt,
        metaDescPt:  result.metaDescPt,
        status:      result.status,
      },
    })

    return NextResponse.json({ translation, charsUsed: result.charsUsed })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
