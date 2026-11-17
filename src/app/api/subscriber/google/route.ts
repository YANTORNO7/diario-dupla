import { NextResponse } from "next/server"
import { SITE_URL } from "@/lib/constants"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const volver = searchParams.get("volver") ?? ""
  const source = searchParams.get("source") ?? ""

  // Validar volver por segurança
  const safeVolver = volver.startsWith("/") ? volver : ""

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    const fallback = safeVolver
      ? `/registro?volver=${encodeURIComponent(safeVolver)}&error=google_not_configured`
      : `/registro?error=google_not_configured`
    return NextResponse.redirect(`${SITE_URL}${fallback}`)
  }

  const state = Buffer.from(JSON.stringify({ volver: safeVolver, source })).toString("base64")

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${SITE_URL}/api/subscriber/google/callback`,
    response_type: "code",
    scope: "email profile openid",
    state,
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  )
}
