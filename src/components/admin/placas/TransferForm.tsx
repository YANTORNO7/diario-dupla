"use client"

import type { TransferData } from "@/app/admin/placas/page"
import ClubSearch from "./ClubSearch"

type Props = {
  data: TransferData
  onChange: (data: TransferData) => void
}

export default function TransferForm({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-cuerpo text-gray-600 mb-1">
          Nombre del jugador
        </label>
        <input
          type="text"
          value={data.playerName}
          onChange={(e) => onChange({ ...data, playerName: e.target.value })}
          placeholder="Juan Pérez"
          className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ClubSearch
          label="Club de origen"
          selected={data.fromClub}
          onSelect={(club) => onChange({ ...data, fromClub: club })}
        />
        <ClubSearch
          label="Club de destino"
          selected={data.toClub}
          onSelect={(club) => onChange({ ...data, toClub: club })}
        />
      </div>

      <div>
        <label className="block text-sm font-cuerpo text-gray-600 mb-1">
          Tipo de fichaje
        </label>
        <select
          value={data.transferType}
          onChange={(e) =>
            onChange({
              ...data,
              transferType: e.target.value as TransferData["transferType"],
            })
          }
          className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm"
        >
          <option value="COMPRA">Compra</option>
          <option value="PRESTAMO">Préstamo</option>
          <option value="LIBRE">Agente libre</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-cuerpo text-gray-600 mb-1">
          Detalles (opcional)
        </label>
        <textarea
          value={data.details}
          onChange={(e) => onChange({ ...data, details: e.target.value })}
          placeholder="Contrato por 3 años"
          rows={2}
          className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm resize-none"
        />
      </div>
    </div>
  )
}
