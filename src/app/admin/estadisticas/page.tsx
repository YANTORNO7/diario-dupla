import { requireAdmin } from "@/lib/auth-guard"
import { redirect } from "next/navigation"
import CollaboratorStats from "@/components/admin/CollaboratorStats"

export default async function EstadisticasPage() {
  const session = await requireAdmin()
  if (!session) redirect("/admin")

  return (
    <div>
      <h1 className="text-2xl font-bold font-cuerpo mb-6">Estadísticas de publicación</h1>
      <CollaboratorStats />
    </div>
  )
}
