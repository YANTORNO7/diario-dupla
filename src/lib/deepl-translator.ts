/**
 * deepl-translator.ts
 *
 * Integração com DeepL API Free.
 * - Preserva HTML via tag_handling=html
 * - Marca nomes próprios com <span translate="no"> para não traduzir
 * - Usa glossário DeepL para termos ES→PT
 * - Lê uso real do período via /v2/usage (período DeepL: dia 14 ao dia 14)
 * - Avisa ao atingir 80% do limite (800.000 chars)
 * - Rejeita se uso do período >= 1.000.000 chars
 */

import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"

const DEEPL_ENDPOINT = "https://api-free.deepl.com"
const CHAR_LIMIT = 1_000_000
const CHAR_WARN  =   800_000

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
  titlePt:      string
  subtitlePt?:  string
  bodyPt:       string
  slugPt:       string
  heroAltPt?:   string
  metaTitlePt?: string
  metaDescPt?:  string
  status:       TranslationStatus
  charsUsed:    number
}

// ─── DeepL usage (billing period: 14th to 14th) ──────────────────────────────

export async function getDeepLUsage(): Promise<{ used: number; limit: number }> {
  const key = process.env.DEEPL_API_KEY
  if (!key) throw new Error("DEEPL_API_KEY não configurada")

  const res = await fetch(`${DEEPL_ENDPOINT}/v2/usage`, {
    headers: { Authorization: `DeepL-Auth-Key ${key}` },
  })
  if (!res.ok) throw new Error(`DeepL /v2/usage error ${res.status}`)

  const data = (await res.json()) as { character_count: number; character_limit: number }
  return { used: data.character_count, limit: data.character_limit }
}

// ─── Club names from DB ───────────────────────────────────────────────────────

async function getNoTranslateNames(): Promise<string[]> {
  const [clubs, noTranslateTerms] = await Promise.all([
    prisma.club.findMany({ select: { name: true, shortName: true } }),
    prisma.glossaryTerm.findMany({ where: { type: "NO_TRANSLATE" }, select: { esWord: true } }),
  ])

  const names: string[] = []
  for (const club of clubs) {
    names.push(club.name, club.shortName)
  }
  for (const term of noTranslateTerms) {
    names.push(term.esWord)
  }
  return [...new Set(names.filter(Boolean))]
}

// ─── Proper noun wrapping ─────────────────────────────────────────────────────
// Wraps uppercase-initial names with <span translate="no"> for DeepL HTML mode.

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
  // DeepL sometimes contracts "de + o + [Name]" → "d<span>Name</span>" (elision artifact).
  // Restore the missing "o" for masculine proper nouns (the overwhelming majority in sports).
  result = result.replace(/\bd(<span translate="no">)/g, "do $1")
  // DeepL occasionally drops the space between </span> and the following word.
  result = result.replace(/<\/span>(\w)/g, "</span> $1")
  return result.replace(/<span translate="no">(.*?)<\/span>/g, "$1")
}

// ─── DeepL Glossary ───────────────────────────────────────────────────────────
// DeepL glossaries are immutable after creation.
// We store the glossary_id in SiteConfig and recreate when terms change.

type GlossaryMap = Map<string, string>

async function loadGlossaryMap(): Promise<GlossaryMap> {
  const terms = await prisma.glossaryTerm.findMany({ where: { type: "GLOSSARY" } })
  const map = new Map<string, string>()
  for (const t of terms) {
    map.set(t.esWord.toLowerCase(), t.ptWord)
  }
  return map
}

function glossaryToTsv(glossary: GlossaryMap): string {
  return [...glossary.entries()].map(([es, pt]) => `${es}\t${pt}`).join("\n")
}

async function checkGlossaryPairSupported(key: string): Promise<boolean> {
  const res = await fetch(`${DEEPL_ENDPOINT}/v2/glossary-language-pairs`, {
    headers: { Authorization: `DeepL-Auth-Key ${key}` },
  })
  if (!res.ok) return false
  const data = (await res.json()) as { supported_languages: { source_lang: string; target_lang: string }[] }
  return data.supported_languages.some(
    (p) => p.source_lang.toLowerCase() === "es" && p.target_lang.toLowerCase() === "pt-br"
  )
}

