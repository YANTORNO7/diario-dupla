"use client"

import { useState, useEffect, useRef } from "react"

type Props = {
  value: string[]
  onChange: (tags: string[]) => void
}

export default function TagInput({ value, onChange }: Props) {
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (input.length < 2) { setSuggestions([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/tags?q=${encodeURIComponent(input)}`)
      const data = await res.json()
      setSuggestions(data.filter((t: { name: string }) => !value.includes(t.name)))
    }, 300)
    return () => clearTimeout(timer)
  }, [input, value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowSuggestions(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function addTag(tag: string) {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed])
    setInput("")
    setSuggestions([])
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-white">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 text-sm px-2 py-1 rounded font-cuerpo">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-gray-600">x</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true) }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === ",") && input.trim()) { e.preventDefault(); addTag(input) }
            if (e.key === "Backspace" && !input && value.length > 0) removeTag(value[value.length - 1])
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={value.length === 0 ? "Escribí una etiqueta y presioná Enter..." : ""}
          className="flex-1 min-w-[120px] outline-none text-sm font-cuerpo"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-32 overflow-y-auto">
          {suggestions.map((s) => (
            <button key={s.id} type="button" onClick={() => { addTag(s.name); setShowSuggestions(false) }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 font-cuerpo"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
