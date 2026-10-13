"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Subscriber = {
  id: string
  email: string
  name: string
  newsletterOptIn: boolean
  emailVerified: boolean
}

export default function CuentaPanel() {
  const router = useRouter()
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetch("/api/subscriber/me")
      .then((res) => res.json())
      .then((data) => {
        setSubscriber(data.subscriber)
        setLoading(false)
        if (!data.subscriber) {
          router.push("/ingresar")
        }
      })
      .catch(() => setLoading(false))
  }, [router])

  async function toggleNewsletter() {
    if (!subscriber) return
    setToggling(true)
    try {
      const res = await fetch("/api/subscriber/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterOptIn: !subscriber.newsletterOptIn }),
      })
      const data = await res.json()
      if (res.ok) {
        setSubscriber(data.subscriber)
      }
    } catch {
      // silenciar erro
    } finally {
      setToggling(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/subscriber/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return <p className="text-gray-500 font-cuerpo text-sm">Cargando...</p>
  }

  if (!subscriber) return null

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-5 space-y-3">
        <div>
          <p className="text-xs font-cuerpo text-gray-500 uppercase tracking-wide">Nombre</p>
          <p className="font-cuerpo text-gray-900">{subscriber.name}</p>
        </div>
        <div>
          <p className="text-xs font-cuerpo text-gray-500 uppercase tracking-wide">Email</p>
          <p className="font-cuerpo text-gray-900">{subscriber.email}</p>
        </div>
        <div>
          <p className="text-xs font-cuerpo text-gray-500 uppercase tracking-wide">Email verificado</p>
          <p className="font-cuerpo text-gray-900">
            {subscriber.emailVerified ? "Sí" : "No — revisá tu bandeja de entrada"}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-cuerpo font-semibold text-gray-900 text-sm">Newsletter</p>
            <p className="font-cuerpo text-gray-500 text-sm">
              Recibir noticias por email cuando se publique un artículo nuevo
            </p>
          </div>
          <button
            onClick={toggleNewsletter}
            disabled={toggling}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              subscriber.newsletterOptIn ? "bg-green-500" : "bg-gray-300"
            } ${toggling ? "opacity-50" : ""}`}
            aria-label={subscriber.newsletterOptIn ? "Desactivar newsletter" : "Activar newsletter"}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                subscriber.newsletterOptIn ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="text-sm font-cuerpo text-gray-500 hover:text-red-600 transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
