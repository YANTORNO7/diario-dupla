import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function UsuariosPage() {
  const session = await auth()
  if (!session?.user) redirect("/admin/login")

  return (
    <div>
      <h1 className="text-2xl font-bold font-cuerpo mb-6">Usuarios</h1>
      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-gray-500 font-cuerpo">
          La gestión de usuarios estará disponible próximamente.
        </p>
        <p className="text-gray-400 font-cuerpo text-sm mt-2">
          Por ahora, podés crear usuarios desde la terminal con el script de seed.
        </p>
      </div>
    </div>
  )
}
