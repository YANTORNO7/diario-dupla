export {}
/**
 * Traduz artigo real via DeepL e mostra ES vs PT
 * Run: DATABASE_URL="..." DEEPL_API_KEY="..." npx tsx scripts/translate-test-article.ts
 */
import { PrismaClient } from "@prisma/client"
import { translateArticle } from "@/lib/deepl-translator"

const prisma = new PrismaClient()

async function run() {
  // Buscar o artigo mais recente publicado
  const article = await prisma.article.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      subtitle: true,
      slug: true,
      body: true,
    }
  })
  if (!article) { console.log("Nenhum artigo encontrado"); return }

  console.log("═".repeat(70))
  console.log("ARTIGO EM ESPANHOL")
  console.log("═".repeat(70))
  console.log("\nTítulo ES:")
  console.log(article.title)
  console.log("\nBajada ES:")
  console.log(article.subtitle ?? "(sem bajada)")
  console.log("\nBody ES (primeiros 2 parágrafos):")
  const esParagraphs = article.body.match(/<p>.*?<\/p>/gs) ?? []
  console.log(esParagraphs.slice(0, 2).join("\n"))

  console.log("\n" + "═".repeat(70))
  console.log("TRADUZINDO VIA DEEPL...")
  console.log("═".repeat(70))

  const result = await translateArticle({
    articleId: article.id,
    title: article.title,
    subtitle: article.subtitle ?? undefined,
    body: article.body,
    slug: article.slug,
  })

  console.log("\n" + "═".repeat(70))
  console.log("ARTIGO EM PORTUGUÊS (PT-BR)")
  console.log("═".repeat(70))
  console.log("\nTítulo PT:")
  console.log(result.titlePt)
  console.log("\nBajada PT:")
  console.log(result.subtitlePt ?? "(sem bajada)")
  console.log("\nSlug PT sugerido:")
  console.log(result.slugPt)
  console.log("\nStatus:", result.status)
  console.log("\nBody PT (primeiros 2 parágrafos):")
  const ptParagraphs = result.bodyPt.match(/<p>.*?<\/p>/gs) ?? []
  console.log(ptParagraphs.slice(0, 2).join("\n"))

  console.log("\n" + "═".repeat(70))
  console.log("BODY PT COMPLETO (últimos 3 parágrafos — Ficha do partida)")
  console.log("═".repeat(70))
  console.log(ptParagraphs.slice(-3).join("\n"))

  await prisma.$disconnect()
}
run().catch(console.error)
