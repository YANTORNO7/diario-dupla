import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ArticleList from "@/components/admin/ArticleList"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")

  const articles = await prisma.article.findMany({
    include: {
      author: { select: { id: true, name: true } },
      tags: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-cuerpo">Artículos</h1>
        <a
          href="/admin/articulos/nuevo"
          className="bg-[#111111] text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-cuerpo text-sm"
        >
          + Nuevo artículo
        </a>
      </div>
      <ArticleList articles={articles} />
    </div>
  )
}
