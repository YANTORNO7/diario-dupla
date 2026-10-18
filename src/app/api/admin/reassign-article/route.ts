import { NextRequest, NextResponse } from "next/server"
import { requireAdminAPI } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"

// GET — lista todos os usuários com contagem de artigos
export async function GET() {
  const auth = await requireAdminAPI()
  if (auth instanceof NextResponse) return auth

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  })

  const counts = await Promise.all(
    users.map(async (u) => {
      const count = await prisma.article.count({ where: { authorId: u.id } })
      const recent = await prisma.article.findMany({
        where: { authorId: u.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, status: true, createdAt: true },
      })
      return { ...u, articleCount: count, recentArticles: recent }
    })
  )

  return NextResponse.json(counts)
}

// POST — reatribui um artigo específico para outro usuário
// body: { articleId, toUserId }
export async function POST(request: NextRequest) {
  const auth = await requireAdminAPI()
  if (auth instanceof NextResponse) return auth

  const { articleId, toUserId } = await request.json()
  if (!articleId || !toUserId)
    return NextResponse.json({ error: "articleId e toUserId são obrigatórios" }, { status: 400 })

  const [article, toUser] = await Promise.all([
    prisma.article.findUnique({ where: { id: articleId } }),
    prisma.user.findUnique({ where: { id: toUserId } }),
  ])
  if (!article) return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 })
  if (!toUser) return NextResponse.json({ error: "Usuário destino não encontrado" }, { status: 404 })

  const updated = await prisma.article.update({
    where: { id: articleId },
    data: { authorId: toUserId },
    include: { author: { select: { name: true } } },
  })

  return NextResponse.json({ ok: true, message: `"${updated.title}" → ${toUser.name}` })
}

// PATCH — renomeia um usuário
// body: { userId, newName }
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAPI()
  if (auth instanceof NextResponse) return auth

  const { userId, newName } = await request.json()
  if (!userId || !newName)
    return NextResponse.json({ error: "userId e newName são obrigatórios" }, { status: 400 })

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { name: newName },
    select: { id: true, name: true, email: true },
  })

  return NextResponse.json({ ok: true, user: updated })
}

// PUT — migra TODOS os artigos de um usuário para outro e opcionalmente renomeia o de origem
// body: { fromUserId, toUserId, renameFromTo? }
export async function PUT(request: NextRequest) {
  const auth = await requireAdminAPI()
  if (auth instanceof NextResponse) return auth

  const { fromUserId, toUserId, renameFromTo } = await request.json()
  if (!fromUserId || !toUserId)
    return NextResponse.json({ error: "fromUserId e toUserId são obrigatórios" }, { status: 400 })

  const [fromUser, toUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: fromUserId } }),
    prisma.user.findUnique({ where: { id: toUserId } }),
  ])
  if (!fromUser) return NextResponse.json({ error: "Usuário origem não encontrado" }, { status: 404 })
  if (!toUser) return NextResponse.json({ error: "Usuário destino não encontrado" }, { status: 404 })

  const { count } = await prisma.article.updateMany({
    where: { authorId: fromUserId },
    data: { authorId: toUserId },
  })

  if (renameFromTo) {
    await prisma.user.update({ where: { id: fromUserId }, data: { name: renameFromTo } })
  }

  return NextResponse.json({
    ok: true,
    message: `${count} artigos migrados de "${fromUser.name}" para "${toUser.name}"${renameFromTo ? `. "${fromUser.name}" renomeado para "${renameFromTo}"` : ""}`,
    count,
  })
}
