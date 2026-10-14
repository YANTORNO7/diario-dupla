import { SITE_URL } from "./constants"

/**
 * Pinga o Google para re-crawlar o sitemap e/ou uma URL específica.
 * Feito de forma assíncrona (fire-and-forget) para não bloquear a resposta.
 */
export async function pingGoogle(articlePath?: string) {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`

  // Ping sitemap via Google
  fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`).catch(() => {})

  // Ping via IndexNow (Bing, Yandex, etc.)
  if (articlePath) {
    const articleUrl = `${SITE_URL}${articlePath}`
    fetch(`https://www.bing.com/indexnow?url=${encodeURIComponent(articleUrl)}&key=diariodupla`).catch(() => {})
  }
}
