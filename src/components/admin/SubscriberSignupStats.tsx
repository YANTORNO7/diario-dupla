"use client"

import { useEffect, useState } from "react"

type WeekEntry = {
  week: string
  email: number
  google: number
  popup_email: number
  popup_google: number
}

function formatWeek(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}

export default function SubscriberSignupStats() {
  const [data, setData] = useState<WeekEntry[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats/subscribers")
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border">
        <p className="text-gray-500 font-cuerpo text-sm">Cargando...</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border">
        <p className="text-gray-500 font-cuerpo text-sm">No hay datos de suscripciones todavía.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-cuerpo">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold">Semana</th>
              <th className="text-center px-3 py-3 font-semibold">Popup (total)</th>
              <th className="text-center px-3 py-3 font-semibold">Popup Google</th>
              <th className="text-center px-3 py-3 font-semibold">Popup Email</th>
              <th className="text-center px-3 py-3 font-semibold">Directo (total)</th>
              <th className="text-center px-3 py-3 font-semibold">Directo Google</th>
              <th className="text-center px-3 py-3 font-semibold">Directo Email</th>
              <th className="text-center px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => {
              const popup = entry.popup_email + entry.popup_google
              const direct = entry.email + entry.google
              const total = popup + direct
              return (
                <tr key={entry.week} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{formatWeek(entry.week)}</td>
                  <td className="text-center px-3 py-3 text-gray-700">{popup || 0}</td>
                  <td className="text-center px-3 py-3 text-gray-500">{entry.popup_google}</td>
                  <td className="text-center px-3 py-3 text-gray-500">{entry.popup_email}</td>
                  <td className="text-center px-3 py-3 text-gray-700">{direct || 0}</td>
                  <td className="text-center px-3 py-3 text-gray-500">{entry.google}</td>
                  <td className="text-center px-3 py-3 text-gray-500">{entry.email}</td>
                  <td className="text-center px-4 py-3 font-semibold">{total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
