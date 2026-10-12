"use client"

import { type PreviewData, COMPETITIONS, ROUNDS } from "@/app/admin/placas/page"
import ClubSearch from "./ClubSearch"
import ImageUploader from "@/components/admin/ImageUploader"

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

      <div>
        <label className="block text-sm font-cuerpo text-gray-600 mb-1">
          Competencia
        </label>
        <select
          value={data.competition}
          onChange={(e) => onChange({ ...data, competition: e.target.value })}
          className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
        >
          {COMPETITIONS.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-cuerpo text-gray-600 mb-1">
            Instancia
          </label>
          <select
            value={data.round}
            onChange={(e) => onChange({ ...data, round: e.target.value })}
            className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
          >
            {ROUNDS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
        {data.round === "fecha" && (
          <div>
            <label className="block text-sm font-cuerpo text-gray-600 mb-1">
              N° de fecha
            </label>
            <input
              type="number"
              min={1}
              max={99}
              value={data.matchday}
              onChange={(e) => onChange({ ...data, matchday: e.target.value })}
              className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <div>
        <label className="block text-sm font-cuerpo text-gray-600 mb-1">
          Foto del partido (opcional)
        </label>
        <ImageUploader
          currentUrl={data.photoUrl || undefined}
          onUpload={(url) => onChange({ ...data, photoUrl: url })}
        />
      </div>
    </div>
  )
}
