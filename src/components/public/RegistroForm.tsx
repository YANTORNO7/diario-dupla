"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegistroForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newsletterOptIn, setNewsletterOptIn] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/subscriber/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, newsletterOptIn }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al registrar")
        return
      }

      router.push("/cuenta")
      router.refresh()
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-cuerpo font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-cuerpo focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-cuerpo font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-cuerpo focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-cuerpo font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-cuerpo focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={newsletterOptIn}
          onChange={(e) => setNewsletterOptIn(e.target.checked)}
          className="mt-0.5 rounded border-gray-300"
        />
        <span className="text-sm font-cuerpo text-gray-600">
          Quiero recibir las últimas noticias por email
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-[#111111] text-white font-cuerpo font-semibold text-sm rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  )
}
