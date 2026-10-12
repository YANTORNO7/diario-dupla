"use client"

import type { PreviewData } from "@/app/admin/placas/page"
import ClubSearch from "./ClubSearch"

type Props = {
  data: PreviewData
  onChange: (data: PreviewData) => void
}

export default function PreviewForm({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <ClubSearch
          label="Local"
          selected={data.homeClub}
          onSelect={(club) => onChange({ ...data, homeClub: club })}
        />
        <ClubSearch
          label="Visitante"
          selected={data.awayClub}
          onSelect={(club) => onChange({ ...data, awayClub: club })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-cuerpo text-gray-600 mb-1">
            Competencia
          </label>
          <input
            type="text"
            value={data.competition}
            onChange={(e) =>
              onChange({ ...data, competition: e.target.value })
            }
            placeholder="Liga Profesional"
            className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-cuerpo text-gray-600 mb-1">
            Fecha del partido
          </label>
          <input
            type="date"
            value={data.matchDate}
            onChange={(e) => onChange({ ...data, matchDate: e.target.value })}
            className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-cuerpo text-gray-600 mb-1">
            Horario
          </label>
          <input
            type="time"
            value={data.matchTime}
            onChange={(e) => onChange({ ...data, matchTime: e.target.value })}
            className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-cuerpo text-gray-600 mb-1">
            Estadio
          </label>
          <input
            type="text"
            value={data.stadium}
            onChange={(e) => onChange({ ...data, stadium: e.target.value })}
            placeholder="Estadio Monumental"
            className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
          />
        </div>
      </div>
    </div>
  )
}
