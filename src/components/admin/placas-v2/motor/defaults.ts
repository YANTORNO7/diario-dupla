import type { M1State, M2State, M3State, M4State, M5State, MotorPilot, MotorRow, GrillaRow } from './types'

function uid() { return Math.random().toString(36).slice(2, 8) }

export const MOTOR_DEFAULT_BG = '#0E0F13'
export const MOTOR_DEFAULT_ACCENT = '#E10600'

const MOTOR_COLORS = { bgColor: MOTOR_DEFAULT_BG, accentColor: MOTOR_DEFAULT_ACCENT }

export function defaultMotorPilot(panelColor = '#E8002D', puntos = '0'): MotorPilot {
  return {
    piloto: 'APELLIDO',
    pais: '🇦🇷',
    equipo: 'Equipo',
    teamId: '',
    panelColor,
    foto: '',
    fotoPosX: 50,
    fotoPosY: 20,
    fotoScale: 1,
    puntos,
  }
}

function defaultRow(pos: string, pts = '0'): MotorRow {
  return {
    id: uid(),
    pos,
    piloto: `PILOTO ${pos}`,
    equipo: 'EQUIPO',
    equipoColor: '#E10600',
    puntos: pts,
  }
}

function defaultGrillaRow(pos: string): GrillaRow {
  const n = parseInt(pos)
  // Alternate team colors for visual variety in defaults
  const colors = ['#3671C6','#3671C6','#E8002D','#E8002D','#27F4D2','#27F4D2','#FF8000','#FF8000','#229971','#229971',
                  '#0093CC','#0093CC','#64C4FF','#64C4FF','#B6BABD','#B6BABD','#52E252','#52E252','#6692FF','#6692FF']
  const teams = ['Red Bull','Red Bull','Ferrari','Ferrari','Mercedes','Mercedes','McLaren','McLaren','Aston Martin','Aston Martin',
                 'Alpine','Alpine','Williams','Williams','Haas','Haas','Cadillac','Cadillac','Racing Bulls','Racing Bulls']
  return {
    id: uid(),
    pos,
    piloto: `PILOTO ${pos}`,
    equipo: teams[n - 1] ?? 'EQUIPO',
    equipoColor: colors[n - 1] ?? '#888888',
    tiempo: '—',
  }
}

export function defaultM1(): M1State {
  return {
    ...MOTOR_COLORS,
    fecha: 'DOM 13/04',
    gp: 'JAPÓN',
    categoria: 'F1',
    p1: defaultMotorPilot('#3671C6', '25'),
    p2: defaultMotorPilot('#E8002D', '18'),
    p3: defaultMotorPilot('#27F4D2', '15'),
    rows: [
      defaultRow('4', '12'), defaultRow('5', '10'), defaultRow('6', '8'),
      defaultRow('7', '6'), defaultRow('8', '4'), defaultRow('9', '2'), defaultRow('10', '1'),
    ],
  }
}

export function defaultM2(): M2State {
  return {
    ...MOTOR_COLORS,
    variante: 'GANADOR',
    palabraGigante: 'GANADOR',
    piloto: 'NOMBRE DEL PILOTO',
    equipo: 'Ferrari',
    teamId: 'f1-ferrari',
    panelColor: '#E8002D',
    lineaDatos: 'FECHA X // GP DE PAÍS',
    foto: '',
    fotoPosX: 50,
    fotoPosY: 20,
    fotoScale: 1,
  }
}

export function defaultM3(): M3State {
  return {
    ...MOTOR_COLORS,
    sesion: 'ENSAYOS LIBRES 1',
    p1: defaultMotorPilot('#E8002D'),
  }
}

export function defaultM4(): M4State {
  return {
    ...MOTOR_COLORS,
    sesion: 'CLASIFICACIÓN',
    p1: defaultMotorPilot('#E8002D'),
    p2: defaultMotorPilot('#3671C6'),
    p3: defaultMotorPilot('#27F4D2'),
  }
}

export function defaultM5(): M5State {
  return {
    ...MOTOR_COLORS,
    categoria: 'FÓRMULA 1',
    gp: 'GP DE NOMBRE',
    circuito: 'CIRCUITO',
    fecha: 'DD/MM',
    destacado: '',
    rows: Array.from({ length: 20 }, (_, i) => defaultGrillaRow(String(i + 1))),
  }
}

export const MOTOR_TEMPLATE_LIST = [
  { id: 'M1', label: 'Resultado podio', emoji: '🏆' },
  { id: 'M2', label: 'Piloto destacado', emoji: '🏎️' },
  { id: 'M3', label: 'Más rápido', emoji: '⚡' },
  { id: 'M4', label: 'Top 3 sesión', emoji: '🎯' },
  { id: 'M5', label: 'Grilla', emoji: '🚦' },
] as const

export type MotorTemplateId = typeof MOTOR_TEMPLATE_LIST[number]['id']

// BG color presets
export const MOTOR_BG_PRESETS = [
  { color: '#0E0F13', label: 'Negro' },
  { color: '#0B1631', label: 'Azul DUPLA' },
  { color: '#1C1E24', label: 'Gris oscuro' },
  { color: '#3A0D12', label: 'Bordó' },
]

// M2 variante presets
export const M2_VARIANTES = [
  { value: 'GANADOR',        label: 'Ganador',       linea: 'FECHA X // GP DE PAÍS' },
  { value: 'POLE POSITION',  label: 'Pole Position', linea: '0:00.000 // GP DE PAÍS' },
  { value: 'SANCIÓN',        label: 'Sanción',       linea: 'PENA // MOTIVO' },
  { value: 'ABANDONO',       label: 'Abandono',      linea: 'VUELTA X // MOTIVO' },
  { value: '¡PODIO!',        label: '¡Podio! (P1)',  linea: 'FECHA X // GP DE PAÍS' },
  { value: 'P2',             label: 'Podio P2',      linea: 'FECHA X // GP DE PAÍS' },
  { value: 'P3',             label: 'Podio P3',      linea: 'FECHA X // GP DE PAÍS' },
  { value: 'LIBRE',          label: 'Palabra libre', linea: '' },
]
