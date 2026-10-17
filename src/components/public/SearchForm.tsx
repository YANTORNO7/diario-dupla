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
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
            placeholder="Buscá noticias..."
            className="w-full pl-12 pr-4 py-4 rounded-lg bg-white font-cuerpo text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-celeste/60 border-0 shadow-sm"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="px-6 py-4 bg-celeste text-white font-cuerpo font-semibold text-sm rounded-lg hover:bg-celeste/80 transition-colors uppercase tracking-wide whitespace-nowrap"
        >
          Buscar
        </button>
      </div>
    </form>
  )
}
