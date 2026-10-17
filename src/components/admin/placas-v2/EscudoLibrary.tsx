"use client"
import { useState, useEffect, useRef } from "react"

type SavedEscudo = { id: string; name: string; url: string }
const LS_KEY = "dupla-escudos-v2"

function loadLibrary(): SavedEscudo[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]")
  } catch { return [] }
}
function saveLibrary(lib: SavedEscudo[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(lib))
}

export default function EscudoLibrary({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void
  onClose: () => void
}) {
  const [library, setLibrary] = useState<SavedEscudo[]>([])
  const [name, setName] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setLibrary(loadLibrary()) }, [])

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      const newEscudo: SavedEscudo = {
        id: Math.random().toString(36).slice(2),
        name: name.trim() || file.name.replace(/\.[^.]+$/, ""),
        url,
      }
      const updated = [...library, newEscudo]
      setLibrary(updated)
      saveLibrary(updated)
      setName("")
      if (fileRef.current) fileRef.current.value = ""
    }
    reader.readAsDataURL(file)
  }

  function remove(id: string) {
    const updated = library.filter(e => e.id !== id)
    setLibrary(updated)
    saveLibrary(updated)
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
          {library.length === 0 && (
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
            <label className="px-3 py-1.5 bg-[#0B1631] text-white rounded text-sm cursor-pointer hover:bg-gray-800 transition-colors">
              Subir
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/webp,image/avif"
                className="hidden"
                onChange={handleUpload}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
