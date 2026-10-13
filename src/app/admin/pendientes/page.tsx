import { requireAdmin } from "@/lib/auth-guard"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PendingArticleList from "@/components/admin/PendingArticleList"

export default async function PendientesPage() {
  const session = await requireAdmin()
  if (!session) redirect("/admin")

  const articles = await prisma.article.findMany({
    where: { status: "PENDING" },
    include: {
      author: { select: { id: true, name: true } },
      primarySection: { include: { parent: true } },
      tags: true,
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold font-cuerpo mb-6">Artículos pendientes</h1>
      <PendingArticleList articles={articles} />
    </div>
  )
}
