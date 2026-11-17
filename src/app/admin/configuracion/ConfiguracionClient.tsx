"use client"

import { useState, useEffect, useCallback } from "react"

type PtMode = "off" | "admin" | "public"
type UsageData = { used: number; limit: number; pct: number; warn: boolean; blocked: boolean }
type GlossaryTerm = { id: string; esWord: string; ptWord: string; type: string }

export default function ConfiguracionClient() {
  // ── PT Mode ──────────────────────────────────────────────────────────────
  const [ptMode, setPtMode] = useState<PtMode>("off")
  const [ptModeSaving, setPtModeSaving] = useState(false)
  const [ptModeMsg, setPtModeMsg] = useState("")

  // ── Usage ─────────────────────────────────────────────────────────────────
  const [usage, setUsage] = useState<UsageData | null>(null)

  // ── Glossary ──────────────────────────────────────────────────────────────
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([])
  const [newEs, setNewEs] = useState("")
  const [newPt, setNewPt] = useState("")
  const [newType, setNewType] = useState<"GLOSSARY" | "NO_TRANSLATE">("GLOSSARY")
  const [glossaryMsg, setGlossaryMsg] = useState("")

  // ── Batch ─────────────────────────────────────────────────────────────────
  const [batchRunning, setBatchRunning] = useState(false)
  const [batchResult, setBatchResult] = useState<{ translated: number; errors: string[] } | null>(null)

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    const [configRes, usageRes, glossaryRes] = await Promise.all([
      fetch("/api/admin/site-config?key=pt_mode"),
      fetch("/api/admin/translation-usage"),
      fetch("/api/admin/glossary"),
    ])
    if (configRes.ok) {
      const data = await configRes.json()
      setPtMode((data.value as PtMode) ?? "off")
    }
    if (usageRes.ok) setUsage(await usageRes.json())
    if (glossaryRes.ok) setGlossary(await glossaryRes.json())
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function savePtMode() {
    setPtModeSaving(true)
    setPtModeMsg("")
    const res = await fetch("/api/admin/site-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "pt_mode", value: ptMode }),
    })
    setPtModeSaving(false)
    setPtModeMsg(res.ok ? "Guardado" : "Error al guardar")
    setTimeout(() => setPtModeMsg(""), 3000)
  }

  async function addGlossaryTerm() {
    if (!newEs.trim() || !newPt.trim()) return
    setGlossaryMsg("")
    const res = await fetch("/api/admin/glossary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ esWord: newEs.trim(), ptWord: newPt.trim(), type: newType }),
    })
    if (res.ok) {
      setNewEs(""); setNewPt("")
      await loadAll()
      setGlossaryMsg("Término agregado")
    } else {
      const d = await res.json()
      setGlossaryMsg(d.error || "Error")
    }
    setTimeout(() => setGlossaryMsg(""), 3000)
  }

  async function deleteGlossaryTerm(id: string) {
    if (!confirm("¿Eliminar este término?")) return
    await fetch(`/api/admin/glossary/${id}`, { method: "DELETE" })
    await loadAll()
  }

  async function runBatch() {
    setBatchRunning(true)
    setBatchResult(null)
    const res = await fetch("/api/admin/translate/batch", { method: "POST" })
    const data = await res.json()
    setBatchResult(data)
    setBatchRunning(false)
    await loadAll()
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl space-y-10">
      <h1 className="font-titular text-3xl">Configuración</h1>

      {/* ── Versión en portugués ── */}
      <section className="border rounded-lg p-6 space-y-4">
        <h2 className="font-titular text-xl">Versión en portugués</h2>
        <p className="text-sm text-gray-500 font-cuerpo">
          Controla quién puede ver las páginas <code>/pt/</code>.
        </p>
        <div className="flex flex-wrap gap-3">
          {(["off", "admin", "public"] as PtMode[]).map((mode) => (
            <label key={mode} className="flex items-center gap-2 cursor-pointer font-cuerpo text-sm">
              <input
                type="radio"
                name="ptMode"
                value={mode}
                checked={ptMode === mode}
                onChange={() => setPtMode(mode)}
                className="accent-[#111111]"
              />
              {mode === "off"    && "Apagado"}
              {mode === "admin"  && "Solo admin"}
              {mode === "public" && "Público"}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={savePtMode}
            disabled={ptModeSaving}
            className="px-4 py-2 bg-[#111111] text-white rounded text-sm font-cuerpo hover:bg-gray-800 disabled:opacity-50"
          >
            {ptModeSaving ? "Guardando..." : "Guardar"}
          </button>
          {ptModeMsg && <span className="text-sm font-cuerpo text-green-600">{ptModeMsg}</span>}
        </div>
      </section>

      {/* ── Uso de traducción ── */}
      <section className="border rounded-lg p-6 space-y-4">
        <h2 className="font-titular text-xl">Uso de traducción DeepL (período actual)</h2>
        {usage ? (
          <>
            <div className="flex items-center gap-4">
              <span className="font-cuerpo text-sm">
                {usage.used.toLocaleString()} / {usage.limit.toLocaleString()} chars ({usage.pct}%)
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usage.pct >= 80 ? "bg-yellow-400" : "bg-green-500"}`}
                style={{ width: `${Math.min(usage.pct, 100)}%` }}
              />
            </div>
            {usage.warn && !usage.blocked && (
              <p className="text-sm font-cuerpo text-yellow-600">
                ⚠ Uso por encima del 80%. Traducción bloqueada al llegar al límite.
              </p>
            )}
            {usage.blocked && (
              <p className="text-sm font-cuerpo text-red-600">
                ✗ Límite del período alcanzado. Traducción bloqueada hasta el próximo ciclo (día 14).
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400 font-cuerpo">Cargando…</p>
        )}
      </section>

      {/* ── Traducción en lote ── */}
      <section className="border rounded-lg p-6 space-y-4">
        <h2 className="font-titular text-xl">Traducción en lote</h2>
        <p className="text-sm text-gray-500 font-cuerpo">
          Traduce hasta 10 artículos publicados que aún no tienen versión en portugués.
        </p>
        <button
          onClick={runBatch}
          disabled={batchRunning}
          className="px-4 py-2 bg-[#111111] text-white rounded text-sm font-cuerpo hover:bg-gray-800 disabled:opacity-50"
        >
          {batchRunning ? "Traduciendo…" : "Traducir artículos sin traducción"}
        </button>
        {batchResult && (
          <div className="text-sm font-cuerpo space-y-1">
            <p className="text-green-600">✓ {batchResult.translated} artículos traducidos</p>
            {batchResult.errors.length > 0 && (
              <ul className="text-red-600 list-disc list-inside">
                {batchResult.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* ── Glosario ── */}
      <section className="border rounded-lg p-6 space-y-4">
        <h2 className="font-titular text-xl">Glosario</h2>
        <p className="text-sm text-gray-500 font-cuerpo">
          <strong>GLOSSARY</strong>: reemplaza la palabra ES por la PT.{" "}
          <strong>NO_TRANSLATE</strong>: mantiene la palabra original sin traducir.
        </p>

        {/* Add term */}
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-cuerpo">Español</label>
            <input
              value={newEs}
              onChange={(e) => setNewEs(e.target.value)}
              placeholder="ej: hincha"
              className="border rounded px-2 py-1.5 text-sm font-cuerpo focus:outline-none focus:ring-1 focus:ring-[#111111]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-cuerpo">Português</label>
            <input
              value={newPt}
              onChange={(e) => setNewPt(e.target.value)}
              placeholder="ej: torcedor"
              className="border rounded px-2 py-1.5 text-sm font-cuerpo focus:outline-none focus:ring-1 focus:ring-[#111111]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-cuerpo">Tipo</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as "GLOSSARY" | "NO_TRANSLATE")}
              className="border rounded px-2 py-1.5 text-sm font-cuerpo focus:outline-none focus:ring-1 focus:ring-[#111111]"
            >
              <option value="GLOSSARY">GLOSSARY</option>
              <option value="NO_TRANSLATE">NO_TRANSLATE</option>
            </select>
          </div>
          <button
            onClick={addGlossaryTerm}
            className="px-3 py-1.5 bg-[#111111] text-white rounded text-sm font-cuerpo hover:bg-gray-800"
          >
            Agregar
          </button>
          {glossaryMsg && <span className="text-sm font-cuerpo text-green-600">{glossaryMsg}</span>}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-cuerpo border-collapse">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 pr-4">Español</th>
                <th className="py-2 pr-4">Português</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {glossary.map((term) => (
                <tr key={term.id} className="border-b hover:bg-gray-50">
                  <td className="py-1.5 pr-4">{term.esWord}</td>
                  <td className="py-1.5 pr-4">{term.ptWord}</td>
                  <td className="py-1.5 pr-4">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      term.type === "NO_TRANSLATE"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {term.type}
                    </span>
                  </td>
                  <td className="py-1.5">
                    <button
                      onClick={() => deleteGlossaryTerm(term.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {glossary.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400">Sin términos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
