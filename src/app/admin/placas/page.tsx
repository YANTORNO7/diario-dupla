"use client"

import { useState, useEffect, useCallback } from "react"
import ResultCard from "@/components/admin/placas/ResultCard"
import PreviewCard from "@/components/admin/placas/PreviewCard"
import TransferCard from "@/components/admin/placas/TransferCard"
import ResultForm from "@/components/admin/placas/ResultForm"
import PreviewForm from "@/components/admin/placas/PreviewForm"
import TransferForm from "@/components/admin/placas/TransferForm"
import { toPng } from "html-to-image"
import { useRef } from "react"

const STORAGE_KEY = "dupla-placas-state"

function loadSaved<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed[key] ?? fallback
  } catch {
    return fallback
  }
}

function saveState(data: Record<string, unknown>) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }))
  } catch { /* ignore */ }
}

export type Club = {
  id: string
  name: string
  shortName: string
  initials: string
  primaryColor: string
  secondaryColor: string
  league: string
  crestUrl: string | null
}

export const COMPETITIONS = [
  { id: "lpa", label: "Liga Profesional Argentina" },
  { id: "brasileirao", label: "Brasileirão" },
  { id: "libertadores", label: "Copa Libertadores" },
  { id: "sudamericana", label: "Copa Sudamericana" },
  { id: "copa-arg", label: "Copa Argentina" },
  { id: "copa-bra", label: "Copa do Brasil" },
] as const

export const ROUNDS = [
  { id: "fecha", label: "Fecha" },
  { id: "grupos", label: "Fase de grupos" },
  { id: "16avos", label: "16avos de final" },
  { id: "octavos", label: "Octavos de final" },
  { id: "cuartos", label: "Cuartos de final" },
  { id: "semi-ida", label: "Semifinal - Ida" },
  { id: "semi-vuelta", label: "Semifinal - Vuelta" },
  { id: "semi", label: "Semifinal" },
  { id: "final", label: "Final" },
] as const

export type ResultData = {
  homeClub: Club | null
  awayClub: Club | null
  homeScore: number
  awayScore: number
  competition: string
  round: string
  matchday: string
  matchDate: string
  homeScorers: string
  awayScorers: string
  photoUrl: string
}

export type PreviewData = {
  homeClub: Club | null
  awayClub: Club | null
  competition: string
  round: string
  matchday: string
  matchDate: string
  matchTime: string
  stadium: string
  photoUrl: string
}

export type TransferData = {
  playerName: string
  fromClub: Club | null
  toClub: Club | null
  transferType: "COMPRA" | "PRESTAMO" | "LIBRE"
  details: string
  photoUrl: string
}

const CARD_TYPES = [
  { id: "result", label: "Resultado" },
  { id: "preview", label: "Previa" },
  { id: "transfer", label: "Fichaje" },
] as const

type CardType = (typeof CARD_TYPES)[number]["id"]

