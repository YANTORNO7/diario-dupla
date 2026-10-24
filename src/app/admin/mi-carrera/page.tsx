import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import CarreraPanel from "@/components/admin/CarreraPanel"

export default async function MiCarreraPage() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")

  return (
    <div>
      <h1 className="text-2xl font-bold font-cuerpo mb-6">Mi carrera</h1>
      <CarreraPanel />
    </div>
  )
}
