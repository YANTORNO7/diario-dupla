import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ArticleForm from "@/components/admin/ArticleForm"

export default async function NewArticlePage() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")

  const userRole = (session.user as any).role as string

  const sections = await prisma.section.findMany({
    include: {
      parent: { select: { name: true } },
      children: { select: { id: true, name: true } },
    },
    orderBy: { order: "asc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold font-cuerpo mb-6">Nuevo artículo</h1>
      <ArticleForm authorName={session.user.name || ""} sections={sections} userRole={userRole} />
    </div>
  )
}
