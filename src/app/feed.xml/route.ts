import { prisma } from "@/lib/prisma"
import { getArticlePath } from "@/lib/sections"
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants"

export const revalidate = 60

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: {
      author: { select: { name: true } },
      primarySection: { include: { parent: true } },
      tags: true,
    },
  })

  const items = articles
    .map((article) => {
      const url = `${SITE_URL}${getArticlePath(article)}`
      const pubDate = new Date(article.publishedAt || article.createdAt).toUTCString()
      const categories = [
        article.primarySection?.name,
        ...article.tags.map((t) => t.name),
      ]
        .filter(Boolean)
        .map((c) => `<category>${escapeXml(c!)}</category>`)
        .join("\n        ")

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(article.author.name)}</author>
      <description>${escapeXml(article.subtitle || article.title)}</description>
      ${categories}${article.heroImageUrl ? `\n      <enclosure url="${escapeXml(article.heroImageUrl)}" type="image/webp" />` : ""}
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
    },
  })
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