export async function createDeepLGlossary(): Promise<string | null> {
  const key = process.env.DEEPL_API_KEY
  if (!key) throw new Error("DEEPL_API_KEY não configurada")

  const supported = await checkGlossaryPairSupported(key)
  if (!supported) {
    console.warn("[deepl] Glossário ES→PT-BR não suportado nesta conta — aplicando manualmente")
    return null
  }

  const glossary = await loadGlossaryMap()
  if (glossary.size === 0) return null

  // Delete existing glossary if stored
  const existing = await prisma.siteConfig.findUnique({ where: { key: "deepl_glossary_id" } })
  if (existing?.value) {
    await fetch(`${DEEPL_ENDPOINT}/v2/glossaries/${existing.value}`, {
      method: "DELETE",
      headers: { Authorization: `DeepL-Auth-Key ${key}` },
    }).catch(() => {})
  }

  const res = await fetch(`${DEEPL_ENDPOINT}/v2/glossaries`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name:          "diario-dupla-es-ptbr",
      source_lang:   "ES",
      target_lang:   "PT-BR",
      entries:       glossaryToTsv(glossary),
      entries_format: "tsv",
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.warn(`[deepl] Erro ao criar glossário: ${err} — aplicando manualmente`)
    return null
  }

  const data = (await res.json()) as { glossary_id: string }
  const glossaryId = data.glossary_id

  // Persist in SiteConfig
  await prisma.siteConfig.upsert({
    where:  { key: "deepl_glossary_id" },
    update: { value: glossaryId },
    create: { key: "deepl_glossary_id", value: glossaryId },
  })

  return glossaryId
}

async function getOrCreateGlossaryId(): Promise<string | null> {
  const key = process.env.DEEPL_API_KEY
  if (!key) return null

  const rec = await prisma.siteConfig.findUnique({ where: { key: "deepl_glossary_id" } })
  if (!rec?.value) return createDeepLGlossary()

  // Verify it still exists in DeepL
  const res = await fetch(`${DEEPL_ENDPOINT}/v2/glossaries/${rec.value}`, {
    headers: { Authorization: `DeepL-Auth-Key ${key}` },
  })
  if (res.ok) return rec.value

  // Stale — recreate
  return createDeepLGlossary()
}

// ─── Manual glossary fallback ─────────────────────────────────────────────────
// Used when DeepL glossary API is not available for the language pair.

/**
 * Match the capitalization of `source` onto `target`.
 * - source starts with uppercase → capitalize first letter of target
 * - source starts with lowercase → return target as-is (preserves proper noun casing)
 */
function matchCase(source: string, target: string): string {
  if (!source || !target) return target
  const isUpperFirst = source[0] === source[0].toUpperCase() && source[0] !== source[0].toLowerCase()
  if (isUpperFirst) return target[0].toUpperCase() + target.slice(1)
  return target
}

function applyGlossaryManually(text: string, glossary: GlossaryMap): string {
  let result = text
  const entries = [...glossary.entries()].sort((a, b) => b[0].length - a[0].length)
  for (const [es, pt] of entries) {
    const escaped = es.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    result = result.replace(new RegExp(`\\b${escaped}\\b`, "gi"), (match) => matchCase(match, pt))
  }
  return result
}

// ─── Validation: number/score divergence ─────────────────────────────────────

function normalizeForComparison(text: string): string {
  // Strip HTML tags before comparing
  const noHtml = text.replace(/<[^>]+>/g, " ")
  // Remove thousand-separator dots: "1.000" → "1000" (pt-BR formatting)
  const noThousands = noHtml.replace(/(\d)\.(\d{3})(?!\d)/g, "$1$2")
  // Normalize PT score notation "3 a 0", "3 x 0" → "3-0" so they match ES "3-0"
  const noScoreFormat = noThousands.replace(/(\d+)\s+[axX]\s+(\d+)/g, "$1-$2")
  // Normalize spelled-out zero: "1 a zero" → "1 a 0" (PT-BR soccer convention)
  return noScoreFormat.replace(/\b(?:zero|cero)\b/gi, "0")
}

function extractNumbers(text: string): string[] {
  return text.match(/\d+(?:[.,]\d+)?/g) ?? []
}

function detectDivergence(original: string, translated: string): boolean {
  // Compare as sets: each number must be present in both texts at least once.
  // Count-based comparison causes false positives when DeepL rephrases one mention
  // of a score while preserving it elsewhere in the article.
  const origNums  = new Set(extractNumbers(normalizeForComparison(original)))
  const transNums = new Set(extractNumbers(normalizeForComparison(translated)))

  for (const n of origNums) {
    if (!transNums.has(n)) return true  // number from original missing in translation
  }
  for (const n of transNums) {
    if (!origNums.has(n)) return true  // hallucinated number not in original
  }
  return false
}

