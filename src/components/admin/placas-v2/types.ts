import type { Fondo, Franja } from './helpers'

export type { Fondo, Franja }

export type CommonFields = {
  foto: string
  fotoPosX: number
  fotoPosY: number
  fotoScale: number
  fondo: Fondo
  franja: Franja
}

export type EventRow = {
  id: string
  team: 1 | 2
  type: 'gol' | 'amarilla' | 'roja'
  minute: string
  player: string
}

export type PlayerRow = { num: string; name: string }

export type StatRow = { value: string; label: string }

export type RecentMatch = { id: string; result: string; competition: string }

export type TableRow = {
  id: string
  zone: '' | 'verde' | 'amarillo' | 'azul'
  escudo: string
  team: string
  pts: string
  pj: string
  pg: string
  dg: string
}

// ---- Per-template states ----

export type GolState = CommonFields & { escudo1: string; playerName: string }

export type ResultadoState = CommonFields & {
  escudo1: string; escudo2: string
  team1: string; team2: string
  score1: string; score2: string
  badge: string
  events: EventRow[]
  info: string
}

export type EntretiempoState = ResultadoState

export type ExpulsionState = CommonFields & { escudo1: string; playerName: string }

export type FraseState = CommonFields & {
  escudo1: string
  category: string
  quote: string
  attribution: string
  context: string
}

export type PreviaState = CommonFields & {
  escudo1: string; escudo2: string
  competition: string
  team1: string; team2: string
  date: string; time: string; stadium: string
}

export type NoticiaState = CommonFields & {
  category: string
  titleBebas: string
  subtitle: string
}

export type FormacionState = CommonFields & {
  competition: string
  title: string
  opponent: string
  players: PlayerRow[]  // 11 players
  dtName: string
}

export type CaraACaraState = CommonFields & {
  category: string
  historialTitle: string
  stats: StatRow[]        // 4 rows
  recentTitle: string
  recentMatches: RecentMatch[]
  note: string
}

export type FotoSitioState = {
  foto: string
  fotoPosX: number
  fotoPosY: number
  fotoScale: number
}

export type NoticiaBrasilState = CommonFields & {
  category: string
  titlePart1: string
  titleHighlight: string
}

export type TablaAnualState = CommonFields & {
  badge: string
  title: string
  rows: TableRow[]
  note: string
}

export type AnuncioState = CommonFields & {
  escudo1: string
  badge: string
  titleLine1: string
  titleHighlight: string
  personName: string
  subtitle: string
}

export type AnyState =
  | { id: '01'; data: GolState }
  | { id: '02'; data: ResultadoState }
  | { id: '03'; data: EntretiempoState }
  | { id: '04'; data: ExpulsionState }
  | { id: '05'; data: FraseState }
  | { id: '06'; data: PreviaState }
  | { id: '07'; data: NoticiaState }
  | { id: '08'; data: FormacionState }
  | { id: '09'; data: CaraACaraState }
  | { id: '10'; data: FotoSitioState }
  | { id: '11'; data: NoticiaBrasilState }
  | { id: '12'; data: TablaAnualState }
  | { id: '13'; data: AnuncioState }
