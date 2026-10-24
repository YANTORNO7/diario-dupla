export type MotorPilotEntry = {
  apellido: string
  nombre: string
  pais: string     // emoji flag
  teamId: string
  categoria: 'F1' | 'MotoGP' | 'TC' | 'StockCar'
}

export const MOTOR_PILOTS: MotorPilotEntry[] = [
  // F1 2026
  { apellido: 'VERSTAPPEN', nombre: 'Max',      pais: '🇳🇱', teamId: 'f1-redbull',     categoria: 'F1' },
  { apellido: 'LAWSON',     nombre: 'Liam',     pais: '🇳🇿', teamId: 'f1-redbull',     categoria: 'F1' },
  { apellido: 'LECLERC',    nombre: 'Charles',  pais: '🇲🇨', teamId: 'f1-ferrari',     categoria: 'F1' },
  { apellido: 'HAMILTON',   nombre: 'Lewis',    pais: '🇬🇧', teamId: 'f1-ferrari',     categoria: 'F1' },
  { apellido: 'RUSSELL',    nombre: 'George',   pais: '🇬🇧', teamId: 'f1-mercedes',    categoria: 'F1' },
  { apellido: 'ANTONELLI',  nombre: 'Kimi',     pais: '🇮🇹', teamId: 'f1-mercedes',    categoria: 'F1' },
  { apellido: 'NORRIS',     nombre: 'Lando',    pais: '🇬🇧', teamId: 'f1-mclaren',     categoria: 'F1' },
  { apellido: 'PIASTRI',    nombre: 'Oscar',    pais: '🇦🇺', teamId: 'f1-mclaren',     categoria: 'F1' },
  { apellido: 'ALONSO',     nombre: 'Fernando', pais: '🇪🇸', teamId: 'f1-astonmartin', categoria: 'F1' },
  { apellido: 'STROLL',     nombre: 'Lance',    pais: '🇨🇦', teamId: 'f1-astonmartin', categoria: 'F1' },
  { apellido: 'GASLY',      nombre: 'Pierre',   pais: '🇫🇷', teamId: 'f1-alpine',      categoria: 'F1' },
  { apellido: 'DOOHAN',     nombre: 'Jack',     pais: '🇦🇺', teamId: 'f1-alpine',      categoria: 'F1' },
  { apellido: 'SAINZ',      nombre: 'Carlos',   pais: '🇪🇸', teamId: 'f1-williams',    categoria: 'F1' },
  { apellido: 'ALBON',      nombre: 'Alex',     pais: '🇹🇭', teamId: 'f1-williams',    categoria: 'F1' },
  { apellido: 'BEARMAN',    nombre: 'Ollie',    pais: '🇬🇧', teamId: 'f1-haas',        categoria: 'F1' },
  { apellido: 'OCON',       nombre: 'Esteban',  pais: '🇫🇷', teamId: 'f1-haas',        categoria: 'F1' },
  { apellido: 'HADJAR',     nombre: 'Isack',    pais: '🇫🇷', teamId: 'f1-racingbulls', categoria: 'F1' },
  { apellido: 'TSUNODA',    nombre: 'Yuki',     pais: '🇯🇵', teamId: 'f1-racingbulls', categoria: 'F1' },
  // MotoGP
  { apellido: 'BAGNAIA',    nombre: 'Francesco',pais: '🇮🇹', teamId: 'mgp-ducati-lnr', categoria: 'MotoGP' },
  { apellido: 'MARINI',     nombre: 'Luca',     pais: '🇮🇹', teamId: 'mgp-ducati-lnr', categoria: 'MotoGP' },
  { apellido: 'MARQUEZ',    nombre: 'Marc',     pais: '🇪🇸', teamId: 'mgp-ducati-grp', categoria: 'MotoGP' },
  { apellido: 'DI GIANNANTONIO', nombre: 'Fabio', pais: '🇮🇹', teamId: 'mgp-ducati-grp', categoria: 'MotoGP' },
  { apellido: 'QUARTARARO', nombre: 'Fabio',    pais: '🇫🇷', teamId: 'mgp-yamaha',     categoria: 'MotoGP' },
  { apellido: 'ACOSTA',     nombre: 'Pedro',    pais: '🇪🇸', teamId: 'mgp-ktm',        categoria: 'MotoGP' },
  { apellido: 'ESPARGARO',  nombre: 'Aleix',    pais: '🇪🇸', teamId: 'mgp-aprilia',    categoria: 'MotoGP' },
]

export function findPilot(apellido: string): MotorPilotEntry | undefined {
  const q = apellido.toUpperCase()
  return MOTOR_PILOTS.find(p => p.apellido.includes(q) || q.includes(p.apellido))
}