// ─── DeepL API call ───────────────────────────────────────────────────────────

async function callDeepL(texts: string[], glossaryId: string | null): Promise<string[]> {
  const key = process.env.DEEPL_API_KEY
  if (!key) throw new Error("DEEPL_API_KEY não configurada")

  const body: Record<string, unknown> = {
    text:         texts,
    source_lang:  "ES",
    target_lang:  "PT-BR",
    tag_handling: "html",
  }
  if (glossaryId) body.glossary_id = glossaryId

  const res = await fetch(`${DEEPL_ENDPOINT}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization:  `DeepL-Auth-Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepL error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as { translations: { text: string }[] }
  return data.translations.map((t) => t.text)
}

// ─── Slug helpers ─────────────────────────────────────────────────────────────

function truncateSlug(slug: string, maxWords = 8): string {
  const parts = slug.split("-").filter(Boolean)
  if (parts.length <= maxWords) return slug
  return parts.slice(0, maxWords).join("-")
}

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
  const key = process.env.DEEPL_API_KEY
  if (!key) throw new Error("DEEPL_API_KEY não configurada")

  // 1. Check usage quota
  const { used } = await getDeepLUsage()
  const totalChars =
    (input.title?.length     ?? 0) +
    (input.subtitle?.length  ?? 0) +
    (input.body?.length      ?? 0) +
    (input.heroAlt?.length   ?? 0) +
    (input.metaTitle?.length ?? 0) +
    (input.metaDesc?.length  ?? 0)

  if (used + totalChars >= CHAR_LIMIT) {
    throw new Error(
      `Limite do período DeepL atingido (${used.toLocaleString()} / ${CHAR_LIMIT.toLocaleString()} chars). Aguarde o próximo ciclo (dia 14).`
    )
  }
  if (used + totalChars >= CHAR_WARN) {
    console.warn(`[deepl] ⚠ Uso acima de 80%: ${(used + totalChars).toLocaleString()} chars`)
  }

  // 2. Load no-translate names and glossary concurrently
  const [noTranslateNames, glossary, glossaryId] = await Promise.all([
    getNoTranslateNames(),
    loadGlossaryMap(),
    getOrCreateGlossaryId(),
  ])

  // 3. Pre-process: wrap proper nouns with <span translate="no">
  function preProcess(text: string): string {
    return wrapNoTranslate(text, noTranslateNames)
  }

  const textsToTranslate = [
    preProcess(input.title),
    input.subtitle   ? preProcess(input.subtitle)   : null,
    preProcess(input.body),
    input.heroAlt    ? preProcess(input.heroAlt)    : null,
    input.metaTitle  ? preProcess(input.metaTitle)  : null,
    input.metaDesc   ? preProcess(input.metaDesc)   : null,
  ]

  const nonNull    = textsToTranslate.filter((t): t is string => t !== null)
  const charCount  = nonNull.reduce((acc, t) => acc + t.length, 0)

  // 4. Translate
  const translated = await callDeepL(nonNull, glossaryId)

  // 5. Post-process
  let idx = 0
  function next(): string {
    const raw     = translated[idx++]
    const stripped = stripNoTranslateMarkup(raw)
    // If glossary was not applied by DeepL (unsupported pair), apply manually
    return glossaryId ? stripped : applyGlossaryManually(stripped, glossary)
  }

  const titlePt     = next()
  const subtitlePt  = input.subtitle  ? next() : undefined
  const bodyPt      = next()
  const heroAltPt   = input.heroAlt   ? next() : undefined
  const metaTitlePt = input.metaTitle ? next() : undefined
  const metaDescPt  = input.metaDesc  ? next() : undefined

  // 6. Status
  let status: TranslationStatus = "AUTO"
  if (
    detectDivergence(input.title, titlePt) ||
    detectDivergence(input.body,  bodyPt)  ||
    (input.subtitle && subtitlePt && detectDivergence(input.subtitle, subtitlePt))
  ) {
    status = "REVIEW"
  }

  // 7. Slug — max 8 words, cut at word boundary
  const slugBase = truncateSlug(slugify(titlePt), 8)
  const slugPt   = await uniqueSlugPt(slugBase)

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
