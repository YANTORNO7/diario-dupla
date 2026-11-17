"use client"

import { useState } from "react"

type Subscriber = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  newsletterOptIn: boolean
  signupSource: string
  createdAt: Date | string
}

const SOURCE_LABELS: Record<string, string> = {
  email: "Email",
  google: "Google",
  "popup-email": "Popup email",
  "popup-google": "Popup Google",
}

export default function SubscribersManager({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
  const [subscribers, setSubscribers] = useState(initialSubscribers)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [verifying, setVerifying] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la cuenta de ${name}?`)) return
    setDeleting(id)
    try {
      await fetch(`/api/admin/subscribers?id=${id}`, { method: "DELETE" })
      setSubscribers((prev) => prev.filter((s) => s.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  async function handleVerify(id: string) {
    setVerifying(id)
    try {
      await fetch(`/api/admin/subscribers?id=${id}`, { method: "PATCH" })
      setSubscribers((prev) => prev.map((s) => s.id === id ? { ...s, emailVerified: true } : s))
    } finally {
      setVerifying(null)
    }
  }

  return (
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
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Fuente</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Registro</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                    No hay suscriptores todavía
                  </td>
                </tr>
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
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                    {SOURCE_LABELS[sub.signupSource] ?? sub.signupSource}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {new Date(sub.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-3">
                    {!sub.emailVerified && (
                      <button
                        onClick={() => handleVerify(sub.id)}
                        disabled={verifying === sub.id}
                        className="text-xs text-green-600 hover:text-green-800 disabled:opacity-40 transition-colors"
                      >
                        {verifying === sub.id ? "..." : "Verificar"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(sub.id, sub.name)}
                      disabled={deleting === sub.id}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                    >
                      {deleting === sub.id ? "..." : "Eliminar"}
                    </button>
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
