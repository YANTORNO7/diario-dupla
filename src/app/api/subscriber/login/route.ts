import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signSubscriberToken, setSubscriberCookie } from "@/lib/subscriber-auth"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      )
    }

    const subscriber = await prisma.subscriber.findUnique({ where: { email } })
    if (!subscriber) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, subscriber.password)
    if (!valid) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      )
    }

    const token = await signSubscriberToken({
      sub: subscriber.id,
      email: subscriber.email,
      name: subscriber.name,
    })
    await setSubscriberCookie(token)

    return NextResponse.json({
      id: subscriber.id,
      email: subscriber.email,
      name: subscriber.name,
      newsletterOptIn: subscriber.newsletterOptIn,
      emailVerified: subscriber.emailVerified,
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
