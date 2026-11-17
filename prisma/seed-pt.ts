/**
 * seed-pt.ts — Seed das seções PT e glosário inicial
 *
 * Uso: npx tsx prisma/seed-pt.ts
 *
 * Idempotente: usa upsert, pode rodar várias vezes sem duplicar dados.
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// ─── Mapeamento seções ES → PT ────────────────────────────────────────────────

const SECTION_PT_MAP: { slug: string; namePt: string; slugPt: string; descPt?: string }[] = [
  { slug: "la-dupla",         namePt: "A Dupla",             slugPt: "a-dupla" },
  { slug: "clubes",           namePt: "Clubes",              slugPt: "clubes" },
  { slug: "selecciones",      namePt: "Seleções",            slugPt: "selecoes" },
  { slug: "brasil",           namePt: "Futebol brasileiro",  slugPt: "futebol-brasileiro" },
  { slug: "argentina",        namePt: "Futebol argentino",   slugPt: "futebol-argentino" },
  { slug: "futbol-femenino",  namePt: "Futebol feminino",    slugPt: "futebol-feminino" },
  { slug: "copas",            namePt: "Copas",               slugPt: "copas" },
  { slug: "libertadores",     namePt: "Libertadores",        slugPt: "libertadores" },
  { slug: "sudamericana",     namePt: "Sul-Americana",       slugPt: "sul-americana" },
  { slug: "deporte-motor",    namePt: "Esporte a motor",     slugPt: "esporte-a-motor" },
  { slug: "f1",               namePt: "F1",                  slugPt: "f1" },
  { slug: "motogp",           namePt: "MotoGP",              slugPt: "motogp" },
  { slug: "rally",            namePt: "Rally",               slugPt: "rally" },
  { slug: "tenis",            namePt: "Tênis",               slugPt: "tenis" },
]

// ─── Glosário inicial ─────────────────────────────────────────────────────────

type GlossaryEntry = { esWord: string; ptWord: string; type: "GLOSSARY" | "NO_TRANSLATE" }

const GLOSSARY: GlossaryEntry[] = [
  // Futebol / posições / termos do jogo
  { esWord: "hincha",           ptWord: "torcedor",        type: "GLOSSARY" },
  { esWord: "hinchas",          ptWord: "torcedores",      type: "GLOSSARY" },
  { esWord: "arquero",          ptWord: "goleiro",         type: "GLOSSARY" },
  { esWord: "arqueros",         ptWord: "goleiros",        type: "GLOSSARY" },
  { esWord: "delantero",        ptWord: "atacante",        type: "GLOSSARY" },
  { esWord: "delanteros",       ptWord: "atacantes",       type: "GLOSSARY" },
  { esWord: "mediocampista",    ptWord: "meia",            type: "GLOSSARY" },
  { esWord: "mediocampistas",   ptWord: "meias",           type: "GLOSSARY" },
  { esWord: "defensor",         ptWord: "defensor",        type: "GLOSSARY" },
  { esWord: "defensa",          ptWord: "defesa",          type: "GLOSSARY" },
  { esWord: "lateral",          ptWord: "lateral",         type: "GLOSSARY" },
  { esWord: "entrenador",       ptWord: "técnico",         type: "GLOSSARY" },
  { esWord: "entrenadores",     ptWord: "técnicos",        type: "GLOSSARY" },
  { esWord: "técnico",          ptWord: "técnico",         type: "GLOSSARY" },
  { esWord: "gol",              ptWord: "gol",             type: "GLOSSARY" },
  { esWord: "goles",            ptWord: "gols",            type: "GLOSSARY" },
  { esWord: "penal",            ptWord: "pênalti",         type: "GLOSSARY" },
  { esWord: "penales",          ptWord: "pênaltis",        type: "GLOSSARY" },
  { esWord: "córner",           ptWord: "escanteio",       type: "GLOSSARY" },
  { esWord: "córneres",         ptWord: "escanteios",      type: "GLOSSARY" },
  { esWord: "offside",          ptWord: "impedimento",     type: "GLOSSARY" },
  { esWord: "fuera de juego",   ptWord: "impedimento",     type: "GLOSSARY" },
  { esWord: "tarjeta amarilla", ptWord: "cartão amarelo",  type: "GLOSSARY" },
  { esWord: "tarjeta roja",     ptWord: "cartão vermelho", type: "GLOSSARY" },
  { esWord: "empate",           ptWord: "empate",          type: "GLOSSARY" },
  { esWord: "derrota",          ptWord: "derrota",         type: "GLOSSARY" },
  { esWord: "victoria",         ptWord: "vitória",         type: "GLOSSARY" },
  { esWord: "clasificación",    ptWord: "classificação",   type: "GLOSSARY" },
  { esWord: "eliminación",      ptWord: "eliminação",      type: "GLOSSARY" },
  { esWord: "fase de grupos",   ptWord: "fase de grupos",  type: "GLOSSARY" },
  { esWord: "octavos de final", ptWord: "oitavas de final", type: "GLOSSARY" },
  { esWord: "cuartos de final", ptWord: "quartas de final", type: "GLOSSARY" },
  { esWord: "semifinal",        ptWord: "semifinal",       type: "GLOSSARY" },
  { esWord: "final",            ptWord: "final",           type: "GLOSSARY" },
  { esWord: "estadio",          ptWord: "estádio",         type: "GLOSSARY" },
  { esWord: "estadios",         ptWord: "estádios",        type: "GLOSSARY" },
  { esWord: "cancha",           ptWord: "campo",           type: "GLOSSARY" },
  { esWord: "camiseta",         ptWord: "camisa",          type: "GLOSSARY" },
  { esWord: "camisetas",        ptWord: "camisas",         type: "GLOSSARY" },
  { esWord: "convocatoria",     ptWord: "convocação",      type: "GLOSSARY" },
  { esWord: "banca",            ptWord: "banco",           type: "GLOSSARY" },
  { esWord: "suplente",         ptWord: "reserva",         type: "GLOSSARY" },
  { esWord: "suplentes",        ptWord: "reservas",        type: "GLOSSARY" },
  { esWord: "titular",          ptWord: "titular",         type: "GLOSSARY" },
  { esWord: "titulares",        ptWord: "titulares",       type: "GLOSSARY" },
  { esWord: "lesión",           ptWord: "lesão",           type: "GLOSSARY" },
  { esWord: "lesiones",         ptWord: "lesões",          type: "GLOSSARY" },
  { esWord: "suspensión",       ptWord: "suspensão",       type: "GLOSSARY" },
  { esWord: "transferencia",    ptWord: "transferência",   type: "GLOSSARY" },
  { esWord: "transferencias",   ptWord: "transferências",  type: "GLOSSARY" },
  { esWord: "fichaje",          ptWord: "contratação",     type: "GLOSSARY" },
  { esWord: "fichajes",         ptWord: "contratações",    type: "GLOSSARY" },
  { esWord: "refuerzo",         ptWord: "reforço",         type: "GLOSSARY" },
  { esWord: "refuerzos",        ptWord: "reforços",        type: "GLOSSARY" },
  // Competições
  { esWord: "Liga Profesional", ptWord: "Liga Profesional",           type: "NO_TRANSLATE" },
  { esWord: "Copa Argentina",   ptWord: "Copa Argentina",             type: "NO_TRANSLATE" },
  { esWord: "Copa de la Liga",  ptWord: "Copa de la Liga",            type: "NO_TRANSLATE" },
  { esWord: "Primera Nacional", ptWord: "Primera Nacional",           type: "NO_TRANSLATE" },
  { esWord: "Brasileirão",      ptWord: "Brasileirão",                type: "NO_TRANSLATE" },
  { esWord: "Copa do Brasil",   ptWord: "Copa do Brasil",             type: "NO_TRANSLATE" },
  { esWord: "Copa Libertadores", ptWord: "Copa Libertadores",         type: "NO_TRANSLATE" },
  { esWord: "Libertadores",     ptWord: "Libertadores",               type: "NO_TRANSLATE" },
  { esWord: "Copa Sudamericana", ptWord: "Copa Sul-Americana",        type: "GLOSSARY" },
  { esWord: "Copa América",     ptWord: "Copa América",               type: "NO_TRANSLATE" },
  { esWord: "do Mundial",        ptWord: "da Copa do Mundo",           type: "GLOSSARY" },
  { esWord: "del Mundial",       ptWord: "da Copa do Mundo",           type: "GLOSSARY" },
  { esWord: "Mundial",           ptWord: "Copa do Mundo",              type: "GLOSSARY" },
  { esWord: "Tabla Anual",       ptWord: "Tabela Anual",               type: "GLOSSARY" },
  // Publicação
  { esWord: "Diario Dupla",     ptWord: "Diario Dupla",               type: "NO_TRANSLATE" },
  { esWord: "Maracanã",         ptWord: "Maracanã",                   type: "NO_TRANSLATE" },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding PT sections and glossary...")

  // 1. Update sections with PT data
  let sectionsUpdated = 0
  for (const entry of SECTION_PT_MAP) {
    const result = await prisma.section.updateMany({
      where: { slug: entry.slug },
      data: {
        namePt: entry.namePt,
        slugPt: entry.slugPt,
        ...(entry.descPt ? { descPt: entry.descPt } : {}),
      },
    })
    if (result.count > 0) sectionsUpdated++
    else console.warn(`  ⚠ Section not found: ${entry.slug}`)
  }
  console.log(`  ✓ ${sectionsUpdated} sections updated with PT data`)

  // 2. Upsert glossary terms
  let glossaryCount = 0
  for (const term of GLOSSARY) {
    await prisma.glossaryTerm.upsert({
      where: { esWord: term.esWord },
      update: { ptWord: term.ptWord, type: term.type },
      create: { esWord: term.esWord, ptWord: term.ptWord, type: term.type },
    })
    glossaryCount++
  }
  console.log(`  ✓ ${glossaryCount} glossary terms upserted`)

  // 3. Ensure default SiteConfig values
  await prisma.siteConfig.upsert({
    where: { key: "pt_mode" },
    update: {},
    create: { key: "pt_mode", value: "off" },
  })
  await prisma.siteConfig.upsert({
    where: { key: "translation_provider" },
    update: {},
    create: { key: "translation_provider", value: "deepl" },
  })
  console.log("  ✓ SiteConfig defaults ensured")

  console.log("✅ PT seed complete")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
