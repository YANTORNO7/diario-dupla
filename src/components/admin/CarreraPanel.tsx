"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { NIVELES, type Nivel } from "@/lib/niveles"

type CarreraData = {
  total: number
  estesMes: number
  estaSemana: number
  avatarUrl: string | null
  nivelActual: Nivel
  nivelSiguiente: Nivel | null
  progreso: number
  ranking: { userId: string; name: string; avatarUrl: string | null; notasMes: number; nivel: Nivel }[]
}

export default function CarreraPanel({ userName }: { userName: string }) {
  const [data, setData] = useState<CarreraData | null>(null)
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const { url } = await res.json()
      if (!url) throw new Error("Sin URL")
      const patch = await fetch("/api/admin/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      })
      if (!patch.ok) throw new Error("Error al guardar")
      setData((prev) => prev ? { ...prev, avatarUrl: url } : prev)
    } catch {
      alert("Error al subir foto. Intentá de nuevo.")
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] rounded-xl" style={{ background: "#0B1631" }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const { total, estesMes, estaSemana, avatarUrl, nivelActual, nivelSiguiente, progreso } = data
  const faltanNotas = nivelSiguiente ? nivelSiguiente.desde - total : 0

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

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

      {/* Avatar + escudo + nivel */}
      <div className="flex flex-col items-center text-center mb-10">

        {/* Avatar circular */}
        <div className="relative mb-5 group">
          <div
            className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center border-4"
            style={{ borderColor: nivelActual.color, background: "#1a2744" }}
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt={userName} fill className="object-cover rounded-full" />
            ) : (
              <span className="font-titular text-3xl" style={{ color: nivelActual.color }}>
                {initials}
              </span>
            )}
          </div>

          {/* Botón cambiar foto */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-opacity"
            style={{ background: "#F2B632", color: "#000" }}
            title="Cambiar foto"
          >
            {uploadingAvatar ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin block" />
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        {/* Nombre */}
        <p className="font-cuerpo text-lg font-semibold text-white mb-4">{userName}</p>

        {/* Escudo */}
        <div className="relative w-32 h-32 mb-3 drop-shadow-2xl">
          <Image src={nivelActual.escudo} alt={nivelActual.nombre} fill className="object-contain" />
        </div>

        {/* Nombre del nivel */}
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

      {/* Ranking del mes */}
      {data.ranking.length > 0 && (
        <div className="mb-10 max-w-lg mx-auto">
          <h2 className="font-titular text-2xl tracking-widest text-center mb-4" style={{ color: "#B8C2D9" }}>
            RANKING DEL MES
          </h2>
          <div className="rounded-xl overflow-hidden" style={{ background: "#1a2744" }}>
            {data.ranking.map((entry, i) => {
              const medals = ["🥇", "🥈", "🥉"]
              const initials2 = entry.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
              return (
                <div
                  key={entry.userId}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                  style={{ borderColor: "#0B1631" }}
                >
                  <span className="font-titular text-xl w-6 text-center" style={{ color: "#B8C2D9" }}>
                    {medals[i] ?? `${i + 1}`}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border-2"
                    style={{ borderColor: entry.nivel.color, background: "#0B1631" }}
                  >
                    {entry.avatarUrl ? (
                      <Image src={entry.avatarUrl} alt={entry.name} width={32} height={32} className="object-cover w-full h-full" />
                    ) : (
                      <span className="font-titular text-xs" style={{ color: entry.nivel.color }}>{initials2}</span>
                    )}
                  </div>
                  <div className="relative w-6 h-6 flex-shrink-0">
                    <Image src={entry.nivel.escudo} alt={entry.nivel.nombre} fill className="object-contain" />
                  </div>
                  <span className="font-cuerpo text-sm flex-1 text-white truncate">{entry.name}</span>
                  <span className="font-titular text-lg" style={{ color: "#F2B632" }}>{entry.notasMes}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Grid de todos los niveles */}
      <div className="mb-10">
        <h2 className="font-titular text-2xl tracking-widest text-center mb-4" style={{ color: "#B8C2D9" }}>
          TODOS LOS NIVELES
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {NIVELES.map((nivel) => {
            const alcanzado = total >= nivel.desde
            const esCurrent = nivel.id === nivelActual.id
            return (
              <div
                key={nivel.id}
                className="flex flex-col items-center gap-1 rounded-lg p-2 transition-all"
                style={{
                  background: esCurrent ? `${nivelActual.color}22` : "transparent",
                  outline: esCurrent ? `1.5px solid ${nivelActual.color}` : "none",
                }}
              >
                <div
                  className="relative w-11 h-11 transition-all duration-300"
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
