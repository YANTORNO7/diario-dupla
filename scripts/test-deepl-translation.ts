/**
 * Test: DeepL translation with HTML and club names
 * Run: DEEPL_API_KEY="..." npx tsx scripts/test-deepl-translation.ts
 */
export {} // Make this a module to avoid global scope conflicts

// ─── Copied from deepl-translator.ts (no DB calls) ───────────────────────────

const DEEPL_ENDPOINT = "https://api-free.deepl.com"

function wrapNoTranslate(text: string, names: string[]): string {
  const sorted = [...names].sort((a, b) => b.length - a.length)
  let result = text
  for (const name of sorted) {
    if (!name || name.length < 2) continue
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const pattern = new RegExp(`(?<![\\w"])${escaped}(?![\\w"])`, "g")
    result = result.replace(pattern, (match) => {
      if (match[0] !== match[0].toUpperCase() || match[0] === match[0].toLowerCase()) return match
      return `<span translate="no">${name}</span>`
    })
  }
  return result
}

function stripNoTranslateMarkup(text: string): string {
  let result = text
  result = result.replace(/\bd(<span translate="no">)/g, "do $1")
  result = result.replace(/<\/span>(\w)/g, "</span> $1")
  return result.replace(/<span translate="no">(.*?)<\/span>/g, "$1")
}

async function callDeepL(texts: string[]): Promise<string[]> {
  const key = process.env.DEEPL_API_KEY
  if (!key) throw new Error("DEEPL_API_KEY não configurada")

  const res = await fetch(`${DEEPL_ENDPOINT}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization:  `DeepL-Auth-Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text:         texts,
      source_lang:  "ES",
      target_lang:  "PT-BR",
      tag_handling: "html",
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepL error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as { translations: { text: string }[] }
  return data.translations.map((t) => t.text)
}

// ─── Test article ─────────────────────────────────────────────────────────────

const CLUB_NAMES = [
  "Flamengo", "Fluminense", "Corinthians", "Palmeiras", "Santos",
  "Atlético Mineiro", "Internacional", "Grêmio",
  "River Plate", "Boca Juniors", "Racing", "Independiente",
  "San Lorenzo", "Vélez", "Estudiantes", "Talleres",
  "Diario Dupla", "Brasileirão", "Copa Libertadores", "Maracanã", "Copa América",
]

const ARTICLE_TITLE    = "Flamengo aplastó 3-1 a Fluminense en el Maracanã con una actuación perfecta"
const ARTICLE_SUBTITLE = "Pedro y Arrascaeta fueron los mejores del partido con 1 gol y 2 asistencias cada uno"
const ARTICLE_BODY     = `<p>
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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const key = process.env.DEEPL_API_KEY
  if (!key) {
    console.error("ERROR: DEEPL_API_KEY não definida")
    process.exit(1)
  }

  // Check usage
  const usageRes = await fetch(`${DEEPL_ENDPOINT}/v2/usage`, {
    headers: { Authorization: `DeepL-Auth-Key ${key}` },
  })
  const usage = (await usageRes.json()) as { character_count: number; character_limit: number }
  console.log(`\nUso DeepL: ${usage.character_count.toLocaleString()} / ${usage.character_limit.toLocaleString()} chars`)
  console.log(`Pct: ${Math.round((usage.character_count / usage.character_limit) * 100)}%\n`)

  // Check supported glossary pairs
  const pairsRes = await fetch(`${DEEPL_ENDPOINT}/v2/glossary-language-pairs`, {
    headers: { Authorization: `DeepL-Auth-Key ${key}` },
  })
  const pairs = (await pairsRes.json()) as { supported_languages: { source_lang: string; target_lang: string }[] }
  const esPtbr = pairs.supported_languages.some(
    (p) => p.source_lang.toLowerCase() === "es" && p.target_lang.toLowerCase() === "pt-br"
  )
  console.log(`Glossário ES→PT-BR suportado: ${esPtbr ? "SIM" : "NÃO"}\n`)

  console.log("═".repeat(70))
  console.log("PASSO 1: Texto original com wrapping de nomes próprios")
  console.log("═".repeat(70))

  const wrappedTitle    = wrapNoTranslate(ARTICLE_TITLE,    CLUB_NAMES)
  const wrappedSubtitle = wrapNoTranslate(ARTICLE_SUBTITLE, CLUB_NAMES)
  const wrappedBody     = wrapNoTranslate(ARTICLE_BODY,     CLUB_NAMES)

  console.log("\nTitle wrapped:")
  console.log(wrappedTitle)
  console.log("\nBody (first <p>) wrapped:")
  console.log(wrappedBody.split("</p>")[0].trim())

  console.log("\n" + "═".repeat(70))
  console.log("PASSO 2: Tradução DeepL (ES → PT-BR, tag_handling=html)")
  console.log("═".repeat(70))

  const [translatedTitle, translatedSubtitle, translatedBody] = await callDeepL([
    wrappedTitle,
    wrappedSubtitle,
    wrappedBody,
  ])

  console.log("\nTitle DeepL raw:")
  console.log(translatedTitle)
  console.log("\nBody DeepL raw (first <p>):")
  console.log(translatedBody.split("</p>")[0].trim())

  console.log("\n" + "═".repeat(70))
  console.log("PASSO 3: Após strip de <span translate=no>")
  console.log("═".repeat(70))

  const finalTitle    = stripNoTranslateMarkup(translatedTitle)
  const finalSubtitle = stripNoTranslateMarkup(translatedSubtitle)
  const finalBody     = stripNoTranslateMarkup(translatedBody)

  console.log("\nTitle final:")
  console.log(finalTitle)
  console.log("\nSubtitle final:")
  console.log(finalSubtitle)
  console.log("\nBody final completo:")
  console.log(finalBody)

  // Verify club names are preserved
  console.log("\n" + "═".repeat(70))
  console.log("VERIFICAÇÃO: Nomes de clubes preservados?")
  console.log("═".repeat(70))
  const checkNames = ["Flamengo", "Fluminense", "River Plate", "Boca Juniors", "Brasileirão", "Maracanã"]
  for (const name of checkNames) {
    const inTitle = finalTitle.includes(name)
    const inBody  = finalBody.includes(name)
    console.log(`  ${name}: título=${inTitle ? "✓" : "✗"} corpo=${inBody ? "✓" : "✗"}`)
  }
}

main().catch(console.error)
