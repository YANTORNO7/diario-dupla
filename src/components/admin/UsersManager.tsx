"use client"
import { useState } from "react"

type UserRow = {
  id: string
  name: string
  email: string
  username: string
  role: string
  active: boolean
  createdAt: string | Date
  _count: { articles: number }
}

export default function UsersManager({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [adding, setAdding] = useState(false)
  const [addResult, setAddResult] = useState<{ username: string; password: string } | null>(null)
  const [addError, setAddError] = useState("")
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function openForm() {
    setShowForm(true)
    setAddResult(null)
    setAddError("")
  }

  function closeForm() {
    setShowForm(false)
    setAddResult(null)
    setAddError("")
    setEmail("")
    setName("")
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setAddError("")
    setAddResult(null)
    try {
      const res = await fetch("/api/admin/collaborators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAddError(data.error ?? "Error al crear colaborador")
        return
      }
      setUsers(prev => [data.user, ...prev])
      setAddResult({ username: data.user.username, password: data.temporaryPassword })
      setEmail("")
      setName("")
    } finally {
      setAdding(false)
    }
  }

  async function handleToggle(userId: string, newActive: boolean) {
    setTogglingId(userId)
    try {
      const res = await fetch("/api/admin/collaborators", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, active: newActive }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: newActive } : u))
      }
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-cuerpo">Usuarios</h1>
        <button
          onClick={showForm ? closeForm : openForm}
          className="px-4 py-2 bg-[#0B1631] text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          {showForm ? "Cancelar" : "+ Agregar colaborador"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border p-5 space-y-4">
          <h2 className="font-semibold text-sm">Nuevo colaborador</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="colaborador@email.com"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Nombre Apellido"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            {addError && (
              <p className="sm:col-span-2 text-xs text-red-600">{addError}</p>
            )}
            {addResult && (
              <div className="sm:col-span-2 bg-green-50 border border-green-200 rounded p-3 text-xs space-y-1">
                <p className="font-semibold text-green-800">Colaborador creado. Compartí estos datos de acceso:</p>
                <p>Usuario: <strong>{addResult.username}</strong></p>
                <p>Contraseña: <strong>{addResult.password}</strong></p>
              </div>
            )}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={adding}
                className="px-4 py-2 bg-[#0B1631] text-white rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {adding ? "Creando…" : "Crear colaborador"}
              </button>
            </div>
          </form>
        </div>
      )}

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
                <th className="text-left px-4 py-3 font-semibold">Acceso</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr
                  key={user.id}
                  className={`border-b last:border-0 hover:bg-gray-50 ${!user.active ? "opacity-50" : ""}`}
                >
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
                  <td className="px-4 py-3">
                    {user.role !== "ADMIN" && (
                      <button
                        onClick={() => handleToggle(user.id, !user.active)}
                        disabled={togglingId === user.id}
                        className={`text-xs px-2 py-1 rounded font-medium transition-colors disabled:opacity-50 ${
                          user.active
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {togglingId === user.id ? "…" : user.active ? "Desactivar" : "Activar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
