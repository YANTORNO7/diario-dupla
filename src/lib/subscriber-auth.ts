import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const COOKIE_NAME = "subscriber-token"
const secret = new TextEncoder().encode(
  process.env.SUBSCRIBER_JWT_SECRET || "dev-subscriber-secret"
)

interface SubscriberPayload {
  sub: string
  email: string
  name: string
  [key: string]: unknown
}

export async function signSubscriberToken(payload: SubscriberPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret)
}

export async function verifySubscriberToken(token: string): Promise<SubscriberPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SubscriberPayload
  } catch {
    return null
  }
}

export async function setSubscriberCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  })
}

export async function clearSubscriberCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getSubscriberFromCookie(): Promise<SubscriberPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySubscriberToken(token)
}
