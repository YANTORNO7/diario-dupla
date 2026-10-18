import type {
  GolState, ResultadoState, ExpulsionState, FraseState, PreviaState,
  NoticiaState, FormacionState, CaraACaraState, FotoSitioState,
  NoticiaBrasilState, TablaAnualState, AnuncioState
} from './types'

const common = {
  foto: '', fotoPosX: 50, fotoPosY: 50, fotoScale: 1, fondo: 'azul' as const, franja: '4' as const,
}
const commonNegro = { ...common, fondo: 'negro' as const }

function uid() { return Math.random().toString(36).slice(2, 8) }

export function defaultGol(): GolState {
  return { ...common, escudo1: '', playerName: 'NOMBRE DEL JUGADOR', clubId: '' }
}
export function defaultResultado(): ResultadoState {
  return {
    ...common,
    escudo1: '', escudo2: '',
    team1: 'LOCAL', team2: 'VISITANTE',
    score1: '0', score2: '0',
    badge: 'FINAL DEL PARTIDO',
    events: [],
    info: 'COMPETICIÓN · RONDA · ESTADIO',
  }
}
export function defaultEntretiempo(): ResultadoState {
  return { ...defaultResultado(), badge: 'FINAL DEL PRIMER TIEMPO' }
}
export function defaultExpulsion(): ExpulsionState {
  return { ...commonNegro, escudo1: '', playerName: 'NOMBRE DEL JUGADOR' }
}
export function defaultFrase(): FraseState {
  return {
    ...common,
    escudo1: '',
    category: 'COMPETICIÓN · PARTIDO',
    quote: 'Escribí aquí la cita del jugador.',
    attribution: 'NOMBRE DEL JUGADOR',
    context: '· fuente de la declaración',
  }
}
export function defaultPrevia(): PreviaState {
  return {
    ...commonNegro,
    escudo1: '', escudo2: '',
    competition: 'COMPETICIÓN · RONDA',
    team1: 'LOCAL', team2: 'VISITANTE',
    date: 'DÍA DD/MM', time: '00:00', stadium: 'ESTADIO',
  }
}
export function defaultNoticia(): NoticiaState {
  return {
    ...common,
    category: 'SECCIÓN · EQUIPO',
    titleBebas: 'EL TÍTULO DE LA NOTICIA VA AQUÍ',
    subtitle: 'Bajada opcional de la nota.',
  }
}
export function defaultFormacion(): FormacionState {
  return {
    ...common,
    competition: 'COMPETICIÓN · RONDA',
    title: 'EL 11 DE',
    opponent: 'VS. RIVAL',
    players: [
      { num: '1', name: 'Portero' },
      { num: '2', name: 'Defensor derecho' },
      { num: '3', name: 'Defensor izquierdo' },
      { num: '4', name: 'Defensor central' },
      { num: '5', name: 'Mediocampista' },
      { num: '6', name: 'Mediocampista' },
      { num: '7', name: 'Mediocampista' },
      { num: '8', name: 'Mediocampista' },
      { num: '9', name: 'Delantero centro' },
      { num: '10', name: 'Mediapunta' },
      { num: '11', name: 'Extremo' },
    ],
    dtName: 'Entrenador',
  }
}
export function defaultCaraACara(): CaraACaraState {
  return {
    ...commonNegro,
    category: 'EQUIPO 1 VS EQUIPO 2',
    historialTitle: 'HISTORIAL TOTAL',
    stats: [
      { value: '0', label: 'PARTIDOS' },
      { value: '0', label: 'GANÓ EQUIPO 1' },
      { value: '0', label: 'GANÓ EQUIPO 2' },
      { value: '0', label: 'EMPATES' },
    ],
    recentTitle: 'LOS ÚLTIMOS 5',
    recentMatches: [
      { id: uid(), result: 'EQUIPO A 0-0 EQUIPO B', competition: 'Competición 2026 · 01/01' },
      { id: uid(), result: 'EQUIPO B 0-0 EQUIPO A', competition: 'Competición 2026 · 01/02' },
      { id: uid(), result: 'EQUIPO A 0-0 EQUIPO B', competition: 'Competición 2025 · 01/03' },
    ],
    note: '',
  }
}
export function defaultFotoSitio(): FotoSitioState {
  return { foto: '', fotoPosX: 50, fotoPosY: 50, fotoScale: 1 }
}
export function defaultNoticiaBrasil(): NoticiaBrasilState {
  return {
    ...common,
    category: 'SECCIÓN · CONTEXTO',
    titlePart1: 'EL TÍTULO PRINCIPAL ',
    titleHighlight: 'DESTACADO',
  }
}
export function defaultTablaAnual(): TablaAnualState {
  function row(team: string): import('./types').TableRow {
    return { id: uid(), zone: '', escudo: '', team, pts: '0', pj: '0', pg: '0', dg: '0' }
  }
  return {
    ...common,
    badge: 'TORNEO · FECHA',
    title: 'TABLA ANUAL 2026',
    rows: [
      { ...row('EQUIPO 1'), zone: 'verde' },
      { ...row('EQUIPO 2'), zone: 'verde' },
      { ...row('EQUIPO 3'), zone: 'amarillo' },
      { ...row('EQUIPO 4'), zone: 'azul' },
      { ...row('EQUIPO 5'), zone: 'azul' },
    ],
    note: '',
  }
}
export function defaultAnuncio(): AnuncioState {
  return {
    ...commonNegro,
    escudo1: '',
    badge: 'EQUIPO · COMPETICIÓN',
    titleLine1: 'TÍTULO',
    titleHighlight: 'DESTACADO',
    personName: 'NOMBRE',
    subtitle: 'Subtítulo o descripción de la noticia',
  }
}

export const TEMPLATE_LIST = [
  { id: '01', label: 'Gol', emoji: '⚽' },
  { id: '02', label: 'Resultado final', emoji: '🏁' },
  { id: '03', label: 'Entretiempo', emoji: '⏸️' },
  { id: '04', label: 'Expulsión', emoji: '🟥' },
  { id: '05', label: 'Frase', emoji: '💬' },
  { id: '06', label: 'Previa', emoji: '📅' },
  { id: '07', label: 'Noticia', emoji: '📰' },
  { id: '08', label: 'Formación', emoji: '📋' },
  { id: '09', label: 'Cara a cara', emoji: '⚔️' },
  { id: '10', label: 'Foto sitio', emoji: '🖼️' },
  { id: '11', label: 'Noticia Brasil', emoji: '🇧🇷' },
  { id: '12', label: 'Tabla anual', emoji: '📊' },
  { id: '13', label: 'Anuncio', emoji: '📢' },
] as const

export type TemplateId = typeof TEMPLATE_LIST[number]['id']
