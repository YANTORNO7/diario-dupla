"use client"

import { useEffect, useRef, useState } from "react"
import { toPng } from "html-to-image"

type ReportSummary = {
  id: string
  type: "weekly" | "monthly"
  title: string
  periodStart: string
  periodEnd: string
  createdAt: string
}

type ReportFull = ReportSummary & { htmlContent: string }

function getCycleWeeks(): { label: string; monday: string }[] {
  const pad = (n: number) => String(n).padStart(2, "0")
  // Fecha actual en ART (UTC-3)
  const nowART = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const artDay = nowART.getUTCDate()
  let cycleYear = nowART.getUTCFullYear()
  let cycleMonth = nowART.getUTCMonth() + 1
  if (artDay < 10) {
    cycleMonth--
    if (cycleMonth === 0) { cycleMonth = 12; cycleYear-- }
  }
  // Inicio del ciclo: día 10 a las 00:00 ART = 03:00 UTC
  const cycleStart = new Date(Date.UTC(cycleYear, cycleMonth - 1, 10, 3, 0, 0, 0))
  const dow = cycleStart.getUTCDay()
  const daysToMonday = dow === 1 ? 0 : dow === 0 ? 1 : 8 - dow
  let monday = new Date(cycleStart.getTime() + daysToMonday * 24 * 60 * 60 * 1000)

  const weeks: { label: string; monday: string }[] = []
  let weekNum = 1
  while (monday.getTime() <= nowART.getTime()) {
    const nextMonday = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000)
    weeks.push({
      label: `Semana ${weekNum} · ${pad(monday.getUTCDate())}/${pad(monday.getUTCMonth() + 1)} — ${pad(nextMonday.getUTCDate())}/${pad(nextMonday.getUTCMonth() + 1)}`,
      monday: `${monday.getUTCFullYear()}-${pad(monday.getUTCMonth() + 1)}-${pad(monday.getUTCDate())}`,
    })
    monday = nextMonday
    weekNum++
  }
  return weeks
}

