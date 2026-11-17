import { NextResponse } from "next/server"
import { requireAdminAPI } from "@/lib/auth-guard"
import { resend, FROM_EMAIL } from "@/lib/resend"

export async function POST(req: Request) {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  const { to } = await req.json()
  if (!to) return NextResponse.json({ error: "to requerido" }, { status: 400 })

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Email de prueba — Diario Dupla",
    html: `<p>Este es un email de prueba de <strong>Diario Dupla</strong>.</p><p>Remitente: ${FROM_EMAIL}</p>`,
  })

  return NextResponse.json({ result, from: FROM_EMAIL })
}
