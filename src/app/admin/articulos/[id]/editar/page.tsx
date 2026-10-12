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

  const { id } = await params
  const article = await prisma.article.findUnique({
    where: { id },
    include: { tags: true },
  })

  if (!article) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold font-cuerpo mb-6">Editar artículo</h1>
      <ArticleForm article={article} />
    </div>
  )
}
