import { NextResponse } from "next/server"
import { requireAdminAPI } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"

function wikimedia(filename: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`
}

const CLUBS = [
  // ── ZONA A ────────────────────────────────────────────────
  { name: "Club Atlético Instituto", shortName: "Instituto", initials: "INS", primaryColor: "#00478B", secondaryColor: "#1A1A1A", crestUrl: wikimedia("Escudo_Instituto_Atletico_Central_Cordoba.svg") },
  { name: "Club Atlético Boca Juniors", shortName: "Boca", initials: "BOC", primaryColor: "#003087", secondaryColor: "#FFD700", crestUrl: wikimedia("Boca_Juniors_-_Novo_Escudo.svg") },
  { name: "Club Social y Deportivo Defensa y Justicia", shortName: "Defensa y Justicia", initials: "DEF", primaryColor: "#F5C400", secondaryColor: "#000000", crestUrl: wikimedia("Escudo_del_Club_Defensa_y_Justicia.svg") },
  { name: "Club Atlético Lanús", shortName: "Lanús", initials: "LAN", primaryColor: "#7A1529", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Escudo_de_Lanús_2025.png") },
  { name: "Club Atlético Vélez Sarsfield", shortName: "Vélez", initials: "VEL", primaryColor: "#FFFFFF", secondaryColor: "#00509E", crestUrl: wikimedia("Escudo_del_Club_Atlético_Vélez_Sarsfield.svg") },
  { name: "Gimnasia y Esgrima de Mendoza", shortName: "Gimnasia Mdz", initials: "GEM", primaryColor: "#006400", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Escudo_Club_Gimnasia_y_Esgrima_Mendoza.svg") },
  { name: "Club Atlético Independiente", shortName: "Independiente", initials: "IND", primaryColor: "#CC0000", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Escudo_independiente_rojo.svg") },
  { name: "Club Atlético Newell's Old Boys", shortName: "Newell's", initials: "NOB", primaryColor: "#CC0000", secondaryColor: "#000000", crestUrl: wikimedia("Escudo_del_Club_Newell's_Old_Boys.svg") },
  { name: "Club Estudiantes de La Plata", shortName: "Estudiantes", initials: "EST", primaryColor: "#CC0000", secondaryColor: "#000000", crestUrl: wikimedia("Estudiantes_de_la_Plata_crest_(2025).svg") },
  { name: "Club Atlético San Lorenzo de Almagro", shortName: "San Lorenzo", initials: "SLA", primaryColor: "#0A2A7E", secondaryColor: "#CC0000", crestUrl: wikimedia("Escudo_San_Lorenzo_2026.svg") },
  { name: "Club Atlético Unión", shortName: "Unión", initials: "UNI", primaryColor: "#CC0000", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Escudo_club_Atlético_Unión_de_santa_fe.svg") },
  { name: "Club Deportivo Riestra", shortName: "Riestra", initials: "RIE", primaryColor: "#6AB2E7", secondaryColor: "#000000", crestUrl: wikimedia("Escudo_del_Club_Deportivo_Riestra.svg") },
  { name: "Club Atlético Platense", shortName: "Platense", initials: "PLA", primaryColor: "#0038A8", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Escudo_del_Club_Altético_Platense.svg") },
  { name: "Club Central Córdoba de Santiago del Estero", shortName: "Central Córdoba", initials: "CCO", primaryColor: "#000000", secondaryColor: "#3333CC", crestUrl: wikimedia("Escudo_del_Club_Central_Córdoba_de_Santiago_del_Estero.svg") },
  { name: "Club Atlético Talleres", shortName: "Talleres", initials: "TAL", primaryColor: "#0A56A5", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Escudo_Talleres_2015.svg") },
  // ── ZONA B ────────────────────────────────────────────────
  { name: "Asociación Atlética Argentinos Juniors", shortName: "Argentinos", initials: "AAJ", primaryColor: "#CC0000", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Asociacion_Atletica_Argentinos_Juniors.svg") },
  { name: "Club Atlético Rosario Central", shortName: "Central", initials: "RCE", primaryColor: "#003087", secondaryColor: "#FFD700", crestUrl: wikimedia("Escudo_del_Club_Atlético_Rosario_Central.svg") },
  { name: "Club Atlético Belgrano", shortName: "Belgrano", initials: "BEL", primaryColor: "#72BFED", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Club_Atlético_Belgrano_2026.svg") },
  { name: "Club de Gimnasia y Esgrima La Plata", shortName: "Gimnasia", initials: "GEL", primaryColor: "#0A3888", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Escudo_del_Club_de_Gimnasia_y_Esgrima_La_Plata_(v2026).svg") },
  { name: "Club Atlético Sarmiento", shortName: "Sarmiento", initials: "SAR", primaryColor: "#1E7A1E", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Escudo_del_Club_Atlético_Sarmiento_de_Junín.svg") },
  { name: "Club Atlético Huracán", shortName: "Huracán", initials: "HUR", primaryColor: "#CF3024", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Emblema_oficial_del_Club_Atlético_Huracán.svg") },
  { name: "Club Independiente Rivadavia", shortName: "Indep. Rivadavia", initials: "IRV", primaryColor: "#00792B", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Escudo_del_Club_Independiente_Rivadavia.svg") },
  { name: "Club Atlético Barracas Central", shortName: "Barracas Central", initials: "BAR", primaryColor: "#CC0000", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Barracas_central_logo.svg") },
  { name: "Club Atlético River Plate", shortName: "River", initials: "RIV", primaryColor: "#FFFFFF", secondaryColor: "#CC0000", crestUrl: wikimedia("River_Plate_logo.svg") },
  { name: "Club Atlético Tucumán", shortName: "Atl. Tucumán", initials: "ATU", primaryColor: "#56A1E5", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Escudo_del_Club_Atletico_Tucuman.svg") },
  { name: "Club Atlético Tigre", shortName: "Tigre", initials: "TIG", primaryColor: "#1B2B6B", secondaryColor: "#CC0000", crestUrl: wikimedia("Escudo_del_Club_Atlético_Tigre_-_2019.svg") },
  { name: "Club Atlético Banfield", shortName: "Banfield", initials: "BAN", primaryColor: "#006400", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Escudo_del_Club_Atlético_Banfield.svg") },
  { name: "Racing Club", shortName: "Racing", initials: "RAC", primaryColor: "#003087", secondaryColor: "#FFFFFF", crestUrl: wikimedia("Escudo_de_Racing_Club.svg") },
  { name: "Club Atlético Aldosivi", shortName: "Aldosivi", initials: "ALD", primaryColor: "#1E7534", secondaryColor: "#F5C400", crestUrl: "https://wi0iygr85tkacuu3.public.blob.vercel-storage.com/escudos/aldosivi.webp" },
  { name: "Asociación Atlética Estudiantes de Río Cuarto", shortName: "Est. Río Cuarto", initials: "ERC", primaryColor: "#1A1A1A", secondaryColor: "#FFD700", crestUrl: wikimedia("Escudo_Asociacion_Atlética_Estudiantes_de_Río_Cuarto.svg") },
] as const

export async function POST() {
  const auth = await requireAdminAPI()
  if (auth instanceof NextResponse) return auth

  const results: string[] = []
  let created = 0
  let updated = 0

  for (const club of CLUBS) {
    const existing = await prisma.club.findFirst({
      where: { name: club.name, league: "ARGENTINA" },
    })

    if (existing) {
      await prisma.club.update({
        where: { id: existing.id },
        data: {
          shortName: club.shortName,
          initials: club.initials,
          primaryColor: club.primaryColor,
          secondaryColor: club.secondaryColor,
          crestUrl: club.crestUrl,
        },
      })
      results.push(`updated: ${club.name}`)
      updated++
    } else {
      await prisma.club.create({
        data: {
          name: club.name,
          shortName: club.shortName,
          initials: club.initials,
          primaryColor: club.primaryColor,
          secondaryColor: club.secondaryColor,
          crestUrl: club.crestUrl,
          league: "ARGENTINA",
        },
      })
      results.push(`created: ${club.name}`)
      created++
    }
  }

  return NextResponse.json({ ok: true, created, updated, results })
}
