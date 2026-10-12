import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ArticleForm from "@/components/admin/ArticleForm"

export default async function NewArticlePage() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")

  return (
    <div>
      <h1 className="text-2xl font-bold font-cuerpo mb-6">Nuevo artículo</h1>
      <ArticleForm />
    </div>
  )
}