export default function ReportsTab() {
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<ReportFull | null>(null)
  const [generating, setGenerating] = useState<"weekly" | "monthly" | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Controles de período manual
  const [weeklyDate, setWeeklyDate] = useState("")     // "YYYY-MM-DD" (lunes)
  const [monthlyMonth, setMonthlyMonth] = useState("") // "YYYY-MM"

  async function loadReports() {
    setLoading(true)
    const res = await fetch("/api/admin/reports")
    const data = await res.json()
    setReports(data)
    setLoading(false)
  }

  useEffect(() => { loadReports() }, [])

  async function viewReport(id: string) {
    const res = await fetch(`/api/admin/reports/${id}`)
    const data = await res.json()
    setViewing(data)
  }

  async function deleteReport(id: string) {
    if (!confirm("¿Eliminar este informe?")) return
    await fetch(`/api/admin/reports/${id}`, { method: "DELETE" })
    setReports(r => r.filter(x => x.id !== id))
    if (viewing?.id === id) setViewing(null)
  }

  async function generate(type: "weekly" | "monthly") {
    setGenerating(type)
    try {
      let body: object = { type }

      if (type === "weekly" && weeklyDate) {
        // weeklyDate es el lunes en hora local → convertir a UTC
        const monday = new Date(weeklyDate + "T03:00:00.000Z") // ART 00:00 = UTC 03:00
        const sunday = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
        body = { type, periodStart: monday.toISOString(), periodEnd: sunday.toISOString() }
      } else if (type === "monthly" && monthlyMonth) {
        const [y, m] = monthlyMonth.split("-").map(Number)
        const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate()
        const start = new Date(Date.UTC(y, m - 1, 1, 3, 0, 0))
        const end   = new Date(Date.UTC(y, m - 1, lastDay + 1, 2, 59, 59, 999))
        body = { type, periodStart: start.toISOString(), periodEnd: end.toISOString() }
      }

      const res = await fetch("/api/admin/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) { alert("Error al generar el informe"); return }
      await loadReports()
    } finally {
      setGenerating(null)
    }
  }

  async function captureReport(): Promise<string> {
    if (!viewing) throw new Error("Sin informe")

    // Renderizar en el documento actual: html-to-image accede a las fuentes sin restricciones
    const parser = new DOMParser()
    const reportDoc = parser.parseFromString(viewing.htmlContent, "text/html")

    const container = document.createElement("div")
    container.style.cssText = "position:fixed;left:0;top:0;width:800px;background:#fff;font-family:'Archivo',Arial,sans-serif;color:#1a1a1a;z-index:-9999;pointer-events:none"
    container.innerHTML = reportDoc.body.innerHTML
    document.body.appendChild(container)

    // Cargar fuentes base64 en el documento actual y esperar cada FontFace
    try {
      const fontCSS = await fetch("/api/font-embed").then(r => r.text())
      if (fontCSS && fontCSS.length > 5000) {
        const s = document.createElement("style")
        s.textContent = fontCSS
        document.head.appendChild(s)
        // Dos frames para que el browser parsee el <style> y registre los FontFace
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
        await Promise.all([...document.fonts.values()].map(f => f.load().catch(() => {})))
      }
    } catch { /* usar fallback */ }

    await new Promise(r => setTimeout(r, 300))

    const w = container.scrollWidth
    const h = container.scrollHeight
    const dataUrl = await toPng(container, { pixelRatio: 2, backgroundColor: "#ffffff", width: w, height: h })

    document.body.removeChild(container)
    return dataUrl
  }

  async function downloadPNG() {
    if (!viewing) return
    try {
      const dataUrl = await captureReport()
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `${viewing.title}.png`
      a.click()
    } catch (e) {
      alert("Error al generar PNG: " + String(e))
    }
  }

  async function downloadPDF() {
    if (!viewing) return
    try {
      const dataUrl = await captureReport()
      const { default: jsPDF } = await import("jspdf")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfW = pdf.internal.pageSize.getWidth()
      const img = new Image()
      img.src = dataUrl
      await new Promise(r => { img.onload = r })
      const pdfH = (img.height * pdfW) / img.width
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfW, pdfH)
      pdf.save(`${viewing.title}.pdf`)
    } catch (e) {
      alert("Error al generar PDF: " + String(e))
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const weeklyReports = reports.filter(r => r.type === "weekly")
  const monthlyReports = reports.filter(r => r.type === "monthly")

  return (
    <div className="space-y-6 font-cuerpo">
      {/* Botones de generación */}
      <div className="flex flex-wrap gap-4 bg-white border rounded-lg p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">Semanal:</span>
          <select
            value={weeklyDate}
            onChange={e => setWeeklyDate(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="">Semana pasada (auto)</option>
            {getCycleWeeks().map(w => (
              <option key={w.monday} value={w.monday}>{w.label}</option>
            ))}
          </select>
          <button
            onClick={() => generate("weekly")}
            disabled={generating === "weekly"}
            className="bg-[#0B1631] text-white text-xs px-3 py-1.5 rounded hover:bg-[#1a2c52] disabled:opacity-50"
          >
            {generating === "weekly" ? "Generando..." : "Generar semanal"}
          </button>
        </div>
        <div className="w-full h-px bg-gray-100" />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">Mensual:</span>
          <input
            type="month"
            value={monthlyMonth}
            onChange={e => setMonthlyMonth(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          />
          <span className="text-xs text-gray-400">(vacío = mes anterior)</span>
          <button
            onClick={() => generate("monthly")}
            disabled={generating === "monthly"}
            className="bg-[#0B1631] text-white text-xs px-3 py-1.5 rounded hover:bg-[#1a2c52] disabled:opacity-50"
          >
            {generating === "monthly" ? "Generando..." : "Generar mensual"}
          </button>
        </div>
      </div>

      {/* Visor de informe */}
      {viewing && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div>
              <span className="font-semibold text-sm">{viewing.title}</span>
              <span className="ml-2 text-xs text-gray-500">Generado {formatDate(viewing.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={downloadPNG} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">
                Descargar PNG
              </button>
              <button onClick={downloadPDF} className="text-xs bg-green-700 text-white px-3 py-1.5 rounded hover:bg-green-800">
                Descargar PDF
              </button>
              <button onClick={() => setViewing(null)} className="text-xs text-gray-500 hover:text-gray-800 ml-2">
                ✕ Cerrar
              </button>
            </div>
          </div>
          <div className="overflow-auto" style={{ maxHeight: "70vh" }}>
            <iframe
              ref={iframeRef}
              srcDoc={viewing.htmlContent}
              style={{ width: "800px", minHeight: "600px", border: "none", display: "block" }}
              onLoad={() => {
                const iframe = iframeRef.current
                if (!iframe?.contentDocument?.body) return
                const h = iframe.contentDocument.body.scrollHeight
                iframe.style.height = `${h + 20}px`
              }}
            />
          </div>
        </div>
      )}

      {/* Listas de informes */}
      {loading ? (
        <div className="text-center py-8 text-gray-500 text-sm">Cargando...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm bg-white border rounded-lg">
          No hay informes generados todavía. Usá los botones de arriba para generar el primero.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Semanales */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Semanales ({weeklyReports.length})</h3>
            <div className="space-y-2">
              {weeklyReports.map(r => (
                <div key={r.id} className="bg-white border rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#0B1631]">{r.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Generado {formatDate(r.createdAt)}</div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button onClick={() => viewReport(r.id)} className="text-xs text-blue-600 hover:underline">Ver</button>
                    <button onClick={() => deleteReport(r.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mensuales */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Mensuales ({monthlyReports.length})</h3>
            <div className="space-y-2">
              {monthlyReports.map(r => (
                <div key={r.id} className="bg-white border rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#0B1631]">{r.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Generado {formatDate(r.createdAt)}</div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button onClick={() => viewReport(r.id)} className="text-xs text-blue-600 hover:underline">Ver</button>
                    <button onClick={() => deleteReport(r.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
