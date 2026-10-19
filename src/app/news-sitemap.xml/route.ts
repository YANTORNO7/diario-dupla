import { prisma } from "@/lib/prisma"
import { getArticlePath } from "@/lib/sections"
import { SITE_NAME, SITE_URL } from "@/lib/constants"

export const revalidate = 60

// Google News Sitemap — only articles published in the last 48 hours.
// Googlebot News checks this frequently; keeping it fresh speeds up indexing.
export async function GET() {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000)

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { gte: since },
    },
    orderBy: { publishedAt: "desc" },
    include: {
      primarySection: { include: { parent: true } },
    },
  })

  const items = articles
    .map((article) => {
      const url = `${SITE_URL}${getArticlePath(article)}`
      const pubDate = new Date(article.publishedAt || article.createdAt).toISOString()
      return `  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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
