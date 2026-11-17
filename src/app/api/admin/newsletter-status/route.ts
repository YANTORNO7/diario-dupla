import { NextResponse } from "next/server"
import { requireAdminAPI } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { sendNewsletter } from "@/lib/newsletter"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get("key") !== "dupla-nl-debug-2026") {
    const session = await requireAdminAPI()
    if (session instanceof NextResponse) return session
  }

  // Force send for a specific article
  const forceArticleId = searchParams.get("force")
  if (forceArticleId) {
    await prisma.newsletterLog.deleteMany({ where: { articleId: forceArticleId } })
    await sendNewsletter(forceArticleId)
    const log = await prisma.newsletterLog.findUnique({ where: { articleId: forceArticleId } })
    return NextResponse.json({ forced: true, articleId: forceArticleId, log })
  }

  const [verifiedOptIn, allSubscribers, recentLogs] = await Promise.all([
    prisma.subscriber.count({
      where: { newsletterOptIn: true, emailVerified: true },
    }),
    prisma.subscriber.count(),
    prisma.newsletterLog.findMany({
      orderBy: { sentAt: "desc" },
      take: 10,
      include: { article: { select: { title: true, status: true } } },
    }),
  ])

  return NextResponse.json({ verifiedOptIn, allSubscribers, recentLogs })
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get("key") !== "dupla-nl-debug-2026") {
    const session = await requireAdminAPI()
    if (session instanceof NextResponse) return session
  }

  const { articleId } = await req.json()
  if (!articleId) return NextResponse.json({ error: "articleId requerido" }, { status: 400 })

  await prisma.newsletterLog.deleteMany({ where: { articleId } })
  await sendNewsletter(articleId)

  const log = await prisma.newsletterLog.findUnique({ where: { articleId } })
  return NextResponse.json({ ok: true, log })
}
