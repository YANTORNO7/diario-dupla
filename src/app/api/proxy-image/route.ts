import { NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth-guard"

export async function GET(request: Request) {
  const auth = await requireAuthAPI()
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url || !url.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 DiarioDupla/1.0 ImageProxy" },
    })
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
