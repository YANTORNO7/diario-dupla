export type Nivel = {
  id: string
  nombre: string
  desde: number
  escudo: string
  color: string
}

export const NIVELES: Nivel[] = [
  { id: "bronce",    nombre: "Bronce",      desde: 0,   escudo: "/escudos/bronce.svg",    color: "#B8733A" },
  { id: "plata-1",   nombre: "Plata I",     desde: 8,   escudo: "/escudos/plata-1.svg",   color: "#B9C2CC" },
  { id: "plata-2",   nombre: "Plata II",    desde: 15,  escudo: "/escudos/plata-2.svg",   color: "#B9C2CC" },
  { id: "plata-3",   nombre: "Plata III",   desde: 25,  escudo: "/escudos/plata-3.svg",   color: "#B9C2CC" },
  { id: "oro-1",     nombre: "Oro I",       desde: 35,  escudo: "/escudos/oro-1.svg",     color: "#F2B632" },
  { id: "oro-2",     nombre: "Oro II",      desde: 50,  escudo: "/escudos/oro-2.svg",     color: "#F2B632" },
  { id: "oro-3",     nombre: "Oro III",     desde: 65,  escudo: "/escudos/oro-3.svg",     color: "#F2B632" },
  { id: "platino-1", nombre: "Platino I",   desde: 85,  escudo: "/escudos/platino-1.svg", color: "#3FC9B0" },
  { id: "platino-2", nombre: "Platino II",  desde: 105, escudo: "/escudos/platino-2.svg", color: "#3FC9B0" },
  { id: "platino-3", nombre: "Platino III", desde: 130, escudo: "/escudos/platino-3.svg", color: "#3FC9B0" },
  { id: "diamante",  nombre: "Diamante",    desde: 160, escudo: "/escudos/diamante.svg",  color: "#4FA6FF" },
  { id: "idolo",     nombre: "Ídolo",       desde: 220, escudo: "/escudos/idolo.svg",     color: "#E0245E" },
]

export function getNivelActual(total: number): Nivel {
  for (let i = NIVELES.length - 1; i >= 0; i--) {
    if (total >= NIVELES[i].desde) return NIVELES[i]
  }
  return NIVELES[0]
}

export function getNivelSiguiente(total: number): Nivel | null {
  const actual = getNivelActual(total)
  const idx = NIVELES.findIndex((n) => n.id === actual.id)
  return idx < NIVELES.length - 1 ? NIVELES[idx + 1] : null
}

export function getProgreso(total: number): number {
  const actual = getNivelActual(total)
  const siguiente = getNivelSiguiente(total)
  if (!siguiente) return 1
  return (total - actual.desde) / (siguiente.desde - actual.desde)
}
