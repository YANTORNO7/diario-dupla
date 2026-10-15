import { SITE_URL } from "./constants"

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "diariodupla"

/**
 * Envía una URL a IndexNow (Bing, Yandex, Naver, Seznam, etc.)
 * POST al hub central que distribuye a todos los motores participantes.
 */
async function submitIndexNow(url: string) {
  try {
    const host = new URL(SITE_URL).host
    const response = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: [url],
      }),
    })
    console.log(`[IndexNow] ${url} — status ${response.status}`)
  } catch (error) {
    console.error("[IndexNow] Error:", error)
  }
}

/**
 * Ping al hub PubSubHubbub de Google.
 * Google monitorea este hub para descubrir contenido nuevo en feeds/sitemaps.
 * Totalmente gratuito, no requiere ninguna cuenta ni API key.
 */
async function pingPubSubHubbub() {
  const urls = [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/feed.xml`]

  for (const url of urls) {
    try {
      const response = await fetch("https://pubsubhubbub.appspot.com/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "hub.mode": "publish",
          "hub.url": url,
        }),
      })
      console.log(`[PubSubHubbub] ${url} — status ${response.status}`)
    } catch (error) {
      console.error(`[PubSubHubbub] ${url} Error:`, error)
    }
  }
}

/**
 * Notifica a todos los motores de búsqueda sobre una URL nueva/actualizada.
 * Se llama al publicar un artículo — fire-and-forget, nunca bloquea.
 */
export async function pingGoogle(articlePath?: string) {
  if (!articlePath) return

  const articleUrl = `${SITE_URL}${articlePath}`

  await Promise.allSettled([
    submitIndexNow(articleUrl),
    pingPubSubHubbub(),
  ])
}
