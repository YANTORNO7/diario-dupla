"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

type ClubWithCount = {
  id: string
  shortName: string
  name: string
  crestUrl: string | null
  primaryColor: string
  initials: string
  count: number
}

export default function GolesPage() {
  const [clubs, setClubs] = useState<ClubWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [clubsRes, placasRes] = await Promise.all([
        fetch('/api/clubs'),
        fetch('/api/gol-placas'),
      ])
      const allClubs = await clubsRes.json()
      const allPlacas = await placasRes.json()

      const countByClub: Record<string, number> = {}
      for (const p of allPlacas) {
        countByClub[p.clubId] = (countByClub[p.clubId] || 0) + 1
      }

      const withCount: ClubWithCount[] = allClubs
        .map((c: typeof allClubs[number]) => ({ ...c, count: countByClub[c.id] || 0 }))
        .filter((c: ClubWithCount) => c.count > 0)
        .sort((a: ClubWithCount, b: ClubWithCount) => b.count - a.count || a.shortName.localeCompare(b.shortName))

      setClubs(withCount)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-cuerpo">Biblioteca de Goles</h1>
        <Link
          href="/admin/placas"
          className="bg-negro text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-cuerpo text-sm"
        >
          + Nueva placa
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400 font-cuerpo text-center py-12">Cargando…</p>
      ) : clubs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 font-cuerpo mb-4">No hay placas guardadas todavía.</p>
          <p className="text-sm text-gray-400 font-cuerpo">
            Andá a <Link href="/admin/placas" className="underline">Placas IG</Link>, armá una placa de Gol con el club seleccionado y descargala — se guardará automáticamente acá.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {clubs.map(club => (
            <Link
              key={club.id}
              href={`/admin/goles/${club.id}`}
              className="bg-white rounded-xl border hover:shadow-md transition-shadow p-4 flex flex-col items-center gap-3 group"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: club.primaryColor + '20' }}
              >
                {club.crestUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={club.crestUrl} alt={club.shortName} className="w-12 h-12 object-contain" />
                ) : (
                  <span className="font-titular text-lg" style={{ color: club.primaryColor }}>{club.initials}</span>
                )}
              </div>
              <div className="text-center">
                <p className="font-cuerpo font-bold text-sm leading-tight">{club.shortName}</p>
                <p className="text-xs text-gray-400 font-cuerpo mt-0.5">
                  {club.count} {club.count === 1 ? 'placa' : 'placas'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
