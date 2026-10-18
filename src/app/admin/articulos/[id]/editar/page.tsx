import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ArticleForm from "@/components/admin/ArticleForm"

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")

  const userId = (session.user as any).id as string
  const userRole = (session.user as any).role as string

  const { id } = await params
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      tags: true,
      author: { select: { name: true } },
      secondarySections: true,
    },
  })

  if (!article) notFound()

  // EDITOR não pode editar artigos de outros
  if (userRole === "EDITOR" && article.authorId !== userId) {
    redirect("/admin")
  }

  const sections = await prisma.section.findMany({
    include: {
      parent: { select: { name: true } },
      children: { select: { id: true, name: true } },
    },
    orderBy: { order: "asc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold font-cuerpo mb-6">Editar artículo</h1>
      <ArticleForm
        article={article}
        authorName={article.author.name}
        sections={sections}
        userRole={userRole}
      />
    </div>
  )
}
