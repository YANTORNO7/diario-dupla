/**
 * POST /api/admin/translate/batch
 *
 * Translates up to 10 published articles that have no translation yet.
 * Returns { translated: number; skipped: number; errors: string[] }
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAPI } from "@/lib/auth-guard"
import { translateArticle } from "@/lib/deepl-translator"

export async function POST() {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      translation: null,
    },
    select: {
      id: true,
      title: true,
      subtitle: true,
      body: true,
      heroImageAlt: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 10,
  })

  let translated = 0
  let skipped    = 0
  const errors: string[] = []

  for (const article of articles) {
    try {
      const result = await translateArticle({
        title:     article.title,
        subtitle:  article.subtitle,
        body:      article.body,
        heroAlt:   article.heroImageAlt,
        metaTitle: article.title,
        metaDesc:  article.subtitle,
      })

      await prisma.articleTranslation.create({
        data: {
          articleId:   article.id,
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
      translated++
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido"
      errors.push(`${article.id}: ${msg}`)
      // Stop on quota error
      if (msg.includes("Limite do período DeepL")) break
    }
  }

  return NextResponse.json({ translated, skipped, errors })
}
