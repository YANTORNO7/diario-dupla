"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  initialQuery: string
}

export default function SearchForm({ initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed.length >= 2) {
      router.push(`/buscar?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar noticias..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 font-cuerpo text-base focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-[#111111] text-white font-cuerpo font-semibold text-sm rounded-lg hover:bg-[#333] transition-colors uppercase tracking-wide"
        >
          Buscar
        </button>
      </div>
    </form>
  )
}
