export {} // Make this a module to avoid global scope conflicts
/**
 * Test: translation text processing (no DB, no Azure API)
 * Run: npx tsx scripts/test-translation-logic.ts
 *
 * Tests:
 * 1. wrapNoTranslate: proper-noun detection (uppercase initial, case-sensitive)
 * 2. applyGlossary: ES → PT replacement
 * 3. detectDivergence: number/score validation
 * 4. stripNoTranslateMarkup: cleanup after translation
 */

// ─── Copied from azure-translator.ts (no DB calls) ───────────────────────────

type GlossaryMap = Map<string, string>

function wrapNoTranslate(text: string, names: string[]): string {
  const sorted = [...names].sort((a, b) => b.length - a.length)
  let result = text
  for (const name of sorted) {
    if (!name || name.length < 2) continue
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const pattern = new RegExp(`(?<![\\w"])${escaped}(?![\\w"])`, "g")
    result = result.replace(pattern, (match) => {
      if (match[0] !== match[0].toUpperCase() || match[0] === match[0].toLowerCase()) return match
      return `<mstrans:dictionary translation="${name}">${name}</mstrans:dictionary>`
    })
  }
  return result
}

function stripNoTranslateMarkup(text: string): string {
  return text.replace(/<mstrans:dictionary[^>]*>(.*?)<\/mstrans:dictionary>/g, "$1")
}

function applyGlossary(text: string, glossary: GlossaryMap): string {
  let result = text
  const entries = [...glossary.entries()].sort((a, b) => b[0].length - a[0].length)
  for (const [es, pt] of entries) {
    const escaped = es.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    result = result.replace(new RegExp(`\\b${escaped}\\b`, "gi"), pt)
  }
  return result
}

function extractNumbers(text: string): string[] {
  return (text.match(/\d+(?:[.,]\d+)?/g) ?? [])
}

function detectDivergence(original: string, translated: string): boolean {
  const origNums  = extractNumbers(original).sort()
  const transNums = extractNumbers(translated).sort()
  return origNums.join(",") !== transNums.join(",")
}

// ─── Test data ────────────────────────────────────────────────────────────────

const clubNames = [
  "Flamengo", "Fluminense", "Corinthians", "Palmeiras", "Santos",
  "Atlético Mineiro", "Internacional", "Grêmio",
  "River Plate", "Boca Juniors", "Racing", "Independiente",
  "San Lorenzo", "Vélez", "Estudiantes", "Talleres",
]

const noTranslateTerms = ["Brasileirão", "Copa Libertadores", "Diario Dupla", "Maracanã", "Copa América"]

const allNoTranslate = [...clubNames, ...noTranslateTerms]

const glossary: GlossaryMap = new Map([
  ["hincha",        "torcedor"],
  ["hinchas",       "torcedores"],
  ["arquero",       "goleiro"],
  ["delantero",     "atacante"],
  ["entrenador",    "técnico"],
  ["goles",         "gols"],
  ["penal",         "pênalti"],
  ["penales",       "pênaltis"],
  ["cancha",        "campo"],
  ["camiseta",      "camisa"],
  ["victoria",      "vitória"],
  ["liga profesional", "liga profissional"],
])

// ─── Sample article with HTML and club names ─────────────────────────────────

const ARTICLE_BODY = `<p>
  <strong>Flamengo</strong> goleó 3-1 a <strong>Fluminense</strong> en el Maracanã
  en el clásico más importante del fútbol brasileño. El equipo del entrenador Filipe Luís
  dominó el partido con goles de Gerson (15'), Pedro (67') y Arrascaeta (89').
  El descuento de Fluminense llegó a través de un penal cobrado en el minuto 45.
</p>
<p>
  Los hinchas de Flamengo coparon el estadio, vendido en su totalidad.
  Con esta victoria, el equipo rojo y negro se consolida como líder del Brasileirão
  y sigue su camino hacia la Copa Libertadores del año que viene.
</p>
<p>
  Por otro lado, en Argentina, River Plate venció 2-0 a Boca Juniors en el
  superclásico por la Liga Profesional. El arquero de River realizó 5 atajadas clave.
</p>`

const ARTICLE_TITLE = "Flamengo aplastó 3-1 a Fluminense en el Maracanã con una actuación perfecta"
const ARTICLE_SUBTITLE = "Pedro y Arrascaeta fueron los mejores del partido con 1 gol y 2 asistencias cada uno"

// ─── Run tests ────────────────────────────────────────────────────────────────

console.log("═".repeat(70))
console.log("TEST 1: wrapNoTranslate — proper noun detection")
console.log("═".repeat(70))

