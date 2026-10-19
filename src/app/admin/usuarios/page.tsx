import { requireAdmin } from "@/lib/auth-guard"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function UsuariosPage() {
  const session = await requireAdmin()
  if (!session) redirect("/admin")

  const [users, subscribers] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        _count: { select: { articles: true } },
      },
    }),
    prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        newsletterOptIn: true,
        createdAt: true,
      },
    }),
  ])

  return (
    <div className="space-y-10">
      <div>
      <h1 className="text-2xl font-bold font-cuerpo mb-6">Usuarios</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-cuerpo">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Usuario</th>
                <th className="text-left px-4 py-3 font-semibold">Rol</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Artículos</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Creado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500">{user.username}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "ADMIN" ? "Admin" : "Colaborador"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{user._count.articles}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {new Date(user.createdAt).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Suscriptores */}
      <div>
        <h2 className="text-xl font-bold font-cuerpo mb-4">
          Suscriptores <span className="text-gray-400 font-normal text-base">({subscribers.length})</span>
        </h2>
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-cuerpo">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold">Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Verificado</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Newsletter</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Registro</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No hay suscriptores todavía</td></tr>
                ) : subscribers.map((sub) => (
                  <tr key={sub.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{sub.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{sub.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs px-2 py-1 rounded font-medium ${sub.emailVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {sub.emailVerified ? "Sí" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-block text-xs px-2 py-1 rounded font-medium ${sub.newsletterOptIn ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"}`}>
                        {sub.newsletterOptIn ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {new Date(sub.createdAt).toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
