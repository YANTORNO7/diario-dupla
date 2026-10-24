export type MotorTeam = {
  id: string
  name: string
  color: string
  category: 'F1' | 'MotoGP' | 'TC' | 'StockCar'
}

export const MOTOR_TEAMS: MotorTeam[] = [
  // F1 2026
  { id: 'f1-redbull',      name: 'Red Bull',      color: '#3671C6', category: 'F1' },
  { id: 'f1-ferrari',      name: 'Ferrari',        color: '#E8002D', category: 'F1' },
  { id: 'f1-mercedes',     name: 'Mercedes',       color: '#27F4D2', category: 'F1' },
  { id: 'f1-mclaren',      name: 'McLaren',        color: '#FF8000', category: 'F1' },
  { id: 'f1-astonmartin',  name: 'Aston Martin',   color: '#229971', category: 'F1' },
  { id: 'f1-alpine',       name: 'Alpine',         color: '#0093CC', category: 'F1' },
  { id: 'f1-williams',     name: 'Williams',       color: '#64C4FF', category: 'F1' },
  { id: 'f1-haas',         name: 'Haas',           color: '#B6BABD', category: 'F1' },
  { id: 'f1-racingbulls',  name: 'Racing Bulls',   color: '#6692FF', category: 'F1' },
  { id: 'f1-audi',         name: 'Audi',           color: '#C0011A', category: 'F1' },
  { id: 'f1-cadillac',     name: 'Cadillac',       color: '#52E252', category: 'F1' },
  // MotoGP
  { id: 'mgp-ducati-lnr',  name: 'Ducati Lenovo',  color: '#CC0000', category: 'MotoGP' },
  { id: 'mgp-ducati-grp',  name: 'Gresini Racing', color: '#E31836', category: 'MotoGP' },
  { id: 'mgp-ducati-pra',  name: 'Pramac',         color: '#E10600', category: 'MotoGP' },
  { id: 'mgp-yamaha',      name: 'Yamaha',         color: '#003F99', category: 'MotoGP' },
  { id: 'mgp-honda',       name: 'Honda',          color: '#CC0000', category: 'MotoGP' },
  { id: 'mgp-ktm',         name: 'KTM',            color: '#FF6600', category: 'MotoGP' },
  { id: 'mgp-aprilia',     name: 'Aprilia',        color: '#00A650', category: 'MotoGP' },
  { id: 'mgp-trackhouse',  name: 'Trackhouse',     color: '#BF1E2D', category: 'MotoGP' },
  // TC (Turismo Carretera)
  { id: 'tc-ford',         name: 'Ford',           color: '#003087', category: 'TC' },
  { id: 'tc-chevrolet',    name: 'Chevrolet',      color: '#F2B700', category: 'TC' },
  { id: 'tc-dodge',        name: 'Dodge',          color: '#CC0000', category: 'TC' },
  { id: 'tc-toyota',       name: 'Toyota',         color: '#EB0A1E', category: 'TC' },
  // Stock Car Brasil
  { id: 'sc-chevrolet',    name: 'Chevrolet',      color: '#F2B700', category: 'StockCar' },
  { id: 'sc-toyota',       name: 'Toyota',         color: '#EB0A1E', category: 'StockCar' },
]

export const TEAM_CATEGORIES = ['F1', 'MotoGP', 'TC', 'StockCar'] as const
export type TeamCategory = typeof TEAM_CATEGORIES[number]

export const CATEGORY_LABELS: Record<TeamCategory, string> = {
  F1: 'Fórmula 1',
  MotoGP: 'MotoGP',
  TC: 'Turismo Carretera',
  StockCar: 'Stock Car',
}

export function getTeamsByCategory(cat: TeamCategory): MotorTeam[] {
  return MOTOR_TEAMS.filter(t => t.category === cat)
}

export function getTeamColor(teamId: string): string {
  return MOTOR_TEAMS.find(t => t.id === teamId)?.color ?? '#888888'
}
