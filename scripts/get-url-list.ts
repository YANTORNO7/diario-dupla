export {}
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function run() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      primarySection: { select: { slug: true, parent: { select: { slug: true } } } }
    }
  })
  for (const a of articles) {
    const path = a.primarySection?.parent
      ? `/${a.primarySection.parent.slug}/${a.primarySection.slug}/${a.slug}`
      : a.primarySection
      ? `/${a.primarySection.slug}/${a.slug}`
      : `/${a.slug}`
    // Output TSV: path\ttitle
    console.log(`${path}\t${a.title.replace(/\t/g,"  ")}`)
  }
  await prisma.$disconnect()
}
run().catch(console.error)
