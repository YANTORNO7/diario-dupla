"use client"

import { useState, useEffect, useRef } from "react"
import type { Club } from "@/app/admin/placas/page"

type Props = {
  label: string
  selected: Club | null
  onSelect: (club: Club | null) => void
}

export default function ClubSearch({ label, selected, onSelect }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Club[]>([])
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 1) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/clubs?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setOpen(true)
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (selected) {
    return (
      <div>
        <label className="block text-sm font-cuerpo text-gray-600 mb-1">
          {label}
        </label>
        <div className="flex items-center gap-2 border rounded-md px-3 py-2">
          <div
            className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white text-[8px] font-titular"
            style={{ backgroundColor: selected.primaryColor }}
          >
            {selected.crestUrl ? (
              <img src={selected.crestUrl} alt="" className="w-5 h-5 object-contain" />
            ) : (
              selected.initials
            )}
          </div>
          <span className="font-cuerpo text-sm flex-1">{selected.shortName}</span>
          <button
            type="button"
            onClick={() => {
              onSelect(null)
              setQuery("")
            }}
            className="text-gray-400 hover:text-red-600 text-xs"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-cuerpo text-gray-600 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 1 && setOpen(true)}
        placeholder="Buscar club..."
        className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
      />
      {open && results.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {results.map((club) => (
            <button
              key={club.id}
              type="button"
              onClick={() => {
                onSelect(club)
                setQuery("")
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
            >
              <div
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white text-[8px] font-titular"
                style={{ backgroundColor: club.primaryColor }}
              >
                {club.crestUrl ? (
                  <img src={club.crestUrl} alt="" className="w-5 h-5 object-contain" />
                ) : (
                  club.initials
                )}
              </div>
              <span className="font-cuerpo text-sm">{club.shortName}</span>
              <span className="text-xs text-gray-400 ml-auto">
                {club.league === "ARGENTINA" ? "ARG" : "BRA"}
              </span>
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 1 && results.length === 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg p-3">
          <p className="text-sm text-gray-400 font-cuerpo">
            No se encontraron clubes
          </p>
        </div>
      )}
    </div>
  )
}
