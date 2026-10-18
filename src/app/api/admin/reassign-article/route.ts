import { NextRequest, NextResponse } from "next/server"
import { requireAdminAPI } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"

// GET — lista artigos recentes do admin (Bart) para identificar qual reatribuir
export async function GET() {
  const auth = await requireAdminAPI()
  if (auth instanceof NextResponse) return auth

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  })

  const adminUser = users.find(u => u.role === "ADMIN")
  if (!adminUser) return NextResponse.json({ error: "Admin user not found" }, { status: 404 })

  const articles = await prisma.article.findMany({
    where: { authorId: adminUser.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, title: true, status: true, createdAt: true },
  })

  return NextResponse.json({ users, adminUserId: adminUser.id, recentAdminArticles: articles })
}

// POST — reatribui um artigo de um usuário para outro
// body: { articleId: string, toUserId: string }
export async function POST(request: NextRequest) {
  const auth = await requireAdminAPI()
  if (auth instanceof NextResponse) return auth

  const { articleId, toUserId } = await request.json()
  if (!articleId || !toUserId) {
    return NextResponse.json({ error: "articleId e toUserId são obrigatórios" }, { status: 400 })
  }

  const article = await prisma.article.findUnique({ where: { id: articleId } })
  if (!article) return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 })

  const toUser = await prisma.user.findUnique({ where: { id: toUserId } })
  if (!toUser) return NextResponse.json({ error: "Usuário destino não encontrado" }, { status: 404 })

  const updated = await prisma.article.update({
    where: { id: articleId },
    data: { authorId: toUserId },
    include: { author: { select: { name: true, email: true } } },
  })

  return NextResponse.json({
    ok: true,
    message: `Artigo "${updated.title}" reatribuído para ${toUser.name}`,
    article: { id: updated.id, title: updated.title, author: updated.author },
  })
}
