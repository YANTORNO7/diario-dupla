import { createSign } from "crypto"
import { SITE_URL } from "./constants"

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "diariodupla"

async function getGoogleAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY?.replace(/\\n/g, "\n")
  if (!clientEmail || !privateKey) return null
  try {
    const now = Math.floor(Date.now() / 1000)
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url")
    const payload = Buffer.from(JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })).toString("base64url")
    const sign = createSign("RSA-SHA256")
    sign.update(`${header}.${payload}`)
    const signature = sign.sign(privateKey, "base64url")
    const jwt = `${header}.${payload}.${signature}`
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    })
    if (!res.ok) { console.warn("[GoogleIndexingAPI] token error", res.status); return null }
    const { access_token } = await res.json()
    return access_token as string
  } catch (e) {
    console.warn("[GoogleIndexingAPI] token exception", e)
    return null
  }
}

async function submitGoogleIndexingAPI(url: string) {
  const token = await getGoogleAccessToken()
  if (!token) return
  const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url, type: "URL_UPDATED" }),
  })
  console.log(`[GoogleIndexingAPI] ${url} — status ${res.status}`)
}

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
  const hubs = [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/news-sitemap.xml`, `${SITE_URL}/feed.xml`]
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

async function pingSitemaps() {
  const sitemaps = [
    `${SITE_URL}/sitemap.xml`,
    `${SITE_URL}/news-sitemap.xml`,
  ]
  for (const url of sitemaps) {
    try {
      const res = await fetch(
        `https://www.google.com/ping?sitemap=${encodeURIComponent(url)}`
      )
      console.log(`[Google ping] ${url} — status ${res.status}`)
    } catch { /* best-effort */ }
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
    pingSitemaps(),
    submitGoogleIndexingAPI(articleUrl),
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
