import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { signSubscriberToken, setSubscriberCookie } from "@/lib/subscriber-auth"
import { resend, FROM_EMAIL } from "@/lib/resend"
import { SITE_NAME, SITE_URL } from "@/lib/constants"

export async function POST(req: Request) {
  try {
    const { email, password, name, newsletterOptIn } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, contraseña y nombre son obligatorios" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const existing = await prisma.subscriber.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomUUID()

    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        password: hashedPassword,
        name,
        newsletterOptIn: newsletterOptIn ?? true,
        verificationToken,
      },
    })

    // Enviar email de verificação
    const verifyUrl = `${SITE_URL}/api/subscriber/verify?token=${verificationToken}`
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Verificá tu email — ${SITE_NAME}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
            <h2 style="color:#111;">¡Hola ${name}!</h2>
            <p>Gracias por registrarte en <strong>${SITE_NAME}</strong>.</p>
            <p>Hacé clic en el botón para verificar tu email:</p>
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Verificar email</a>
            <p style="margin-top:24px;font-size:12px;color:#999;">Si no creaste esta cuenta, ignorá este email.</p>
          </div>
        `,
      })
    } catch {
      // Não bloquear registro se email falhar
      console.error("Error enviando email de verificación")
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
    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
