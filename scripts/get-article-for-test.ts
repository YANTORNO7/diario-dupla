export {}
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function run() {
  const article = await prisma.article.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      subtitle: true,
      slug: true,
      body: true,
      primarySection: { select: { slug: true, slugPt: true, name: true, namePt: true, parent: { select: { slug: true, slugPt: true } } } },
    }
  })
  if (!article) { console.log("No article found"); return }
  
  const path = article.primarySection?.parent
    ? `/${article.primarySection.parent.slug}/${article.primarySection.slug}/${article.slug}`
    : article.primarySection
    ? `/${article.primarySection.slug}/${article.slug}`
    : `/${article.slug}`
  
  console.log("ID:", article.id)
  console.log("TITLE:", article.title)
  console.log("SUBTITLE:", article.subtitle ?? "(none)")
  console.log("URL:", path)
  console.log("SECTION_NAME:", article.primarySection?.name)
  console.log("BODY_LENGTH:", article.body.length)
  console.log("---BODY_START---")
  console.log(article.body)
  console.log("---BODY_END---")
  await prisma.$disconnect()
}
run().catch(console.error)
