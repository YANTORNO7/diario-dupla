export {}
/**
 * Verifica todas as URLs publicadas em produção
 * Run: npx tsx scripts/verify-all-urls.ts
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const PROD = "https://diariodupla.com"
const DELAY_MS = 300  // be gentle with the server

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function checkUrl(url: string): Promise<{ status: number; title: string; canonical: string }> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "DiarioDupla-VerifyBot/1.0" },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return { status: res.status, title: "", canonical: "" }

    const html = await res.text()
    const titleMatch = html.match(/"og:title","content":"([^"]+)"/)
    const canonicalMatch = html.match(/"canonical","url":"([^"]+)"/)
    return {
      status:    res.status,
      title:     titleMatch?.[1] ?? "",
      canonical: canonicalMatch?.[1] ?? "",
    }
  } catch (e: unknown) {
    const err = e as { name?: string }
    return { status: err?.name === "TimeoutError" ? 408 : 0, title: "", canonical: "" }
  }
}

async function run() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      primarySection: { select: { slug: true, parent: { select: { slug: true } } } }
    }
  })

  const total = articles.length
  let ok = 0, notOk = 0
  const failures: { path: string; status: number; title: string }[] = []

  console.log(`Verificando ${total} artigos em ${PROD}...\n`)

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i]
    const path = a.primarySection?.parent
      ? `/${a.primarySection.parent.slug}/${a.primarySection.slug}/${a.slug}`
      : a.primarySection
      ? `/${a.primarySection.slug}/${a.slug}`
      : `/${a.slug}`

    const { status, title, canonical } = await checkUrl(`${PROD}${path}`)

    const canonicalOk = !canonical || canonical === `${PROD}${path}`
    const is200 = status === 200

    if (is200 && canonicalOk) {
      ok++
    } else {
      notOk++
      failures.push({ path, status, title })
      console.log(`✗ [${status}] ${path}`)
      if (!canonicalOk) console.log(`  canonical mismatch: ${canonical}`)
    }

    if ((i + 1) % 25 === 0) {
      console.log(`  ... ${i + 1}/${total} verificados (${ok} ok, ${notOk} falhas)`)
    }

    await sleep(DELAY_MS)
  }

  console.log(`\n${"═".repeat(60)}`)
  console.log(`RESULTADO FINAL`)
  console.log(`${"═".repeat(60)}`)
  console.log(`Total artigos: ${total}`)
  console.log(`✓ OK (200 + canonical correto): ${ok}`)
  console.log(`✗ Falhas: ${notOk}`)
  if (failures.length > 0) {
    console.log(`\nFalhas detalhadas:`)
    for (const f of failures) {
      console.log(`  [${f.status}] ${f.path}`)
    }
  }

  await prisma.$disconnect()
}
run().catch(console.error)
