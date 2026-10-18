"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"

type GolPlaca = {
  id: string
  playerName: string
  imageUrl: string
  version: number
  fotoUrl: string
  fotoPosX: number
  fotoPosY: number
  fotoScale: number
  escudoUrl: string
  fondo: string
  franja: string
  clubId: string
  userId: string
  createdAt: string
  club: { id: string; shortName: string; crestUrl: string | null }
}

type Club = {
  id: string
  shortName: string
  name: string
  crestUrl: string | null
  primaryColor: string
  initials: string
}

export default function GolClubPage({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = use(params)
  const [placas, setPlacas] = useState<GolPlaca[]>([])
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewPlaca, setViewPlaca] = useState<GolPlaca | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [clubRes, placasRes] = await Promise.all([
        fetch(`/api/clubs/${clubId}`),
        fetch(`/api/gol-placas?clubId=${clubId}`),
      ])
      setClub(await clubRes.json())
      setPlacas(await placasRes.json())
      setLoading(false)
    }
    load()
  }, [clubId])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta placa?')) return
    setDeleting(id)
    await fetch(`/api/gol-placas/${id}`, { method: 'DELETE' })
    setPlacas(prev => prev.filter(p => p.id !== id))
    if (viewPlaca?.id === id) setViewPlaca(null)
    setDeleting(null)
  }

  async function downloadPlaca(placa: GolPlaca) {
    const blob = await fetch(placa.imageUrl).then(r => r.blob())
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gol-${placa.playerName.toLowerCase().replace(/\s+/g, '-')}-v${placa.version}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/goles" className="text-gray-400 hover:text-gray-700 text-sm font-cuerpo">
          ← Goles
        </Link>
        {club && (
          <>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-2">
              {club.crestUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={club.crestUrl} alt={club.shortName} className="w-6 h-6 object-contain" />
              )}
              <h1 className="text-xl font-bold font-cuerpo">{club.shortName}</h1>
            </div>
          </>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400 font-cuerpo text-center py-12">Cargando…</p>
      ) : placas.length === 0 ? (
        <p className="text-gray-400 font-cuerpo text-center py-12">No hay placas para este club.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {placas.map(placa => (
            <div
              key={placa.id}
              className="bg-white rounded-xl border hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
              onClick={() => setViewPlaca(placa)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={placa.imageUrl}
                alt={placa.playerName}
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="p-2">
                <p className="font-cuerpo font-bold text-xs leading-tight truncate">{placa.playerName}</p>
                {placa.version > 1 && (
                  <p className="text-xs text-gray-400 font-cuerpo">v{placa.version}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full view modal */}
      {viewPlaca && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setViewPlaca(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewPlaca.imageUrl}
              alt={viewPlaca.playerName}
              className="w-full"
            />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold font-cuerpo">{viewPlaca.playerName}</p>
                  {viewPlaca.version > 1 && (
                    <p className="text-xs text-gray-400 font-cuerpo">Versión {viewPlaca.version}</p>
                  )}
                </div>
                <button
                  onClick={() => setViewPlaca(null)}
                  className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadPlaca(viewPlaca)}
                  className="flex-1 py-2 bg-[#F2B632] text-[#0B1631] font-bold text-sm rounded-lg hover:bg-yellow-400 transition-colors font-cuerpo"
                >
                  Descargar
                </button>
                <Link
                  href={`/admin/placas?golId=${viewPlaca.id}`}
                  className="flex-1 py-2 bg-[#0B1631] text-white font-bold text-sm rounded-lg hover:bg-gray-800 transition-colors font-cuerpo text-center"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(viewPlaca.id)}
                  disabled={deleting === viewPlaca.id}
                  className="px-3 py-2 border border-red-200 text-red-500 text-sm rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleting === viewPlaca.id ? '…' : 'Borrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
