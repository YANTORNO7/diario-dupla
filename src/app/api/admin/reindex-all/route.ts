import { NextResponse } from "next/server"
import { requireAdminAPI } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { pingGoogleBulk } from "@/lib/ping-google"
import { getArticlePath } from "@/lib/sections"
import { SITE_URL } from "@/lib/constants"

// POST — submits all published articles to Google Indexing API + IndexNow
export async function POST() {
  const auth = await requireAdminAPI()
  if (auth instanceof NextResponse) return auth

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { primarySection: { include: { parent: true } } },
    orderBy: { publishedAt: "desc" },
  })

  const urls = articles.map(a => `${SITE_URL}${getArticlePath(a)}`)

  await pingGoogleBulk(urls)

  return NextResponse.json({ ok: true, count: urls.length })
}
