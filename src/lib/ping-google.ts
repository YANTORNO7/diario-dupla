import { SITE_URL } from "./constants"

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "diariodupla"

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries) throw err
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error("unreachable")
}

async function submitIndexNow(urls: string[]) {
  const host = new URL(SITE_URL).host
  await withRetry(async () => {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    })
    console.log(`[IndexNow] ${urls.length} URL(s) — status ${res.status}`)
  })
}

async function pingPubSubHubbub() {
  const hubs = [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/feed.xml`]
  for (const url of hubs) {
    await withRetry(async () => {
      const res = await fetch("https://pubsubhubbub.appspot.com/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ "hub.mode": "publish", "hub.url": url }),
      })
      console.log(`[PubSubHubbub] ${url} — status ${res.status}`)
    })
  }
}

/**
 * Notifica Google e motores de búsqueda al publicar un artículo.
 * Fire-and-forget — nunca bloquea la respuesta al usuario.
 */
export async function pingGoogle(articlePath?: string) {
  if (!articlePath) return
  const articleUrl = `${SITE_URL}${articlePath}`
  await Promise.allSettled([
    submitIndexNow([articleUrl]),
    pingPubSubHubbub(),
  ])
}

/**
 * Submete em bulk todas as URLs para indexação — usar quando há artigos sem indexar.
 */
export async function pingGoogleBulk(urls: string[]) {
  if (urls.length === 0) return
  await Promise.allSettled([
    submitIndexNow(urls),
    pingPubSubHubbub(),
  ])
}
