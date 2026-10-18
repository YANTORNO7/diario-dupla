import { NextResponse } from "next/server"

// Fonts used by all placas templates (must match docWrap in helpers.ts)
const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Archivo:ital,wght@0,400;0,600;0,800;1,600&display=swap"

const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

// Returns Google Fonts CSS with all font files embedded as base64 data URIs.
// Cached for 7 days — fonts change very rarely.
export async function GET() {
  try {
    const cssRes = await fetch(GOOGLE_FONTS_URL, {
      headers: { "User-Agent": CHROME_UA },
    })
    if (!cssRes.ok) {
      return new NextResponse("/* font-embed: upstream CSS error */", {
        headers: { "Content-Type": "text/css" },
      })
    }

    let css = await cssRes.text()

    // Extract all unique font file URLs
    const fontUrls = [
      ...new Set([...css.matchAll(/url\((https:\/\/[^)]+)\)/g)].map((m) => m[1])),
    ]

    // Fetch all font files in parallel and convert to data URIs
    const results = await Promise.allSettled(
      fontUrls.map(async (url) => {
        const res = await fetch(url, { headers: { "User-Agent": CHROME_UA } })
        if (!res.ok) throw new Error(`${res.status}`)
        const buffer = await res.arrayBuffer()
        const base64 = Buffer.from(buffer).toString("base64")
        const ct = res.headers.get("content-type") || "font/woff2"
        return [url, `data:${ct};base64,${base64}`] as [string, string]
      })
    )

    for (const r of results) {
      if (r.status === "fulfilled") {
        const [url, dataUri] = r.value
        css = css.replaceAll(url, dataUri)
      }
    }

    return new NextResponse(css, {
      headers: {
        "Content-Type": "text/css",
        "Cache-Control": "public, max-age=604800", // 7 days
      },
    })
  } catch (err) {
    console.error("[font-embed]", err)
    return new NextResponse("/* font-embed: error */", {
      headers: { "Content-Type": "text/css" },
    })
  }
}
