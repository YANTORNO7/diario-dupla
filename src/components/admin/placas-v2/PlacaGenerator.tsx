"use client"
import { useState, useCallback, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { toPng } from "html-to-image"
import EscudoLibrary from "./EscudoLibrary"
import {
  defaultGol, defaultResultado, defaultEntretiempo, defaultExpulsion,
  defaultFrase, defaultPrevia, defaultNoticia, defaultFormacion,
  defaultCaraACara, defaultFotoSitio, defaultNoticiaBrasil,
  defaultTablaAnual, defaultAnuncio, TEMPLATE_LIST, type TemplateId,
} from "./defaults"
import {
  render01Gol, render02ResultadoFinal, render03Entretiempo, render04Expulsion,
  render05Frase, render06Previa, render07Noticia, render08Formacion,
  render09CaraACara, render10FotoSitio, render11NoticiaBrasil,
  render12TablaAnual, render13Anuncio,
} from "./renders"
import type {
  GolState, ResultadoState, ExpulsionState, FraseState, PreviaState,
  NoticiaState, FormacionState, CaraACaraState, FotoSitioState,
  NoticiaBrasilState, TablaAnualState, AnuncioState,
  EventRow, TableRow, RecentMatch, Fondo, Franja,
} from "./types"

// ---- helpers ----
function uid() { return Math.random().toString(36).slice(2, 8) }

function readFile(file: File): Promise<string> {
  return new Promise(res => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.readAsDataURL(file)
  })
}

// ---- sub-components ----

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{children}</label>
}
function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0B1631]"
    />
  )
}
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}
function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0B1631] resize-none"
      />
    </div>
  )
}

function FotoField({
  foto, posX, posY, scale,
  onFoto, onPosX, onPosY, onScale,
}: {
  foto: string; posX: number; posY: number; scale: number
  onFoto: (v: string) => void; onPosX: (v: number) => void; onPosY: (v: number) => void; onScale: (v: number) => void
}) {
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFoto(await readFile(file))
  }
  return (
    <div className="space-y-2">
      <Label>Foto principal</Label>
      <label className="flex items-center gap-2 cursor-pointer">
        <span className="px-3 py-1.5 bg-[#0B1631] text-white rounded text-sm hover:bg-gray-800 transition-colors">
          {foto ? 'Cambiar foto' : 'Subir foto'}
        </span>
        {foto && <span className="text-xs text-green-600">✓ foto cargada</span>}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Posición X ({posX}%)</Label>
          <input type="range" min={0} max={100} value={posX} onChange={e => onPosX(+e.target.value)} className="w-full" />
        </div>
        <div>
          <Label>Posición Y ({posY}%)</Label>
          <input type="range" min={0} max={100} value={posY} onChange={e => onPosY(+e.target.value)} className="w-full" />
        </div>
      </div>
      <div>
        <Label>Zoom ({scale.toFixed(1)}x)</Label>
        <input type="range" min={100} max={200} value={Math.round(scale * 100)} onChange={e => onScale(+e.target.value / 100)} className="w-full" />
      </div>
    </div>
  )
}

function EscudoField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  const [showLib, setShowLib] = useState(false)
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onChange(await readFile(file))
  }
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        {value
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={value} alt="" className="w-10 h-10 object-contain rounded border bg-gray-100" />
          : <div className="w-10 h-10 rounded border bg-gray-100 flex items-center justify-center text-xs text-gray-400">—</div>
        }
        <button
          onClick={() => setShowLib(true)}
          className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
        >Biblioteca</button>
        <label className="px-2 py-1 border rounded text-xs hover:bg-gray-50 cursor-pointer">
          Subir
          <input type="file" accept="image/png,image/webp,image/avif" className="hidden" onChange={handleFile} />
        </label>
      </div>
      {showLib && (
        <EscudoLibrary onSelect={onChange} onClose={() => setShowLib(false)} />
      )}
    </div>
  )
}

