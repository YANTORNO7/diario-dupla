"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type Section = {
  id: string
  name: string
  color: string
  showOnHomepage: boolean
  children: { id: string; name: string; color: string; showOnHomepage: boolean }[]
}

export default function SectionHomepageToggles({ sections }: { sections: Section[] }) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

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

  const allSections = sections.flatMap((s) => [
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
      <div className="flex flex-wrap gap-3">
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
    </div>
  )
}
