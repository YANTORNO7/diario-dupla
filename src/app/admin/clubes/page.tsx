"use client"

import { useState, useEffect } from "react"

type Club = {
  id: string
  name: string
  shortName: string
  initials: string
  primaryColor: string
  secondaryColor: string
  league: string
  crestUrl: string | null
}

const EMPTY_FORM = {
  name: "",
  shortName: "",
  initials: "",
  primaryColor: "#000000",
  secondaryColor: "#FFFFFF",
  league: "ARGENTINA",
  crestUrl: "",
}

export default function ClubesPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [filterLeague, setFilterLeague] = useState("")
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadClubs()
  }, [filterLeague])

  async function loadClubs() {
    const params = new URLSearchParams()
    if (filterLeague) params.set("league", filterLeague)
    const res = await fetch(`/api/clubs?${params}`)
    const data = await res.json()
    setClubs(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const url = editingId ? `/api/clubs/${editingId}` : "/api/clubs"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al guardar")
        return
      }
      setForm(EMPTY_FORM)
      setEditingId(null)
      setShowForm(false)
      loadClubs()
    } catch {
      setError("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  function startEdit(club: Club) {
    setForm({
      name: club.name,
      shortName: club.shortName,
      initials: club.initials,
      primaryColor: club.primaryColor,
      secondaryColor: club.secondaryColor,
      league: club.league,
      crestUrl: club.crestUrl || "",
    })
    setEditingId(club.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este club?")) return
    await fetch(`/api/clubs/${id}`, { method: "DELETE" })
    loadClubs()
  }

  async function handleCrestUpload(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("skipOptimize", "true")
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const data = await res.json()
    if (res.ok) {
      setForm((prev) => ({ ...prev, crestUrl: data.url }))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-cuerpo">Clubes</h1>
        <button
          onClick={() => {
            setForm(EMPTY_FORM)
            setEditingId(null)
            setShowForm(!showForm)
          }}
          className="bg-negro text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-cuerpo text-sm"
        >
          {showForm ? "Cancelar" : "+ Nuevo club"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-lg p-6 mb-6 space-y-4"
        >
          <h2 className="font-cuerpo font-bold text-lg">
            {editingId ? "Editar club" : "Nuevo club"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-cuerpo text-gray-600 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Club Atlético River Plate"
                className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-cuerpo text-gray-600 mb-1">
                Nombre corto
              </label>
              <input
                type="text"
                value={form.shortName}
                onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                placeholder="River Plate"
                className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-cuerpo text-gray-600 mb-1">
                Iniciales (máx 3)
              </label>
              <input
                type="text"
                value={form.initials}
                onChange={(e) =>
                  setForm({
                    ...form,
                    initials: e.target.value.toUpperCase().slice(0, 3),
                  })
                }
                placeholder="RIV"
                maxLength={3}
                className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-cuerpo text-gray-600 mb-1">
                Color primario
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) =>
                    setForm({ ...form, primaryColor: e.target.value })
                  }
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) =>
                    setForm({ ...form, primaryColor: e.target.value })
                  }
                  className="flex-1 border rounded-md px-3 py-2 font-cuerpo text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-cuerpo text-gray-600 mb-1">
                Color secundario
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) =>
                    setForm({ ...form, secondaryColor: e.target.value })
                  }
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) =>
                    setForm({ ...form, secondaryColor: e.target.value })
                  }
                  className="flex-1 border rounded-md px-3 py-2 font-cuerpo text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-cuerpo text-gray-600 mb-1">
                Liga
              </label>
              <select
                value={form.league}
                onChange={(e) => setForm({ ...form, league: e.target.value })}
                className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
              >
                <option value="ARGENTINA">Argentina</option>
                <option value="BRASIL">Brasil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-cuerpo text-gray-600 mb-1">
                Escudo (opcional)
              </label>
              <div className="flex items-center gap-3">
                {form.crestUrl && (
                  <img
                    src={form.crestUrl}
                    alt="Escudo"
                    className="w-10 h-10 object-contain"
                  />
                )}
                <input
                  type="file"
                  accept="image/png,image/svg+xml,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleCrestUpload(f)
                  }}
                  className="font-cuerpo text-sm"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm font-cuerpo">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-negro text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-cuerpo text-sm disabled:opacity-50"
          >
            {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear club"}
          </button>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        {["", "ARGENTINA", "BRASIL"].map((league) => (
          <button
            key={league}
            onClick={() => setFilterLeague(league)}
            className={`px-3 py-1 rounded-full text-sm font-cuerpo transition-colors ${
              filterLeague === league
                ? "bg-negro text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {league === "" ? "Todos" : league === "ARGENTINA" ? "Argentina" : "Brasil"}
          </button>
        ))}
      </div>

      {clubs.length === 0 ? (
        <p className="text-gray-400 font-cuerpo text-center py-12">
          No hay clubes cargados.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="border rounded-lg p-4 flex items-start gap-3 hover:shadow-sm transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-titular text-sm shrink-0"
                style={{ backgroundColor: club.primaryColor }}
              >
                {club.crestUrl ? (
                  <img
                    src={club.crestUrl}
                    alt={club.name}
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  club.initials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-cuerpo font-bold text-sm truncate">
                  {club.name}
                </p>
                <p className="font-cuerpo text-xs text-gray-500">
                  {club.shortName} · {club.initials}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="inline-block w-4 h-4 rounded-full border"
                    style={{ backgroundColor: club.primaryColor }}
                    title={club.primaryColor}
                  />
                  <span
                    className="inline-block w-4 h-4 rounded-full border"
                    style={{ backgroundColor: club.secondaryColor }}
                    title={club.secondaryColor}
                  />
                  <span className="text-xs text-gray-400 font-cuerpo">
                    {club.league === "ARGENTINA" ? "ARG" : "BRA"}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(club)}
                  className="text-gray-400 hover:text-negro text-xs font-cuerpo"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(club.id)}
                  className="text-gray-400 hover:text-red-600 text-xs font-cuerpo"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
