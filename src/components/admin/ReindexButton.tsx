"use client"
import { useState } from "react"

export default function ReindexButton() {
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    setStatus("")
    try {
      const res = await fetch("/api/admin/reindex-all", { method: "POST" })
      const data = await res.json()
      setStatus(`✓ ${data.count} artículos enviados a Google`)
    } catch {
      setStatus("Error al reindexar")
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
        {loading ? "Enviando..." : "Reindexar todo en Google"}
      </button>
      {status && <span className="text-xs font-cuerpo text-green-600">{status}</span>}
    </div>
  )
}
