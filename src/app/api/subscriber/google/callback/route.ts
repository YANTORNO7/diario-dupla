import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { signSubscriberToken, setSubscriberCookie } from "@/lib/subscriber-auth"
import { SITE_URL } from "@/lib/constants"

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  error?: string
}

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  verified_email: boolean
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const stateParam = searchParams.get("state")

  if (!code) {
    return NextResponse.redirect(`${SITE_URL}/registro?error=google_no_code`)
  }

  // Decodificar state
  let volver = ""
  let source = ""
  try {
    const decoded = JSON.parse(Buffer.from(stateParam ?? "", "base64").toString("utf-8"))
    volver = typeof decoded.volver === "string" && decoded.volver.startsWith("/") ? decoded.volver : ""
    source = typeof decoded.source === "string" ? decoded.source : ""
  } catch {
    // state inválido, continuar sem volver
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${SITE_URL}/registro?error=google_not_configured`)
  }

  // 1. Trocar code por tokens
  let tokenData: GoogleTokenResponse
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${SITE_URL}/api/subscriber/google/callback`,
        grant_type: "authorization_code",
      }),
    })
    tokenData = await tokenRes.json()
  } catch {
    return NextResponse.redirect(`${SITE_URL}/registro?error=google_token_failed`)
  }

  if (tokenData.error || !tokenData.access_token) {
    return NextResponse.redirect(`${SITE_URL}/registro?error=google_token_failed`)
  }

  // 2. Buscar informações do usuário
  let userInfo: GoogleUserInfo
  try {
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    userInfo = await userRes.json()
  } catch {
    return NextResponse.redirect(`${SITE_URL}/registro?error=google_userinfo_failed`)
  }

  if (!userInfo.email) {
    return NextResponse.redirect(`${SITE_URL}/registro?error=google_no_email`)
  }

  const signupSource = source === "popup" ? "popup-google" : "google"

  // 3. Encontrar ou criar subscriber
  let subscriber = await prisma.subscriber.findUnique({
    where: { googleId: userInfo.id },
  })

  if (!subscriber) {
    // Verificar se existe por email
    const byEmail = await prisma.subscriber.findUnique({
      where: { email: userInfo.email },
    })

    if (byEmail) {
      // Vincular conta Google existente
      subscriber = await prisma.subscriber.update({
        where: { id: byEmail.id },
        data: { googleId: userInfo.id },
      })
    } else {
      // Criar novo subscriber
      subscriber = await prisma.subscriber.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          googleId: userInfo.id,
          emailVerified: true,
          password: null,
          signupSource,
        },
      })
    }
  }

  // 4. Criar cookie de sessão
  const token = await signSubscriberToken({
    sub: subscriber.id,
    email: subscriber.email,
    name: subscriber.name,
  })
  await setSubscriberCookie(token)

  // 5. Redirecionar com welcome
  const destination = volver ? `${SITE_URL}${volver}?welcome=1` : `${SITE_URL}?welcome=1`
  return NextResponse.redirect(destination)
}
