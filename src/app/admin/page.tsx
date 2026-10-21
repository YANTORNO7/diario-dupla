import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ArticleList from "@/components/admin/ArticleList"
import SectionHomepageToggles from "@/components/admin/SectionHomepageToggles"
import ReindexButton from "@/components/admin/ReindexButton"
import FixSectionOrderButton from "@/components/admin/FixSectionOrderButton"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")

  const userId = (session.user as any).id as string
  const userRole = (session.user as any).role as string

  // EDITOR só vê os próprios artigos
  const where = userRole === "EDITOR" ? { authorId: userId } : {}

  const articles = await prisma.article.findMany({
    where,
    include: {
      author: { select: { id: true, name: true } },
      tags: true,
      primarySection: { include: { parent: true } },
      secondarySections: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const sections = await prisma.section.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
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
      <SectionHomepageToggles sections={sections} />
      {userRole === "ADMIN" && (
        <div className="mb-4 flex flex-col gap-2">
          <ReindexButton />
          <FixSectionOrderButton />
        </div>
      )}
      <ArticleList articles={articles} userRole={userRole} />
    </div>
  )
}