export default function PlacasPage() {
  const [cardType, setCardType] = useState<CardType>(() => loadSaved("cardType", "result" as CardType))
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [aiContext, setAiContext] = useState("")
  const [aiCaption, setAiCaption] = useState("")
  const [generatingCaption, setGeneratingCaption] = useState(false)

  const defaultResult: ResultData = {
    homeClub: null,
    awayClub: null,
    homeScore: 0,
    awayScore: 0,
    competition: "lpa",
    round: "fecha",
    matchday: "1",
    matchDate: new Date().toISOString().slice(0, 10),
    homeScorers: "",
    awayScorers: "",
    photoUrl: "",
  }

  const defaultPreview: PreviewData = {
    homeClub: null,
    awayClub: null,
    competition: "lpa",
    round: "fecha",
    matchday: "1",
    matchDate: new Date().toISOString().slice(0, 10),
    matchTime: "21:00",
    stadium: "",
    photoUrl: "",
  }

  const defaultTransfer: TransferData = {
    playerName: "",
    fromClub: null,
    toClub: null,
    transferType: "COMPRA",
    details: "",
    photoUrl: "",
  }

  const [resultData, setResultData] = useState<ResultData>(() => loadSaved("resultData", defaultResult))
  const [previewData, setPreviewData] = useState<PreviewData>(() => loadSaved("previewData", defaultPreview))
  const [transferData, setTransferData] = useState<TransferData>(() => loadSaved("transferData", defaultTransfer))

  // Persist state to localStorage
  const handleSetCardType = useCallback((type: CardType) => {
    setCardType(type)
    saveState({ cardType: type })
  }, [])

  const handleSetResultData = useCallback((data: ResultData) => {
    setResultData(data)
    saveState({ resultData: data })
  }, [])

  const handleSetPreviewData = useCallback((data: PreviewData) => {
    setPreviewData(data)
    saveState({ previewData: data })
  }, [])

  const handleSetTransferData = useCallback((data: TransferData) => {
    setTransferData(data)
    saveState({ transferData: data })
  }, [])

  function handleClear() {
    if (cardType === "result") handleSetResultData({ ...defaultResult, matchDate: new Date().toISOString().slice(0, 10) })
    if (cardType === "preview") handleSetPreviewData({ ...defaultPreview, matchDate: new Date().toISOString().slice(0, 10) })
    if (cardType === "transfer") handleSetTransferData({ ...defaultTransfer })
    setAiContext("")
    setAiCaption("")
  }

  async function handleDownload() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: 1350,
        pixelRatio: 1,
        cacheBust: true,
      })
      const link = document.createElement("a")
      link.download = `dupla-${cardType}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Error generating image:", err)
    } finally {
      setDownloading(false)
    }
  }

  function getCaption(): string {
    if (cardType === "result" && resultData.homeClub && resultData.awayClub) {
      const winner =
        resultData.homeScore > resultData.awayScore
          ? resultData.homeClub.shortName
          : resultData.awayScore > resultData.homeScore
            ? resultData.awayClub.shortName
            : null
      const score = `${resultData.homeClub.shortName} ${resultData.homeScore} - ${resultData.awayScore} ${resultData.awayClub.shortName}`
      const result = winner ? `Victoria de ${winner}` : "Empate"
      return `${result} | ${score}\n${resultData.competition}\n\n#futbol #${resultData.homeClub.shortName.replace(/\s/g, "")} #${resultData.awayClub.shortName.replace(/\s/g, "")}\n\n@diariodupla.ar`
    }
    if (cardType === "preview" && previewData.homeClub && previewData.awayClub) {
      const compLabel = COMPETITIONS.find((c) => c.id === previewData.competition)?.label || previewData.competition
      return `${previewData.homeClub.shortName} vs ${previewData.awayClub.shortName}\n${compLabel} | ${previewData.matchDate} ${previewData.matchTime}hs\n${previewData.stadium ? `Estadio: ${previewData.stadium}` : ""}\n\n#futbol #${previewData.homeClub.shortName.replace(/\s/g, "")} #${previewData.awayClub.shortName.replace(/\s/g, "")}\n\n@diariodupla.ar`
    }
    if (cardType === "transfer" && transferData.playerName) {
      const type =
        transferData.transferType === "COMPRA"
          ? "Nuevo refuerzo"
          : transferData.transferType === "PRESTAMO"
            ? "Llega a préstamo"
            : "Llega como agente libre"
      return `${type}: ${transferData.playerName}\n${transferData.toClub ? `Se suma a ${transferData.toClub.shortName}` : ""}${transferData.fromClub ? ` desde ${transferData.fromClub.shortName}` : ""}\n${transferData.details}\n\n#fichaje #futbol\n\n@diariodupla.ar`
    }
    return ""
  }

  function copyCaption(text?: string) {
    navigator.clipboard.writeText(text || getCaption())
  }

  async function handleGenerateCaption() {
    setGeneratingCaption(true)
    setAiCaption("")

    let body: Record<string, unknown> = { context: aiContext, type: cardType }

    if (cardType === "result") {
      const competitionLabel = COMPETITIONS.find((c) => c.id === resultData.competition)?.label || resultData.competition
      const roundLabel = resultData.round === "fecha"
        ? `Fecha ${resultData.matchday}`
        : ROUNDS.find((r) => r.id === resultData.round)?.label || resultData.round
      body.matchData = {
        homeTeam: resultData.homeClub?.shortName || "Local",
        awayTeam: resultData.awayClub?.shortName || "Visitante",
        homeScore: resultData.homeScore,
        awayScore: resultData.awayScore,
        competition: competitionLabel,
        round: roundLabel,
        matchDate: resultData.matchDate,
      }
    } else if (cardType === "preview") {
      const competitionLabel = COMPETITIONS.find((c) => c.id === previewData.competition)?.label || previewData.competition
      const roundLabel = previewData.round === "fecha"
        ? `Fecha ${previewData.matchday}`
        : ROUNDS.find((r) => r.id === previewData.round)?.label || previewData.round
      body.matchData = {
        homeTeam: previewData.homeClub?.shortName || "Local",
        awayTeam: previewData.awayClub?.shortName || "Visitante",
        competition: competitionLabel,
        round: roundLabel,
        matchDate: previewData.matchDate,
        matchTime: previewData.matchTime,
        stadium: previewData.stadium,
      }
    } else if (cardType === "transfer") {
      body.transferData = {
        playerName: transferData.playerName,
        fromClub: transferData.fromClub?.shortName || "",
        toClub: transferData.toClub?.shortName || "",
        transferType: transferData.transferType,
        details: transferData.details,
      }
    }

    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setAiCaption(`Error: ${data.error}`)
      } else {
        setAiCaption(data.caption)
      }
    } catch {
      setAiCaption("Error de conexión al generar el caption")
    } finally {
      setGeneratingCaption(false)
    }
  }

  function getLeaguesForCard(): { home: string; away: string } {
    if (cardType === "result") {
      return {
        home: resultData.homeClub?.league || "ARGENTINA",
        away: resultData.awayClub?.league || "ARGENTINA",
      }
    }
    if (cardType === "preview") {
      return {
        home: previewData.homeClub?.league || "ARGENTINA",
        away: previewData.awayClub?.league || "ARGENTINA",
      }
    }
    return {
      home: transferData.fromClub?.league || transferData.toClub?.league || "ARGENTINA",
      away: transferData.toClub?.league || transferData.fromClub?.league || "ARGENTINA",
    }
  }

  function getLeagueForCard(): string {
    const { home } = getLeaguesForCard()
    return home
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-cuerpo mb-6">
        Placas para Instagram
      </h1>

      <div className="flex gap-2 mb-6">
        {CARD_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => handleSetCardType(type.id)}
            className={`px-4 py-2 rounded-md text-sm font-cuerpo transition-colors ${
              cardType === type.id
                ? "bg-negro text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-4">
          {cardType === "result" && (
            <ResultForm data={resultData} onChange={handleSetResultData} />
          )}
          {cardType === "preview" && (
            <PreviewForm data={previewData} onChange={handleSetPreviewData} />
          )}
          {cardType === "transfer" && (
            <TransferForm data={transferData} onChange={handleSetTransferData} />
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-negro text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-cuerpo text-sm disabled:opacity-50 flex-1"
            >
              {downloading ? "Generando..." : "Descargar PNG"}
            </button>
            <button
              onClick={handleClear}
              className="border border-gray-300 text-gray-500 px-4 py-3 rounded-md hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors font-cuerpo text-sm"
            >
              Limpiar
            </button>
          </div>

          {/* AI Caption generator */}
          {((cardType === "result" && resultData.homeClub && resultData.awayClub) ||
            (cardType === "preview" && previewData.homeClub && previewData.awayClub) ||
            (cardType === "transfer" && transferData.playerName && transferData.toClub)) && (
            <div className="border rounded-lg p-4 mt-4 space-y-3">
              <span className="text-sm font-cuerpo font-bold text-gray-600">
                Caption con IA
              </span>
              <textarea
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                placeholder={
                  cardType === "result"
                    ? "Contame sobre el partido... ej: gol en el último minuto, remontada épica (opcional)"
                    : cardType === "preview"
                      ? "Contame algo sobre la previa... ej: clásico histórico, partido clave (opcional)"
                      : "Contame algo sobre el fichaje... ej: gran refuerzo, pedido del DT (opcional)"
                }
                rows={2}
                className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm resize-none"
              />
              <button
                onClick={handleGenerateCaption}
                disabled={generatingCaption}
                className="w-full bg-verde text-white px-4 py-2 rounded-md text-sm font-cuerpo font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generatingCaption ? "Generando..." : "Generar caption con IA"}
              </button>
              {aiCaption && (
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-cuerpo font-bold text-verde">
                      Caption generado
                    </span>
                    <button
                      onClick={() => copyCaption(aiCaption)}
                      className="text-xs font-cuerpo text-verde hover:underline"
                    >
                      Copiar
                    </button>
                  </div>
                  <textarea
                    value={aiCaption}
                    onChange={(e) => setAiCaption(e.target.value)}
                    rows={6}
                    className="w-full border rounded-md px-3 py-2 font-cuerpo text-sm resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Caption básico */}
          {getCaption() && (
            <div className="border rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-cuerpo font-bold text-gray-600">
                  Caption básico
                </span>
                <button
                  onClick={() => copyCaption()}
                  className="text-xs font-cuerpo text-celeste hover:underline"
                >
                  Copiar
                </button>
              </div>
              <pre className="text-sm font-cuerpo text-gray-700 whitespace-pre-wrap">
                {getCaption()}
              </pre>
            </div>
          )}
        </div>

        {/* Preview */}
        <div>
          <p className="text-sm font-cuerpo text-gray-500 mb-3">
            Vista previa (1080 × 1350)
          </p>
          <div
            className="border rounded-lg overflow-hidden bg-gray-100"
            style={{
              width: Math.round(1080 * 0.333),
              height: Math.round(1350 * 0.333),
              position: "relative",
            }}
          >
            <div
              style={{
                width: 1080,
                height: 1350,
                transform: "scale(0.333)",
                transformOrigin: "top left",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              <div
                ref={cardRef}
                style={{ width: 1080, height: 1350 }}
              >
                {cardType === "result" && (
                  <ResultCard data={resultData} league={getLeagueForCard()} leagues={getLeaguesForCard()} />
                )}
                {cardType === "preview" && (
                  <PreviewCard data={previewData} league={getLeagueForCard()} leagues={getLeaguesForCard()} />
                )}
                {cardType === "transfer" && (
                  <TransferCard data={transferData} league={getLeagueForCard()} leagues={getLeaguesForCard()} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