function FondoField({ value, onChange }: { value: Fondo; onChange: (v: Fondo) => void }) {
  return (
    <div>
      <Label>Fondo</Label>
      <div className="flex gap-2">
        {([['azul', '#0B1631', 'Azul (Argentina)'], ['negro', '#111214', 'Negro (Brasil)']] as const).map(([v, color, name]) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm font-medium transition-colors ${value === v ? 'border-[#0B1631] bg-[#0B1631] text-white' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}

function FranjaField({ value, onChange }: { value: Franja; onChange: (v: Franja) => void }) {
  const options: [Franja, string, string[]][] = [
    ['4', 'ARG+BRA', ['#74ACDF', '#FFFFFF', '#009C3B', '#F2B632']],
    ['arg', 'Solo ARG', ['#74ACDF', '#FFFFFF', '#74ACDF']],
    ['bra', 'Solo BRA', ['#009C3B', '#FFDF00', '#009C3B']],
  ]
  return (
    <div>
      <Label>Franja inferior</Label>
      <div className="flex gap-2">
        {options.map(([v, name, colors]) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded border text-xs font-medium transition-colors ${value === v ? 'border-[#0B1631] bg-gray-100' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <div className="flex h-2 rounded overflow-hidden w-16">
              {colors.map((c, i) => <div key={i} style={{ background: c, flex: 1 }} />)}
            </div>
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---- Per-template forms ----

type ClubOption = { id: string; shortName: string; crestUrl: string | null }

function GolForm({ state, set }: { state: GolState; set: (s: GolState) => void }) {
  const u = (p: Partial<GolState>) => set({ ...state, ...p })
  const [clubs, setClubs] = useState<ClubOption[]>([])

  useEffect(() => {
    fetch('/api/clubs')
      .then(r => r.json())
      .then((data: ClubOption[]) => setClubs(data))
      .catch(() => {})
  }, [])

  function handleClubChange(clubId: string) {
    const club = clubs.find(c => c.id === clubId)
    u({ clubId, escudo1: club?.crestUrl || state.escudo1 })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Club</Label>
        <select
          value={state.clubId}
          onChange={e => handleClubChange(e.target.value)}
          className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0B1631]"
        >
          <option value="">Seleccionar club…</option>
          {clubs.map(c => (
            <option key={c.id} value={c.id}>{c.shortName}</option>
          ))}
        </select>
        {!state.clubId && (
          <p className="text-xs text-amber-600 mt-1">Seleccioná el club para guardar en la biblioteca.</p>
        )}
      </div>
      <FotoField foto={state.foto} posX={state.fotoPosX} posY={state.fotoPosY} scale={state.fotoScale}
        onFoto={v => u({ foto: v })} onPosX={v => u({ fotoPosX: v })} onPosY={v => u({ fotoPosY: v })} onScale={v => u({ fotoScale: v })} />
      <EscudoField label="Escudo" value={state.escudo1} onChange={v => u({ escudo1: v })} />
      <Field label="Jugador" value={state.playerName} onChange={v => u({ playerName: v })} />
      <FondoField value={state.fondo} onChange={v => u({ fondo: v })} />
      <FranjaField value={state.franja} onChange={v => u({ franja: v })} />
    </div>
  )
}

function EventosList({ events, onChange }: { events: EventRow[]; onChange: (ev: EventRow[]) => void }) {
  function add() {
    onChange([...events, { id: uid(), team: 1, type: 'gol', minute: '', player: '' }])
  }
  function remove(id: string) { onChange(events.filter(e => e.id !== id)) }
  function upd(id: string, p: Partial<EventRow>) {
    onChange(events.map(e => e.id === id ? { ...e, ...p } : e))
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Eventos (goles / tarjetas)</Label>
        <button onClick={add} className="text-xs px-2 py-1 bg-[#0B1631] text-white rounded hover:bg-gray-800">+ Agregar</button>
      </div>
      {events.map(ev => (
        <div key={ev.id} className="flex gap-1 items-center mb-1.5">
          <select value={ev.team} onChange={e => upd(ev.id, { team: +e.target.value as 1 | 2 })}
            className="border rounded px-1 py-1 text-xs">
            <option value={1}>Local</option>
            <option value={2}>Visit.</option>
          </select>
          <select value={ev.type} onChange={e => upd(ev.id, { type: e.target.value as EventRow['type'] })}
            className="border rounded px-1 py-1 text-xs">
            <option value="gol">⚽</option>
            <option value="amarilla">🟨</option>
            <option value="roja">🟥</option>
          </select>
          <input value={ev.minute} onChange={e => upd(ev.id, { minute: e.target.value })}
            placeholder="min" className="border rounded px-1 py-1 text-xs w-12" />
          <input value={ev.player} onChange={e => upd(ev.id, { player: e.target.value })}
            placeholder="Jugador" className="flex-1 border rounded px-1 py-1 text-xs" />
          <button onClick={() => remove(ev.id)} className="text-red-400 text-xs px-1">✕</button>
        </div>
      ))}
    </div>
  )
}

function ResultadoForm({ state, set }: { state: ResultadoState; set: (s: ResultadoState) => void }) {
  const u = (p: Partial<ResultadoState>) => set({ ...state, ...p })
  return (
    <div className="space-y-4">
      <FotoField foto={state.foto} posX={state.fotoPosX} posY={state.fotoPosY} scale={state.fotoScale}
        onFoto={v => u({ foto: v })} onPosX={v => u({ fotoPosX: v })} onPosY={v => u({ fotoPosY: v })} onScale={v => u({ fotoScale: v })} />
      <Field label="Badge (ej: FINAL DEL PARTIDO)" value={state.badge} onChange={v => u({ badge: v })} />
      <div className="grid grid-cols-2 gap-3">
        <EscudoField label="Escudo local" value={state.escudo1} onChange={v => u({ escudo1: v })} />
        <EscudoField label="Escudo visita" value={state.escudo2} onChange={v => u({ escudo2: v })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nombre local" value={state.team1} onChange={v => u({ team1: v })} />
        <Field label="Nombre visita" value={state.team2} onChange={v => u({ team2: v })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Goles local" value={state.score1} onChange={v => u({ score1: v })} />
        <Field label="Goles visita" value={state.score2} onChange={v => u({ score2: v })} />
      </div>
      <EventosList events={state.events} onChange={ev => u({ events: ev })} />
      <Field label="Info inferior (competición · ronda · estadio)" value={state.info} onChange={v => u({ info: v })} />
      <FondoField value={state.fondo} onChange={v => u({ fondo: v })} />
      <FranjaField value={state.franja} onChange={v => u({ franja: v })} />
    </div>
  )
}

function ExpulsionForm({ state, set }: { state: ExpulsionState; set: (s: ExpulsionState) => void }) {
  const u = (p: Partial<ExpulsionState>) => set({ ...state, ...p })
  return (
    <div className="space-y-4">
      <FotoField foto={state.foto} posX={state.fotoPosX} posY={state.fotoPosY} scale={state.fotoScale}
        onFoto={v => u({ foto: v })} onPosX={v => u({ fotoPosX: v })} onPosY={v => u({ fotoPosY: v })} onScale={v => u({ fotoScale: v })} />
      <EscudoField label="Escudo" value={state.escudo1} onChange={v => u({ escudo1: v })} />
      <Field label="Jugador" value={state.playerName} onChange={v => u({ playerName: v })} />
      <FondoField value={state.fondo} onChange={v => u({ fondo: v })} />
      <FranjaField value={state.franja} onChange={v => u({ franja: v })} />
    </div>
  )
}

function FraseForm({ state, set }: { state: FraseState; set: (s: FraseState) => void }) {
  const u = (p: Partial<FraseState>) => set({ ...state, ...p })
  return (
    <div className="space-y-4">
      <FotoField foto={state.foto} posX={state.fotoPosX} posY={state.fotoPosY} scale={state.fotoScale}
        onFoto={v => u({ foto: v })} onPosX={v => u({ fotoPosX: v })} onPosY={v => u({ fotoPosY: v })} onScale={v => u({ fotoScale: v })} />
      <EscudoField label="Escudo (esquina inferior derecha)" value={state.escudo1} onChange={v => u({ escudo1: v })} />
      <Field label="Categoría (ej: COMPETICIÓN · PARTIDO)" value={state.category} onChange={v => u({ category: v })} />
      <Textarea label="Cita" value={state.quote} onChange={v => u({ quote: v })} />
      <Field label="Nombre del jugador" value={state.attribution} onChange={v => u({ attribution: v })} />
      <Field label="Contexto (ej: · tras el partido)" value={state.context} onChange={v => u({ context: v })} />
      <FondoField value={state.fondo} onChange={v => u({ fondo: v })} />
      <FranjaField value={state.franja} onChange={v => u({ franja: v })} />
    </div>
  )
}

function PreviaForm({ state, set }: { state: PreviaState; set: (s: PreviaState) => void }) {
  const u = (p: Partial<PreviaState>) => set({ ...state, ...p })
  return (
    <div className="space-y-4">
      <FotoField foto={state.foto} posX={state.fotoPosX} posY={state.fotoPosY} scale={state.fotoScale}
        onFoto={v => u({ foto: v })} onPosX={v => u({ fotoPosX: v })} onPosY={v => u({ fotoPosY: v })} onScale={v => u({ fotoScale: v })} />
      <Field label="Competición · ronda" value={state.competition} onChange={v => u({ competition: v })} />
      <div className="grid grid-cols-2 gap-3">
        <EscudoField label="Escudo local" value={state.escudo1} onChange={v => u({ escudo1: v })} />
        <EscudoField label="Escudo visita" value={state.escudo2} onChange={v => u({ escudo2: v })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nombre local" value={state.team1} onChange={v => u({ team1: v })} />
        <Field label="Nombre visita" value={state.team2} onChange={v => u({ team2: v })} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Día / fecha" value={state.date} onChange={v => u({ date: v })} placeholder="MIÉ 14/10" />
        <Field label="Hora" value={state.time} onChange={v => u({ time: v })} placeholder="21:30" />
        <Field label="Estadio" value={state.stadium} onChange={v => u({ stadium: v })} />
      </div>
      <FondoField value={state.fondo} onChange={v => u({ fondo: v })} />
      <FranjaField value={state.franja} onChange={v => u({ franja: v })} />
    </div>
  )
}

function NoticiaForm({ state, set }: { state: NoticiaState; set: (s: NoticiaState) => void }) {
  const u = (p: Partial<NoticiaState>) => set({ ...state, ...p })
  return (
    <div className="space-y-4">
      <FotoField foto={state.foto} posX={state.fotoPosX} posY={state.fotoPosY} scale={state.fotoScale}
        onFoto={v => u({ foto: v })} onPosX={v => u({ fotoPosX: v })} onPosY={v => u({ fotoPosY: v })} onScale={v => u({ fotoScale: v })} />
      <Field label="Categoría / sección" value={state.category} onChange={v => u({ category: v })} />
      <Textarea label="Título (Bebas Neue, mayúsculas)" value={state.titleBebas} onChange={v => u({ titleBebas: v })} />
      <Textarea label="Bajada" value={state.subtitle} onChange={v => u({ subtitle: v })} />
      <FondoField value={state.fondo} onChange={v => u({ fondo: v })} />
      <FranjaField value={state.franja} onChange={v => u({ franja: v })} />
    </div>
  )
}

function FormacionForm({ state, set }: { state: FormacionState; set: (s: FormacionState) => void }) {
  const u = (p: Partial<FormacionState>) => set({ ...state, ...p })
  function updPlayer(i: number, k: 'num' | 'name', v: string) {
    const players = state.players.map((p, idx) => idx === i ? { ...p, [k]: v } : p)
    u({ players })
  }
  return (
    <div className="space-y-4">
      <FotoField foto={state.foto} posX={state.fotoPosX} posY={state.fotoPosY} scale={state.fotoScale}
        onFoto={v => u({ foto: v })} onPosX={v => u({ fotoPosX: v })} onPosY={v => u({ fotoPosY: v })} onScale={v => u({ fotoScale: v })} />
      <Field label="Competición" value={state.competition} onChange={v => u({ competition: v })} />
      <Field label="Título (ej: EL 11 DE BOCA)" value={state.title} onChange={v => u({ title: v })} />
      <Field label="Rival (ej: VS. VASCO DA GAMA)" value={state.opponent} onChange={v => u({ opponent: v })} />
      <div>
        <Label>Jugadores (11)</Label>
        <div className="space-y-1">
          {state.players.map((p, i) => (
            <div key={i} className="flex gap-1.5">
              <input value={p.num} onChange={e => updPlayer(i, 'num', e.target.value)}
                placeholder="#" className="border rounded px-1 py-1 text-xs w-12" />
              <input value={p.name} onChange={e => updPlayer(i, 'name', e.target.value)}
                placeholder="Nombre" className="flex-1 border rounded px-1 py-1 text-xs" />
            </div>
          ))}
        </div>
      </div>
      <Field label="DT (nombre)" value={state.dtName} onChange={v => u({ dtName: v })} />
      <FondoField value={state.fondo} onChange={v => u({ fondo: v })} />
      <FranjaField value={state.franja} onChange={v => u({ franja: v })} />
    </div>
  )
}

function CaraACaraForm({ state, set }: { state: CaraACaraState; set: (s: CaraACaraState) => void }) {
  const u = (p: Partial<CaraACaraState>) => set({ ...state, ...p })
  function updStat(i: number, k: 'value' | 'label', v: string) {
    const stats = state.stats.map((s, idx) => idx === i ? { ...s, [k]: v } : s)
    u({ stats })
  }
  function addMatch() { u({ recentMatches: [...state.recentMatches, { id: uid(), result: '', competition: '' }] }) }
  function removeMatch(id: string) { u({ recentMatches: state.recentMatches.filter(m => m.id !== id) }) }
  function updMatch(id: string, k: keyof RecentMatch, v: string) {
    u({ recentMatches: state.recentMatches.map(m => m.id === id ? { ...m, [k]: v } : m) })
  }
  return (
    <div className="space-y-4">
      <FotoField foto={state.foto} posX={state.fotoPosX} posY={state.fotoPosY} scale={state.fotoScale}
        onFoto={v => u({ foto: v })} onPosX={v => u({ fotoPosX: v })} onPosY={v => u({ fotoPosY: v })} onScale={v => u({ fotoScale: v })} />
      <Field label="Categoría (ej: FLUMINENSE VS PALMEIRAS)" value={state.category} onChange={v => u({ category: v })} />
      <Field label="Título historial" value={state.historialTitle} onChange={v => u({ historialTitle: v })} />
      <div>
        <Label>Estadísticas</Label>
        <div className="space-y-1">
          {state.stats.map((s, i) => (
            <div key={i} className="flex gap-1.5">
              <input value={s.value} onChange={e => updStat(i, 'value', e.target.value)}
                placeholder="0" className="border rounded px-1 py-1 text-xs w-16" />
              <input value={s.label} onChange={e => updStat(i, 'label', e.target.value)}
                placeholder="Etiqueta" className="flex-1 border rounded px-1 py-1 text-xs" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label>Últimos partidos</Label>
          <button onClick={addMatch} className="text-xs px-2 py-0.5 bg-[#0B1631] text-white rounded hover:bg-gray-800">+</button>
        </div>
        {state.recentMatches.map(m => (
          <div key={m.id} className="flex gap-1 items-center mt-1">
            <div className="flex-1 space-y-0.5">
              <input value={m.result} onChange={e => updMatch(m.id, 'result', e.target.value)}
                placeholder="EQUIPO A 0-0 EQUIPO B" className="w-full border rounded px-1 py-0.5 text-xs" />
              <input value={m.competition} onChange={e => updMatch(m.id, 'competition', e.target.value)}
                placeholder="Competición 2026 · 01/01" className="w-full border rounded px-1 py-0.5 text-xs" />
            </div>
            <button onClick={() => removeMatch(m.id)} className="text-red-400 text-xs px-1">✕</button>
          </div>
        ))}
      </div>
      <Field label="Nota al pie" value={state.note} onChange={v => u({ note: v })} placeholder="opcional" />
      <FondoField value={state.fondo} onChange={v => u({ fondo: v })} />
      <FranjaField value={state.franja} onChange={v => u({ franja: v })} />
    </div>
  )
}

function FotoSitioForm({ state, set }: { state: FotoSitioState; set: (s: FotoSitioState) => void }) {
  const u = (p: Partial<FotoSitioState>) => set({ ...state, ...p })
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Foto para el sitio — 1170×658 px, sin logo ni textos.</p>
      <FotoField foto={state.foto} posX={state.fotoPosX} posY={state.fotoPosY} scale={state.fotoScale}
        onFoto={v => u({ foto: v })} onPosX={v => u({ fotoPosX: v })} onPosY={v => u({ fotoPosY: v })} onScale={v => u({ fotoScale: v })} />
    </div>
  )
}

function NoticiaBrasilForm({ state, set }: { state: NoticiaBrasilState; set: (s: NoticiaBrasilState) => void }) {
  const u = (p: Partial<NoticiaBrasilState>) => set({ ...state, ...p })
  return (
    <div className="space-y-4">
      <FotoField foto={state.foto} posX={state.fotoPosX} posY={state.fotoPosY} scale={state.fotoScale}
        onFoto={v => u({ foto: v })} onPosX={v => u({ fotoPosX: v })} onPosY={v => u({ fotoPosY: v })} onScale={v => u({ fotoScale: v })} />
      <Field label="Categoría / sección" value={state.category} onChange={v => u({ category: v })} />
      <Textarea label="Inicio del título (texto blanco)" value={state.titlePart1} onChange={v => u({ titlePart1: v })} />
      <Field label="Final del título (texto amarillo)" value={state.titleHighlight} onChange={v => u({ titleHighlight: v })} />
      <FondoField value={state.fondo} onChange={v => u({ fondo: v })} />
      <FranjaField value={state.franja} onChange={v => u({ franja: v })} />
    </div>
  )
}

function TablaAnualForm({ state, set }: { state: TablaAnualState; set: (s: TablaAnualState) => void }) {
  const u = (p: Partial<TablaAnualState>) => set({ ...state, ...p })
  const [showLib, setShowLib] = useState<number | null>(null)

  function addRow() {
    u({ rows: [...state.rows, { id: uid(), zone: '', escudo: '', team: 'EQUIPO', pts: '0', pj: '0', pg: '0', dg: '0' }] })
  }
  function removeRow(id: string) { u({ rows: state.rows.filter(r => r.id !== id) }) }
  function updRow(id: string, p: Partial<TableRow>) {
    u({ rows: state.rows.map(r => r.id === id ? { ...r, ...p } : r) })
  }
  async function handleEscudoFile(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) updRow(id, { escudo: await readFile(file) })
  }

  const ZONES: [TableRow['zone'], string][] = [
    ['verde', '🟢 Lib. grupos'],
    ['amarillo', '🟡 Lib. previa'],
    ['azul', '🔵 Suda'],
    ['', '—'],
  ]
  return (
    <div className="space-y-4">
      <FotoField foto={state.foto} posX={state.fotoPosX} posY={state.fotoPosY} scale={state.fotoScale}
        onFoto={v => u({ foto: v })} onPosX={v => u({ fotoPosX: v })} onPosY={v => u({ fotoPosY: v })} onScale={v => u({ fotoScale: v })} />
      <Field label="Badge (ej: TORNEO CLAUSURA · FECHA 13)" value={state.badge} onChange={v => u({ badge: v })} />
      <Field label="Título tabla" value={state.title} onChange={v => u({ title: v })} />
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label>Equipos</Label>
          <button onClick={addRow} className="text-xs px-2 py-0.5 bg-[#0B1631] text-white rounded hover:bg-gray-800">+ Fila</button>
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {state.rows.map((row, i) => (
            <div key={row.id} className="flex gap-1 items-center">
              <span className="text-xs text-gray-400 w-4">{i + 1}</span>
              {/* Escudo */}
              <div className="relative">
                {row.escudo
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={row.escudo} alt="" className="w-6 h-6 object-contain border rounded bg-gray-50 cursor-pointer"
                      onClick={() => setShowLib(i)} />
                  : <button onClick={() => setShowLib(i)} className="w-6 h-6 border rounded bg-gray-100 text-xs text-gray-400 flex items-center justify-center hover:bg-gray-200">+</button>
                }
              </div>
              <select value={row.zone} onChange={e => updRow(row.id, { zone: e.target.value as TableRow['zone'] })}
                className="border rounded px-0.5 py-0.5 text-xs">
                {ZONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <input value={row.team} onChange={e => updRow(row.id, { team: e.target.value })}
                className="flex-1 border rounded px-1 py-0.5 text-xs min-w-0" placeholder="Equipo" />
              <input value={row.pts} onChange={e => updRow(row.id, { pts: e.target.value })}
                className="border rounded px-1 py-0.5 text-xs w-9" placeholder="Pts" />
              <input value={row.pj} onChange={e => updRow(row.id, { pj: e.target.value })}
                className="border rounded px-1 py-0.5 text-xs w-9" placeholder="PJ" />
              <input value={row.pg} onChange={e => updRow(row.id, { pg: e.target.value })}
                className="border rounded px-1 py-0.5 text-xs w-9" placeholder="PG" />
              <input value={row.dg} onChange={e => updRow(row.id, { dg: e.target.value })}
                className="border rounded px-1 py-0.5 text-xs w-9" placeholder="DG" />
              <button onClick={() => removeRow(row.id)} className="text-red-400 text-xs">✕</button>
            </div>
          ))}
        </div>
      </div>
      <Field label="Nota al pie" value={state.note} onChange={v => u({ note: v })} placeholder="opcional" />
      <FranjaField value={state.franja} onChange={v => u({ franja: v })} />
      <FondoField value={state.fondo} onChange={v => u({ fondo: v })} />
      {showLib !== null && (
        <EscudoLibrary
          onSelect={url => {
            if (showLib !== null) updRow(state.rows[showLib].id, { escudo: url })
            setShowLib(null)
          }}
          onClose={() => setShowLib(null)}
        />
      )}
    </div>
  )
}

function AnuncioForm({ state, set }: { state: AnuncioState; set: (s: AnuncioState) => void }) {
  const u = (p: Partial<AnuncioState>) => set({ ...state, ...p })
  return (
    <div className="space-y-4">
      <FotoField foto={state.foto} posX={state.fotoPosX} posY={state.fotoPosY} scale={state.fotoScale}
        onFoto={v => u({ foto: v })} onPosX={v => u({ fotoPosX: v })} onPosY={v => u({ fotoPosY: v })} onScale={v => u({ fotoScale: v })} />
      <EscudoField label="Escudo" value={state.escudo1} onChange={v => u({ escudo1: v })} />
      <Field label="Badge (ej: CORINTHIANS · BRASILEIRÃO)" value={state.badge} onChange={v => u({ badge: v })} />
      <Field label="Título parte 1 (blanco)" value={state.titleLine1} onChange={v => u({ titleLine1: v })} />
      <Field label="Título parte 2 (amarillo)" value={state.titleHighlight} onChange={v => u({ titleHighlight: v })} />
      <Field label="Nombre de la persona" value={state.personName} onChange={v => u({ personName: v })} />
      <Field label="Subtítulo" value={state.subtitle} onChange={v => u({ subtitle: v })} />
      <FondoField value={state.fondo} onChange={v => u({ fondo: v })} />
      <FranjaField value={state.franja} onChange={v => u({ franja: v })} />
    </div>
  )
}

// ---- State union ----
type AllStates = {
  '01': GolState; '02': ResultadoState; '03': ResultadoState; '04': ExpulsionState
  '05': FraseState; '06': PreviaState; '07': NoticiaState; '08': FormacionState
  '09': CaraACaraState; '10': FotoSitioState; '11': NoticiaBrasilState
  '12': TablaAnualState; '13': AnuncioState
}

function getDefault(id: TemplateId): AllStates[typeof id] {
  const map: Record<TemplateId, () => unknown> = {
    '01': defaultGol, '02': defaultResultado, '03': defaultEntretiempo, '04': defaultExpulsion,
    '05': defaultFrase, '06': defaultPrevia, '07': defaultNoticia, '08': defaultFormacion,
    '09': defaultCaraACara, '10': defaultFotoSitio, '11': defaultNoticiaBrasil,
    '12': defaultTablaAnual, '13': defaultAnuncio,
  }
  return map[id]() as AllStates[typeof id]
}

function renderHtml(id: TemplateId, state: unknown): string {
  const map: Record<TemplateId, (s: unknown) => string> = {
    '01': s => render01Gol(s as GolState),
    '02': s => render02ResultadoFinal(s as ResultadoState),
    '03': s => render03Entretiempo(s as ResultadoState),
    '04': s => render04Expulsion(s as ExpulsionState),
    '05': s => render05Frase(s as FraseState),
    '06': s => render06Previa(s as PreviaState),
    '07': s => render07Noticia(s as NoticiaState),
    '08': s => render08Formacion(s as FormacionState),
    '09': s => render09CaraACara(s as CaraACaraState),
    '10': s => render10FotoSitio(s as FotoSitioState),
    '11': s => render11NoticiaBrasil(s as NoticiaBrasilState),
    '12': s => render12TablaAnual(s as TablaAnualState),
    '13': s => render13Anuncio(s as AnuncioState),
  }
  return map[id](state)
}

function getDimensions(id: TemplateId): [number, number] {
  return id === '10' ? [1170, 658] : [1080, 1350]
}

// ---- Inline external images as base64 to avoid CORS issues in html-to-image ----
async function inlineImages(html: string): Promise<string> {
  const regex = /src="(https?:\/\/[^"]+)"/g
  const urls = [...new Set([...html.matchAll(regex)].map(m => m[1]))]
  if (!urls.length) return html
  const replacements = await Promise.all(
    urls.map(async (url): Promise<[string, string]> => {
      try {
        const res = await fetch(url, { mode: 'cors' })
        if (!res.ok) return [url, url]
        const blob = await res.blob()
        return new Promise<[string, string]>(resolve => {
          const reader = new FileReader()
          reader.onload = () => resolve([url, reader.result as string])
          reader.onerror = () => resolve([url, url])
          reader.readAsDataURL(blob)
        })
      } catch {
        return [url, url]
      }
    })
  )
  let result = html
  for (const [url, dataUrl] of replacements) {
    result = result.replaceAll(`src="${url}"`, `src="${dataUrl}"`)
  }
  return result
}

// ---- Download on desktop, Web Share on mobile ----
async function downloadOrShare(dataUrl: string, filename: string) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  if (isMobile && typeof navigator.share === 'function') {
    try {
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], filename, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
        return
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      // fall through to regular download
    }
  }
  const a = document.createElement('a')
  a.download = filename
  a.href = dataUrl
  a.click()
}

// ---- Export function ----
async function exportPng(html: string, w: number, h: number): Promise<string> {
  const inlinedHtml = await inlineImages(html)
  return new Promise<string>((resolve, reject) => {
    const iframe = document.createElement('iframe')
    iframe.style.cssText = `position:fixed;left:-${w + 100}px;top:0;width:${w}px;height:${h}px;border:none;`
    document.body.appendChild(iframe)
    iframe.srcdoc = inlinedHtml
    iframe.onload = async () => {
      try {
        await (iframe.contentDocument as Document).fonts.ready
        await new Promise(r => setTimeout(r, 300))
        const el = (iframe.contentDocument as Document).body.querySelector('div') as HTMLElement
        const dataUrl = await toPng(el, { width: w, height: h, pixelRatio: 1 })
        resolve(dataUrl)
      } catch (err) {
        reject(err)
      } finally {
        document.body.removeChild(iframe)
      }
    }
  })
}

// ---- Upload helper (data URL → Vercel Blob via /api/upload) ----
async function uploadDataUrl(dataUrl: string, filename: string): Promise<string> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const file = new File([blob], filename, { type: blob.type })
  const formData = new FormData()
  formData.append('file', file)
  formData.append('skipOptimize', 'true')
  const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!uploadRes.ok) throw new Error('Error al subir imagen')
  const data = await uploadRes.json()
  return data.url as string
}

type DuplicateModal = {
  existingId: string
  existingVersion: number
  fotoUrl: string
  escudoUrl: string
  imageUrl: string
  state: GolState
}

// ---- Main component ----
export default function PlacaGenerator() {
  const searchParams = useSearchParams()
  const golId = searchParams.get('golId')

  const [templateId, setTemplateId] = useState<TemplateId>('01')
  const [stateMap, setStateMap] = useState<Partial<Record<TemplateId, unknown>>>({
    '01': defaultGol(),
  })
  const [exporting, setExporting] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [savedNotification, setSavedNotification] = useState('')
  const [duplicateModal, setDuplicateModal] = useState<DuplicateModal | null>(null)

  // Load GolPlaca for editing (when golId query param is present)
  useEffect(() => {
    if (!golId) return
    fetch(`/api/gol-placas/${golId}`)
      .then(r => r.json())
      .then(placa => {
        if (!placa?.id) return
        const golState: GolState = {
          foto: placa.fotoUrl,
          fotoPosX: placa.fotoPosX,
          fotoPosY: placa.fotoPosY,
          fotoScale: placa.fotoScale,
          fondo: placa.fondo as GolState['fondo'],
          franja: placa.franja as GolState['franja'],
          escudo1: placa.escudoUrl,
          playerName: placa.playerName,
          clubId: placa.clubId,
        }
        setTemplateId('01')
        setStateMap(prev => ({ ...prev, '01': golState }))
        setPreviewKey(k => k + 1)
      })
      .catch(() => {})
  }, [golId])

  const currentState = stateMap[templateId] ?? getDefault(templateId)
  const html = renderHtml(templateId, currentState)
  const [w, h] = getDimensions(templateId)

  function setTemplate(id: TemplateId) {
    setTemplateId(id)
    if (!stateMap[id]) {
      setStateMap(prev => ({ ...prev, [id]: getDefault(id) }))
    }
  }

  function setState(newState: unknown) {
    setStateMap(prev => ({ ...prev, [templateId]: newState }))
    setPreviewKey(k => k + 1)
  }

  async function saveGolToDb(
    state: GolState,
    fotoUrl: string, escudoUrl: string, imageUrl: string,
    mode: 'create' | 'replace' | 'new-version',
    existingId?: string,
    existingVersion?: number,
  ) {
    if (mode === 'replace' && existingId) {
      await fetch(`/api/gol-placas/${existingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fotoUrl, escudoUrl, imageUrl, ...state }),
      })
    } else {
      const version = mode === 'new-version' ? (existingVersion ?? 1) + 1 : 1
      await fetch('/api/gol-placas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: state.playerName,
          clubId: state.clubId,
          fotoUrl, escudoUrl, imageUrl,
          fotoPosX: state.fotoPosX, fotoPosY: state.fotoPosY, fotoScale: state.fotoScale,
          fondo: state.fondo, franja: state.franja,
          version,
        }),
      })
    }
    setSavedNotification('Placa guardada en la biblioteca.')
    setTimeout(() => setSavedNotification(''), 4000)
  }

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const tpl = TEMPLATE_LIST.find(t => t.id === templateId)!
      const filename = `dupla-${tpl.id}-${tpl.label.toLowerCase().replace(/\s+/g, '-')}.png`
      const pngDataUrl = await exportPng(html, w, h)
      await downloadOrShare(pngDataUrl, filename)

      // Save Gol placa when club is selected and photo is loaded
      if (templateId === '01') {
        const golState = currentState as GolState
        if (golState.clubId && golState.foto) {
          try {
            // Upload foto (data URL → Blob) or keep if already a URL
            const fotoUrl = golState.foto.startsWith('data:')
              ? await uploadDataUrl(golState.foto, 'foto.jpg')
              : golState.foto
            // Upload escudo if it's a data URL
            const escudoUrl = golState.escudo1.startsWith('data:')
              ? await uploadDataUrl(golState.escudo1, 'escudo.png')
              : golState.escudo1
            // Upload PNG
            const imageUrl = await uploadDataUrl(pngDataUrl, 'gol-placa.png')

            // Check for existing placa (same player + club)
            const checkRes = await fetch(
              `/api/gol-placas?clubId=${golState.clubId}&playerName=${encodeURIComponent(golState.playerName)}`
            )
            const existing: { id: string; version: number }[] = await checkRes.json()

            if (existing.length > 0 && !golId) {
              // Show duplicate modal
              setDuplicateModal({
                existingId: existing[0].id,
                existingVersion: existing[0].version,
                fotoUrl, escudoUrl, imageUrl,
                state: golState,
              })
            } else if (golId) {
              // Editing an existing placa → replace directly
              await saveGolToDb(golState, fotoUrl, escudoUrl, imageUrl, 'replace', golId)
            } else {
              // No duplicate → save automatically
              await saveGolToDb(golState, fotoUrl, escudoUrl, imageUrl, 'create')
            }
          } catch (saveErr) {
            console.warn('Error al guardar en biblioteca:', saveErr)
            // Don't block the download for save errors
          }
        }
      }
    } catch (e) {
      console.error('Export error:', e)
      alert('Error al exportar. Intentá de nuevo.')
    } finally {
      setExporting(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, w, h, templateId, currentState, golId])

  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0.38)

  useEffect(() => {
    const container = previewContainerRef.current
    if (!container) return
    const update = () => {
      const availableW = container.clientWidth - 16
      const maxScale = w === 1170 ? 0.45 : 0.5
      setPreviewScale(Math.min(availableW / w, maxScale))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(container)
    return () => observer.disconnect()
  }, [w])

  function renderForm() {
    const props = { state: currentState, set: setState }
    switch (templateId) {
      case '01': return <GolForm {...props as Parameters<typeof GolForm>[0]} />
      case '02': return <ResultadoForm {...props as Parameters<typeof ResultadoForm>[0]} />
      case '03': return <ResultadoForm {...props as Parameters<typeof ResultadoForm>[0]} />
      case '04': return <ExpulsionForm {...props as Parameters<typeof ExpulsionForm>[0]} />
      case '05': return <FraseForm {...props as Parameters<typeof FraseForm>[0]} />
      case '06': return <PreviaForm {...props as Parameters<typeof PreviaForm>[0]} />
      case '07': return <NoticiaForm {...props as Parameters<typeof NoticiaForm>[0]} />
      case '08': return <FormacionForm {...props as Parameters<typeof FormacionForm>[0]} />
      case '09': return <CaraACaraForm {...props as Parameters<typeof CaraACaraForm>[0]} />
      case '10': return <FotoSitioForm {...props as Parameters<typeof FotoSitioForm>[0]} />
      case '11': return <NoticiaBrasilForm {...props as Parameters<typeof NoticiaBrasilForm>[0]} />
      case '12': return <TablaAnualForm {...props as Parameters<typeof TablaAnualForm>[0]} />
      case '13': return <AnuncioForm {...props as Parameters<typeof AnuncioForm>[0]} />
      default: return null
    }
  }

  const currentTpl = TEMPLATE_LIST.find(t => t.id === templateId)!

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Saved notification */}
      {savedNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {savedNotification}
        </div>
      )}

      {/* Duplicate modal */}
      {duplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="font-bold text-sm">Ya existe una placa para este jugador</h3>
            <p className="text-sm text-gray-600">
              Ya hay una placa de <strong>{duplicateModal.state.playerName}</strong> en este club. ¿Qué querés hacer?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  await saveGolToDb(
                    duplicateModal.state, duplicateModal.fotoUrl, duplicateModal.escudoUrl, duplicateModal.imageUrl,
                    'replace', duplicateModal.existingId
                  )
                  setDuplicateModal(null)
                }}
                className="w-full py-2 bg-[#0B1631] text-white text-sm rounded-lg hover:bg-gray-800"
              >
                Reemplazar la placa existente
              </button>
              <button
                onClick={async () => {
                  await saveGolToDb(
                    duplicateModal.state, duplicateModal.fotoUrl, duplicateModal.escudoUrl, duplicateModal.imageUrl,
                    'new-version', duplicateModal.existingId, duplicateModal.existingVersion
                  )
                  setDuplicateModal(null)
                }}
                className="w-full py-2 border border-[#0B1631] text-[#0B1631] text-sm rounded-lg hover:bg-gray-50"
              >
                Guardar como versión {duplicateModal.existingVersion + 1}
              </button>
              <button
                onClick={() => setDuplicateModal(null)}
                className="w-full py-2 text-gray-400 text-sm hover:text-gray-600"
              >
                No guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template selector */}
      <div className="bg-white border-b px-4 py-2 flex gap-1.5 overflow-x-auto">
        {TEMPLATE_LIST.map(t => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${templateId === t.id ? 'bg-[#0B1631] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <span className="text-base leading-none">{t.emoji}</span>
            <span className="whitespace-nowrap">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 p-4">
        {/* Form panel */}
        <div className="w-full lg:w-96 lg:flex-shrink-0 bg-white rounded-xl shadow-sm border p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)]">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm">{currentTpl.emoji} {currentTpl.label}</h2>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-1.5 bg-[#F2B632] text-[#0B1631] font-bold text-sm rounded-lg hover:bg-yellow-400 disabled:opacity-50 transition-colors"
            >
              {exporting ? 'Exportando…' : 'Descargar PNG'}
            </button>
          </div>
          {renderForm()}
        </div>

        {/* Preview panel */}
        <div ref={previewContainerRef} className="flex-1 flex flex-col items-center gap-2 mt-4 lg:mt-0 w-full">
          <p className="text-xs text-gray-400">{w}×{h}px — vista previa</p>
          <div
            style={{
              width: Math.round(w * previewScale),
              height: Math.round(h * previewScale),
              overflow: 'hidden',
              position: 'relative',
              borderRadius: 8,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            }}
          >
            <iframe
              key={previewKey}
              srcDoc={html}
              style={{
                width: w,
                height: h,
                border: 'none',
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              title="Vista previa"
            />
          </div>
          <button
            onClick={() => setPreviewKey(k => k + 1)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Refrescar vista previa
          </button>
        </div>
      </div>
    </div>
  )
}
