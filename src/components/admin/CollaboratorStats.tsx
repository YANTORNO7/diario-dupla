"use client"

import { useEffect, useState } from "react"

type StatEntry = {
  authorId: string
  authorName: string
  months: Record<string, number>
  total: number
}

type StatsData = {
  stats: StatEntry[]
  monthLabels: string[]
}

function formatMonth(label: string): string {
  const [year, month] = label.split("-")
  const names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  return `${names[parseInt(month) - 1]} ${year.slice(2)}`
}

export default function CollaboratorStats() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats/collaborators")
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500 font-cuerpo">Cargando estadísticas...</p>
      </div>
    )
  }

  if (!data || data.stats.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500 font-cuerpo">No hay datos de publicación todavía.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-cuerpo">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold">Colaborador</th>
              {data.monthLabels.map((m) => (
                <th key={m} className="text-center px-3 py-3 font-semibold">
                  {formatMonth(m)}
                </th>
              ))}
              <th className="text-center px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.stats.map((entry) => (
              <tr key={entry.authorId} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{entry.authorName}</td>
                {data.monthLabels.map((m) => (
                  <td key={m} className="text-center px-3 py-3 text-gray-600">
                    {entry.months[m] || 0}
                  </td>
                ))}
                <td className="text-center px-4 py-3 font-semibold">{entry.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