const wrappedTitle   = wrapNoTranslate(ARTICLE_TITLE,   allNoTranslate)
const wrappedSubtitle = wrapNoTranslate(ARTICLE_SUBTITLE, allNoTranslate)
const wrappedBody    = wrapNoTranslate(ARTICLE_BODY,    allNoTranslate)

console.log("\nTitle input:  ", ARTICLE_TITLE)
console.log("Title wrapped:", wrappedTitle)
console.log()
console.log("Body (first <p>) input:")
console.log(ARTICLE_BODY.split("</p>")[0].trim())
console.log()
console.log("Body (first <p>) wrapped:")
console.log(wrappedBody.split("</p>")[0].trim())

// ─── Simulate Azure response (pretend Azure returned a translated version) ───

console.log("\n" + "═".repeat(70))
console.log("TEST 2: Simulated Azure response + post-processing")
console.log("═".repeat(70))

// Simulate what Azure would return: proper nouns preserved, rest translated
// (In reality Azure would process the wrapped text and preserve <mstrans:dictionary> content)
const simulatedAzureOutput = wrappedBody
  .replace(/goleó/g, "goleou")
  .replace(/en el/g, "no")
  .replace(/del partido/g, "do jogo")
  .replace(/más importante/g, "mais importante")
  .replace(/del fútbol brasileño/g, "do futebol brasileiro")
  .replace(/dominó el partido/g, "dominou o jogo")
  .replace(/a través de/g, "por meio de")
  .replace(/cobrado en el minuto/g, "cobrado no minuto")
  .replace(/vendido en su totalidad/g, "esgotado")
  .replace(/Por otro lado/g, "Por outro lado")
  .replace(/venció/g, "venceu")
  .replace(/por la/g, "pela")
  .replace(/realizó/g, "realizou")
  .replace(/atajadas clave/g, "defesas fundamentais")

const stripped     = stripNoTranslateMarkup(simulatedAzureOutput)
const withGlossary = applyGlossary(stripped, glossary)

console.log("\nAfter strip + glossary (first <p>):")
console.log(withGlossary.split("</p>")[0].trim())

// ─── Test 3: Number divergence detection ─────────────────────────────────────

console.log("\n" + "═".repeat(70))
console.log("TEST 3: detectDivergence — number/score validation")
console.log("═".repeat(70))

const cases = [
  {
    desc:  "Same numbers → no divergence",
    orig:  "Flamengo goleó 3-1 en el minuto 89",
    trans: "Flamengo goleou 3-1 no minuto 89",
    want:  false,
  },
  {
    desc:  "Missing number → divergence → status=REVIEW",
    orig:  "Flamengo goleó 3-1 en el minuto 89",
    trans: "Flamengo goleou no minuto 89",
    want:  true,
  },
  {
    desc:  "Hallucinated number → divergence → status=REVIEW",
    orig:  "Pedro marcó 2 goles",
    trans: "Pedro marcou 3 gols",
    want:  true,
  },
  {
    desc:  "Date preserved → no divergence",
    orig:  "El partido fue el 10 de noviembre de 2026",
    trans: "O jogo foi em 10 de novembro de 2026",
    want:  false,
  },
]

for (const { desc, orig, trans, want } of cases) {
  const result = detectDivergence(orig, trans)
  const pass   = result === want
  console.log(`  [${pass ? "✓" : "✗"}] ${desc}`)
  if (!pass) console.log(`       Expected divergence=${want}, got=${result}`)
}

// ─── Test 4: Case sensitivity ────────────────────────────────────────────────

console.log("\n" + "═".repeat(70))
console.log("TEST 4: wrapNoTranslate — case sensitivity")
console.log("═".repeat(70))

const caseTests = [
  { input: "El flamengo es un ave rosada",   desc: "lowercase 'flamengo' (bird) → NOT wrapped" },
  { input: "El jugador de Flamengo anotó",   desc: "uppercase 'Flamengo' (club) → wrapped" },
  { input: "Un hincha de River Plate llegó", desc: "uppercase 'River Plate' → wrapped" },
  { input: "El río de la plata",             desc: "lowercase words → NOT wrapped" },
  { input: "El Maracanã está en Río",        desc: "uppercase 'Maracanã' → wrapped" },
]

for (const { input, desc } of caseTests) {
  const output = wrapNoTranslate(input, allNoTranslate)
  const hasTag = output.includes("<mstrans:dictionary")
  console.log(`  ${desc}`)
  console.log(`    Input:  "${input}"`)
  console.log(`    Output: "${output}"`)
  console.log(`    Tagged: ${hasTag}`)
  console.log()
}

console.log("═".repeat(70))
console.log("All tests complete")
console.log("═".repeat(70))
