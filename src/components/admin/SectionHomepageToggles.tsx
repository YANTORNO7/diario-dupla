"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type Section = {
  id: string
  name: string
  color: string
  order: number
  description?: string | null
  showOnHomepage: boolean
  children: { id: string; name: string; color: string; showOnHomepage: boolean }[]
}

export default function SectionHomepageToggles({ sections, isAdmin }: { sections: Section[], isAdmin: boolean }) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)
  const [descriptions, setDescriptions] = useState<Record<string, string>>(
    Object.fromEntries(sections.map((s) => [s.id, s.description ?? ""]))
  )
  const [savingDesc, setSavingDesc] = useState<string | null>(null)

  async function toggle(id: string, current: boolean) {
    setUpdating(id)
    await fetch(`/api/sections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showOnHomepage: !current }),
    })
    router.refresh()
    setUpdating(null)
  }

  async function move(index: number, direction: "up" | "down") {
    const sorted = [...sections].sort((a, b) => a.order - b.order)
    const swapIndex = direction === "up" ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= sorted.length) return
    const a = sorted[index]
    const b = sorted[swapIndex]
    setUpdating(a.id)
    await Promise.all([
      fetch(`/api/sections/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/sections/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ])
    router.refresh()
    setUpdating(null)
  }

  async function saveDescription(id: string) {
    setSavingDesc(id)
    await fetch(`/api/sections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: descriptions[id] }),
    })
    router.refresh()
    setSavingDesc(null)
  }

  const sorted = [...sections].sort((a, b) => a.order - b.order)

  const allSections = sorted.flatMap((s) => [
    { id: s.id, name: s.name, color: s.color, showOnHomepage: s.showOnHomepage, isChild: false },
    ...s.children.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      showOnHomepage: c.showOnHomepage,
      isChild: true,
    })),
  ])

  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <h2 className="text-sm font-semibold font-cuerpo text-gray-700 mb-3">Secciones en la portada</h2>
      <div className="flex flex-wrap gap-3 mb-4">
        {allSections.map((s) => (
          <button
            key={s.id}
            onClick={() => toggle(s.id, s.showOnHomepage)}
            disabled={updating === s.id}
            className={`inline-flex items-center gap-1.5 text-xs font-cuerpo font-medium px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
              s.showOnHomepage
                ? "border-transparent text-white"
                : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
            }`}
            style={s.showOnHomepage ? { backgroundColor: s.color } : undefined}
          >
            {s.isChild && <span className="text-[10px] opacity-70">sub</span>}
            {s.name}
          </button>
        ))}
      </div>
      {isAdmin && (
        <>
          <div className="border-t pt-3">
            <p className="text-xs text-gray-400 font-cuerpo mb-2">Orden en la portada</p>
            <div className="flex flex-col gap-1">
              {sorted.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="text-xs font-cuerpo text-gray-600 w-40 truncate">{s.name}</span>
                  <button
                    onClick={() => move(i, "up")}
                    disabled={i === 0 || updating === s.id}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none"
                    title="Subir"
                  >▲</button>
                  <button
                    onClick={() => move(i, "down")}
                    disabled={i === sorted.length - 1 || updating === s.id}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none"
                    title="Bajar"
                  >▼</button>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-3 mt-3">
            <p className="text-xs text-gray-400 font-cuerpo mb-3">Descripción de cada sección</p>
            <div className="flex flex-col gap-3">
              {sorted.map((s) => (
                <div key={s.id} className="flex flex-col gap-1">
                  <label className="text-xs font-cuerpo text-gray-600 font-medium">{s.name}</label>
                  <div className="flex gap-2">
                    <textarea
                      value={descriptions[s.id] ?? ""}
                      onChange={(e) => setDescriptions((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      rows={2}
                      className="flex-1 text-xs font-cuerpo border border-gray-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:border-gray-400"
                      placeholder="Descripción breve de la sección..."
                    />
                    <button
                      onClick={() => saveDescription(s.id)}
                      disabled={savingDesc === s.id}
                      className="text-xs font-cuerpo px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 self-start"
                    >
                      {savingDesc === s.id ? "..." : "Guardar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
