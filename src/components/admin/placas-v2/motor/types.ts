export type MotorPilot = {
  piloto: string      // apellido (uppercase)
  pais: string        // emoji flag
  equipo: string      // team display name
  teamId: string      // from teams.ts
  panelColor: string  // defaults to team color
  foto: string        // data URL or empty
  fotoPosX: number    // 0–100
  fotoPosY: number    // 0–100
  fotoScale: number   // 1–2
  puntos: string      // optional (used in M1)
}

export type MotorRow = {
  id: string
  pos: string
  piloto: string
  equipo: string
  equipoColor: string
  puntos: string
}

export type GrillaRow = {
  id: string
  pos: string
  piloto: string
  equipo: string
  equipoColor: string
  tiempo: string
}

export type MotorColors = {
  bgColor: string
  accentColor: string
}

// M1 — Resultado de carrera con podio
export type M1State = MotorColors & {
  fecha: string
  gp: string
  categoria: string
  p1: MotorPilot
  p2: MotorPilot
  p3: MotorPilot
  rows: MotorRow[]
}

// M2 — Piloto destacado (GANADOR / POLE / SANCIÓN / ABANDONO / etc.)
export type M2State = MotorColors & {
  variante: string
  palabraGigante: string
  piloto: string
  equipo: string
  teamId: string
  panelColor: string
  lineaDatos: string
  foto: string
  fotoPosX: number
  fotoPosY: number
  fotoScale: number
}

// M3 — El más rápido (sesión)
export type M3State = MotorColors & {
  sesion: string
  p1: MotorPilot
}

// M4 — Los más rápidos (top 3 sesión)
export type M4State = MotorColors & {
  sesion: string
  p1: MotorPilot
  p2: MotorPilot
  p3: MotorPilot
}

// M5 — Grilla de largada
export type M5State = MotorColors & {
  categoria: string
  gp: string
  circuito: string
  fecha: string
  destacado: string   // pilot name to highlight
  rows: GrillaRow[]
}
