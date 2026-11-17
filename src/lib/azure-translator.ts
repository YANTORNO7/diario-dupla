/**
 * azure-translator.ts
 *
 * Integração com Azure AI Translator.
 * - Preserva HTML
 * - Aplica glosário antes e depois
 * - Marca nomes próprios (maiúscula inicial) com <mstrans:dictionary> para não traduzir
 * - Conta chars usados e salva em TranslationUsage
 * - Rejeita se uso do mês >= 2.000.000 chars
 */

import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"

const AZURE_ENDPOINT = "https://api.cognitive.microsofttranslator.com"
const CHAR_LIMIT = 2_000_000
const CHAR_WARN  = 1_600_000

export type TranslationStatus = "AUTO" | "REVIEW" | "REVIEWED"

export type TranslateArticleInput = {
  title:       string
  subtitle?:   string | null
  body:        string
  heroAlt?:    string | null
  metaTitle?:  string | null
  metaDesc?:   string | null
}

export type TranslateArticleResult = {
  titlePt:     string
  subtitlePt?: string
  bodyPt:      string
  slugPt:      string
  heroAltPt?:  string
  metaTitlePt?: string
  metaDescPt?:  string
  status:      TranslationStatus
  charsUsed:   number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

async function getMonthlyUsage(): Promise<number> {
  const rec = await prisma.translationUsage.findUnique({ where: { month: currentMonth() } })
  return rec?.chars ?? 0
}

async function addMonthlyUsage(chars: number): Promise<void> {
  const month = currentMonth()
  await prisma.translationUsage.upsert({
    where: { month },
    update: { chars: { increment: chars } },
    create: { month, chars },
  })
}

// ─── Club names from DB ───────────────────────────────────────────────────────

async function getNoTranslateNames(): Promise<string[]> {
  const [clubs, glossaryNoTranslate] = await Promise.all([
    prisma.club.findMany({ select: { name: true, shortName: true } }),
    prisma.glossaryTerm.findMany({ where: { type: "NO_TRANSLATE" }, select: { esWord: true } }),
  ])

  const names: string[] = []
  for (const club of clubs) {
    names.push(club.name, club.shortName)
  }
  for (const term of glossaryNoTranslate) {
    names.push(term.esWord)
  }
  // Deduplicate
  return [...new Set(names.filter(Boolean))]
}

// ─── Case-sensitive proper name wrapping ─────────────────────────────────────
// Only wraps when the name appears with uppercase initial (proper noun usage).

function wrapNoTranslate(text: string, names: string[]): string {
  // Sort longest first to avoid partial matches
  const sorted = [...names].sort((a, b) => b.length - a.length)
  let result = text
  for (const name of sorted) {
    if (!name || name.length < 2) continue
    // Escape special regex chars
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    // Match when starts with uppercase, avoiding inside tag attributes (after ").
    // We do NOT exclude after > so that names inside <strong>Name</strong> are also wrapped.
    const pattern = new RegExp(
      `(?<![\\w"])${escaped}(?![\\w"])`,
      "g"
    )
    result = result.replace(pattern, (match) => {
      // Only wrap if first char is uppercase (proper noun)
      if (match[0] !== match[0].toUpperCase() || match[0] === match[0].toLowerCase()) return match
      return `<mstrans:dictionary translation="${name}">${name}</mstrans:dictionary>`
    })
  }
  return result
}

function stripNoTranslateMarkup(text: string): string {
  return text.replace(/<mstrans:dictionary[^>]*>(.*?)<\/mstrans:dictionary>/g, "$1")
}

// ─── Glossary replacement ─────────────────────────────────────────────────────

type GlossaryMap = Map<string, string>

async function loadGlossaryMap(): Promise<GlossaryMap> {
  const terms = await prisma.glossaryTerm.findMany({ where: { type: "GLOSSARY" } })
  const map = new Map<string, string>()
  for (const t of terms) {
    map.set(t.esWord.toLowerCase(), t.ptWord)
  }
  return map
}

function applyGlossary(text: string, glossary: GlossaryMap): string {
  let result = text
  // Sort by length descending to match longer phrases first
  const entries = [...glossary.entries()].sort((a, b) => b[0].length - a[0].length)
  for (const [es, pt] of entries) {
    const escaped = es.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    result = result.replace(new RegExp(`\\b${escaped}\\b`, "gi"), pt)
  }
  return result
}

// ─── Validation: check for divergent numbers/scores/dates ────────────────────

function extractNumbers(text: string): string[] {
  return (text.match(/\d+(?:[.,]\d+)?/g) ?? [])
}

function detectDivergence(original: string, translated: string): boolean {
  const origNums = extractNumbers(original).sort()
  const transNums = extractNumbers(translated).sort()
  if (origNums.join(",") !== transNums.join(",")) return true
  return false
}

// ─── Azure API call ───────────────────────────────────────────────────────────

async function callAzureTranslate(texts: string[]): Promise<string[]> {
  const key    = process.env.AZURE_TRANSLATOR_KEY
  const region = process.env.AZURE_TRANSLATOR_REGION

  if (!key || !region) {
    throw new Error("AZURE_TRANSLATOR_KEY e AZURE_TRANSLATOR_REGION são obrigatórios")
  }

  const url = `${AZURE_ENDPOINT}/translate?api-version=3.0&from=es&to=pt-br&textType=html`

  const body = texts.map((text) => ({ Text: text }))

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key":    key,
      "Ocp-Apim-Subscription-Region": region,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Azure Translator error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as { translations: { text: string }[] }[]
  return data.map((item) => item.translations[0].text)
}

// ─── Slug uniqueness ──────────────────────────────────────────────────────────

async function uniqueSlugPt(base: string): Promise<string> {
  let candidate = base
  let counter   = 2
  while (true) {
    const existing = await prisma.articleTranslation.findUnique({ where: { slugPt: candidate } })
    if (!existing) return candidate
    candidate = `${base}-${counter}`
    counter++
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function translateArticle(input: TranslateArticleInput): Promise<TranslateArticleResult> {
  // 1. Check monthly quota
  const used = await getMonthlyUsage()
  const totalChars =
    (input.title?.length ?? 0) +
    (input.subtitle?.length ?? 0) +
    (input.body?.length ?? 0) +
    (input.heroAlt?.length ?? 0) +
    (input.metaTitle?.length ?? 0) +
    (input.metaDesc?.length ?? 0)

  if (used + totalChars >= CHAR_LIMIT) {
    throw new Error(
      `Limite mensal de tradução atingido (${used.toLocaleString()} / ${CHAR_LIMIT.toLocaleString()} chars). Aguarde o próximo mês.`
    )
  }
  if (used + totalChars >= CHAR_WARN) {
    console.warn(`[azure-translator] ⚠ Uso mensal acima de 80%: ${(used + totalChars).toLocaleString()} chars`)
  }

  // 2. Load glossary and no-translate names
  const [glossary, noTranslateNames] = await Promise.all([
    loadGlossaryMap(),
    getNoTranslateNames(),
  ])

  // 3. Pre-process: wrap no-translate names
  function preProcess(text: string): string {
    return wrapNoTranslate(text, noTranslateNames)
  }

  const textsToTranslate = [
    preProcess(input.title),
    input.subtitle ? preProcess(input.subtitle) : null,
    preProcess(input.body),
    input.heroAlt  ? preProcess(input.heroAlt)  : null,
    input.metaTitle ? preProcess(input.metaTitle) : null,
    input.metaDesc  ? preProcess(input.metaDesc)  : null,
  ]

  const nonNull  = textsToTranslate.filter((t): t is string => t !== null)
  const charCount = nonNull.reduce((acc, t) => acc + t.length, 0)

  // 4. Call Azure
  const translated = await callAzureTranslate(nonNull)

  // 5. Post-process: strip no-translate markup, apply glossary
  let idx = 0
  function next(): string {
    const raw = translated[idx++]
    return applyGlossary(stripNoTranslateMarkup(raw), glossary)
  }

  const titlePt    = next()
  const subtitlePt = input.subtitle  ? next() : undefined
  const bodyPt     = next()
  const heroAltPt  = input.heroAlt   ? next() : undefined
  const metaTitlePt = input.metaTitle ? next() : undefined
  const metaDescPt  = input.metaDesc  ? next() : undefined

  // 6. Determine status (needs review if numbers diverge)
  let status: TranslationStatus = "AUTO"
  if (
    detectDivergence(input.title,   titlePt) ||
    detectDivergence(input.body,    bodyPt) ||
    (input.subtitle && subtitlePt && detectDivergence(input.subtitle, subtitlePt))
  ) {
    status = "REVIEW"
  }

  // 7. Generate unique slug PT
  const slugBase = slugify(titlePt)
  const slugPt   = await uniqueSlugPt(slugBase)

  // 8. Record usage
  await addMonthlyUsage(charCount)

  return {
    titlePt,
    subtitlePt,
    bodyPt,
    slugPt,
    heroAltPt,
    metaTitlePt,
    metaDescPt,
    status,
    charsUsed: charCount,
  }
}
