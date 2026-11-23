"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { NIVELES, type Nivel } from "@/lib/niveles"

type CarreraData = {
  total: number
  estesMes: number
  estaSemana: number
  nivelActual: Nivel
  nivelSiguiente: Nivel | null
  progreso: number
  ranking: { userId: string; name: string; notasMes: number; nivel: Nivel }[]
}

export default function CarreraPanel({ userName }: { userName: string }) {
  const [data, setData] = useState<CarreraData | null>(null)
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/stats/career")
      .then((r) => r.json())
      .then((d: CarreraData) => {
        setData(d)
        const key = "dupla_last_nivel"
        const lastNivel = localStorage.getItem(key)
        if (lastNivel && lastNivel !== d.nivelActual.id) {
          setLevelUpMsg(d.nivelActual.nombre)
        }
        localStorage.setItem(key, d.nivelActual.id)
      })
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] rounded-xl" style={{ background: "#0B1631" }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const { total, estesMes, estaSemana, nivelActual, nivelSiguiente, progreso } = data
  const faltanNotas = nivelSiguiente ? nivelSiguiente.desde - total : 0

  return (
    <div className="min-h-screen rounded-xl p-6 md:p-10" style={{ background: "#0B1631", color: "#fff" }}>

      {/* Banner level up */}
      {levelUpMsg && (
        <div
          className="mb-6 flex items-center gap-3 px-5 py-4 rounded-xl border"
          style={{ background: "#1a2744", borderColor: "#F2B632" }}
        >
          <span className="text-2xl">🏆</span>
          <div>
            <p className="font-titular text-xl tracking-wide" style={{ color: "#F2B632" }}>
              ¡SUBISTE DE NIVEL!
            </p>
            <p className="font-cuerpo text-sm mt-0.5" style={{ color: "#B8C2D9" }}>
              Ahora sos <strong className="text-white">{levelUpMsg}</strong>. ¡Seguí así!
            </p>
          </div>
          <button
            onClick={() => setLevelUpMsg(null)}
            className="ml-auto text-gray-400 hover:text-white text-xl leading-none"
          >×</button>
        </div>
      )}

      {/* Escudo + nivel actual */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="relative w-36 h-36 mb-4 drop-shadow-2xl">
          <Image src={nivelActual.escudo} alt={nivelActual.nombre} fill className="object-contain" />
        </div>
        <p className="font-cuerpo text-lg font-semibold text-white mb-1">{userName}</p>
        <h1 className="font-titular text-5xl tracking-widest mb-1" style={{ color: nivelActual.color }}>
          {nivelActual.nombre.toUpperCase()}
        </h1>

        {/* Barra de progreso */}
        <div className="w-full max-w-md mt-5">
          {nivelSiguiente ? (
            <>
              <div className="flex justify-between mb-1.5 font-cuerpo" style={{ fontSize: 12, color: "#B8C2D9" }}>
                <span>{nivelActual.nombre}</span>
                <span>{nivelSiguiente.nombre}</span>
              </div>
              <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "#1a2744" }}>
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(progreso * 100, 100)}%`, background: nivelActual.color }}
                />
              </div>
              <p className="font-cuerpo mt-2" style={{ color: "#B8C2D9", fontSize: 13 }}>
                Te faltan{" "}
                <strong style={{ color: "#F2B632" }}>
                  {faltanNotas} {faltanNotas === 1 ? "nota" : "notas"}
                </strong>{" "}
                para <strong className="text-white">{nivelSiguiente.nombre}</strong>
              </p>
            </>
          ) : (
            <>
              <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "#1a2744" }}>
                <div className="h-3 rounded-full" style={{ width: "100%", background: nivelActual.color }} />
              </div>
              <p className="font-cuerpo mt-2 font-semibold" style={{ color: "#F2B632", fontSize: 13 }}>
                ¡Llegaste al nivel máximo!
              </p>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
        {[
          { label: "Total", value: total },
          { label: "Este mes", value: estesMes },
          { label: "Esta semana", value: estaSemana },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center rounded-xl p-4" style={{ background: "#1a2744" }}>
            <span className="font-titular leading-none" style={{ fontSize: 44, color: "#F2B632" }}>{value}</span>
            <span className="font-cuerpo mt-1" style={{ color: "#B8C2D9", fontSize: 12 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Grid de todos los niveles */}
      <div className="mb-10">
        <h2 className="font-titular text-2xl tracking-widest text-center mb-4" style={{ color: "#B8C2D9" }}>
          TODOS LOS NIVELES
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
          {NIVELES.map((nivel) => {
            const alcanzado = total >= nivel.desde
            return (
              <div key={nivel.id} className="flex flex-col items-center gap-1">
                <div
                  className="relative w-12 h-12 transition-all duration-300"
                  style={{ opacity: alcanzado ? 1 : 0.2, filter: alcanzado ? "none" : "grayscale(1)" }}
                >
                  <Image src={nivel.escudo} alt={nivel.nombre} fill className="object-contain" />
                </div>
                <span
                  className="font-cuerpo font-semibold text-center leading-tight"
                  style={{ fontSize: 9, color: alcanzado ? nivel.color : "#B8C2D9" }}
                >
                  {nivel.nombre}
                </span>
                <span className="font-cuerpo text-center" style={{ fontSize: 9, color: "#B8C2D9" }}>
                  {nivel.desde}+
                </span>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
