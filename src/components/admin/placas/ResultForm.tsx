"use client"

import { type ResultData, COMPETITIONS, ROUNDS } from "@/app/admin/placas/page"
import ClubSearch from "./ClubSearch"
import ImageUploader from "@/components/admin/ImageUploader"

type Props = {
  data: ResultData
  onChange: (data: ResultData) => void
}

export default function ResultForm({ data, onChange }: Props) {
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
            Goles local
          </label>
          <input
            type="number"
            min={0}
            max={99}
            value={data.homeScore}
            onChange={(e) =>
              onChange({ ...data, homeScore: parseInt(e.target.value) || 0 })
            }
            className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-cuerpo text-gray-600 mb-1">
            Goles visitante
          </label>
          <input
            type="number"
            min={0}
            max={99}
            value={data.awayScore}
            onChange={(e) =>
              onChange({ ...data, awayScore: parseInt(e.target.value) || 0 })
            }
            className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-cuerpo text-gray-600 mb-1">
            Goleadores local
          </label>
          <textarea
            value={data.homeScorers}
            onChange={(e) => onChange({ ...data, homeScorers: e.target.value })}
            placeholder={"Martínez 23'\nFernández 67'"}
            rows={3}
            className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-cuerpo text-gray-600 mb-1">
            Goleadores visitante
          </label>
          <textarea
            value={data.awayScorers}
            onChange={(e) => onChange({ ...data, awayScorers: e.target.value })}
            placeholder={"Gómez 45'"}
            rows={3}
            className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm resize-none"
          />
        </div>
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
