/**
 * Batch translate all published articles without translations.
 * Run: DATABASE_URL="..." DEEPL_API_KEY="..." npx tsx scripts/batch-translate-all.ts
 */
import { PrismaClient } from "@prisma/client"
import { translateArticle } from "@/lib/deepl-translator"

const prisma = new PrismaClient()

async function run() {
  let totalTranslated = 0
  let totalReview = 0
  let batch = 0

  while (true) {
    batch++
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED", translation: null },
      select: { id: true, title: true, subtitle: true, body: true, heroImageAlt: true },
      orderBy: { publishedAt: "desc" },
      take: 10,
    })

    if (articles.length === 0) {
      console.log(`\n✅ Concluído! ${totalTranslated} traduzidos (${totalReview} para revisão)`)
      break
    }

    console.log(`\nLote ${batch}: ${articles.length} artigos`)
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
        totalTranslated++
        if (result.status === "REVIEW") totalReview++
        process.stdout.write(result.status === "REVIEW" ? "R" : ".")
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`\n  ✗ ${article.id}: ${msg}`)
        if (msg.includes("Limite do período DeepL")) {
          console.log("\n⚠ Limite DeepL atingido — parando.")
          await prisma.$disconnect()
          process.exit(0)
        }
      }
    }
  }
  await prisma.$disconnect()
}

run().catch(async (e) => { console.error(e); await prisma.$disconnect() })
