"use client"
import { useState } from "react"

export default function FixSectionOrderButton() {
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    setStatus("")
    try {
      const res = await fetch("/api/admin/section-order", { method: "POST" })
      const data = await res.json()
      if (data.ok) {
        setStatus("✓ Orden de secciones corregido")
      } else {
        setStatus("Error al corregir")
      }
    } catch {
      setStatus("Error al corregir")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-xs font-cuerpo text-gray-400 hover:text-gray-700 underline disabled:opacity-50"
      >
        {loading ? "Corrigiendo..." : "Corregir orden de secciones"}
      </button>
      {status && <span className="text-xs font-cuerpo text-green-600">{status}</span>}
    </div>
  )
}
