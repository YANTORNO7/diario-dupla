"use client"
import { useState, useEffect, useRef } from "react"

type SavedEscudo = { id: string; name: string; url: string }
const LS_KEY = "dupla-escudos-v2"
const LS_MIGRATED_KEY = "dupla-escudos-migrated"

export default function EscudoLibrary({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void
  onClose: () => void
}) {
  const [library, setLibrary] = useState<SavedEscudo[]>([])
  const [name, setName] = useState("")
  const [uploading, setUploading] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/shared-escudos")
      .then(r => r.json())
      .then((shared: SavedEscudo[]) => {
        setLibrary(shared)
        // Migrar localStorage automaticamente se ainda não foi feito
        const alreadyMigrated = localStorage.getItem(LS_MIGRATED_KEY)
        if (!alreadyMigrated) {
          try {
            const local: SavedEscudo[] = JSON.parse(localStorage.getItem(LS_KEY) || "[]")
            if (local.length > 0) {
              migrateLocal(local)
            } else {
              localStorage.setItem(LS_MIGRATED_KEY, "1")
            }
          } catch { localStorage.setItem(LS_MIGRATED_KEY, "1") }
        }
      })
      .catch(() => {})
  }, [])

  async function migrateLocal(local: SavedEscudo[]) {
    setMigrating(true)
    const added: SavedEscudo[] = []
    for (const e of local) {
      try {
        // Converter base64 data URL para blob
        const res = await fetch(e.url)
        const blob = await res.blob()
        const file = new File([blob], `${e.name}.png`, { type: blob.type || "image/png" })

        const formData = new FormData()
        formData.append("file", file)
        formData.append("skipOptimize", "true")
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        if (!uploadRes.ok) continue
        const { url } = await uploadRes.json()

        const saveRes = await fetch("/api/shared-escudos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: e.name, url }),
        })
        if (saveRes.ok) added.push(await saveRes.json())
      } catch { /* continua com próximo */ }
    }
    setLibrary(prev => [...prev, ...added])
    localStorage.setItem(LS_MIGRATED_KEY, "1")
    setMigrating(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("skipOptimize", "true")
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) { alert("Error al subir imagen"); return }
      const { url } = await uploadRes.json()

      const escudoName = name.trim() || file.name.replace(/\.[^.]+$/, "")
      const saveRes = await fetch("/api/shared-escudos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: escudoName, url }),
      })
      if (!saveRes.ok) { alert("Error al guardar en biblioteca"); return }
      const newEscudo = await saveRes.json()
      setLibrary(prev => [...prev, newEscudo])
      setName("")
      if (fileRef.current) fileRef.current.value = ""
    } finally {
      setUploading(false)
    }
  }

  async function remove(id: string) {
    await fetch(`/api/shared-escudos/${id}`, { method: "DELETE" })
    setLibrary(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-bold text-sm">Biblioteca de escudos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {migrating && (
            <p className="text-xs text-blue-500 text-center py-2">Importando escudos guardados...</p>
          )}
          {!migrating && library.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No hay escudos guardados todavía.</p>
          )}
          <div className="grid grid-cols-4 gap-3">
            {library.map(e => (
              <div key={e.id} className="flex flex-col items-center gap-1 group">
                <button
                  onClick={() => { onSelect(e.url); onClose() }}
                  className="w-16 h-16 rounded-lg border-2 border-transparent hover:border-[#0B1631] bg-gray-100 flex items-center justify-center overflow-hidden transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.url} alt={e.name} className="w-14 h-14 object-contain" />
                </button>
                <span className="text-xs text-gray-500 text-center leading-tight max-w-full truncate px-1">{e.name}</span>
                <button
                  onClick={() => remove(e.id)}
                  className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  quitar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t px-4 py-3 space-y-2">
          <p className="text-xs text-gray-500">Agregar escudo (PNG, WebP, AVIF con fondo transparente)</p>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre (ej: Boca)"
              className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#0B1631]"
            />
            <label className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-colors text-white ${uploading ? "bg-gray-400 cursor-wait" : "bg-[#0B1631] hover:bg-gray-800"}`}>
              {uploading ? "Subiendo..." : "Subir"}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/webp,image/avif"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
