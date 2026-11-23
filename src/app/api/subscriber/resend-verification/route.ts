import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { getSubscriberFromCookie } from "@/lib/subscriber-auth"
import { getResend, FROM_EMAIL } from "@/lib/resend"
import { SITE_NAME, SITE_URL } from "@/lib/constants"

export async function POST() {
  const payload = await getSubscriberFromCookie()
  if (!payload) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { id: payload.sub } })
  if (!subscriber) {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 })
  }

  if (subscriber.emailVerified) {
    return NextResponse.json({ error: "El email ya está verificado" }, { status: 400 })
  }

  const token = crypto.randomUUID()
  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { verificationToken: token },
  })

  const verifyUrl = `${SITE_URL}/api/subscriber/verify?token=${token}`

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: subscriber.email,
    subject: `Verificá tu email — ${SITE_NAME}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#111;">¡Hola ${subscriber.name}!</h2>
        <p>Hacé clic en el botón para verificar tu email:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Verificar email</a>
        <p style="margin-top:24px;font-size:12px;color:#999;">Si no creaste esta cuenta, ignorá este email.</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
