import { NextResponse } from "next/server"

// Public images proxy — no auth needed (only fetches public HTTPS URLs)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url || !url.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  try {
    // Use a Chrome UA so Google Fonts CSS returns WOFF2 format
    const ua = url.includes("fonts.googleapis.com")
      ? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      : "Mozilla/5.0 DiarioDupla/1.0 ImageProxy"
    const res = await fetch(url, { headers: { "User-Agent": ua } })
    if (!res.ok) {
      return NextResponse.json({ error: `upstream ${res.status}` }, { status: 502 })
    }
    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get("content-type") || "image/png"
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
