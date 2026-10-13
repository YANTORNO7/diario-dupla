import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SITE_URL, SITE_NAME } from "@/lib/constants"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")

  if (!email) {
    return new NextResponse(html("Error", "Link inválido."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    })
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { email },
  })

  if (!subscriber) {
    return new NextResponse(html("Error", "No encontramos tu suscripción."), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    })
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { newsletterOptIn: false },
  })

  return new NextResponse(
    html(
      "Suscripción cancelada",
      "Ya no recibirás emails de newsletter. Podés volver a activarla desde tu cuenta."
    ),
    { headers: { "Content-Type": "text/html" } }
  )
}

function html(title: string, message: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — ${SITE_NAME}</title></head>
<body style="margin:0;padding:40px 16px;font-family:Arial,sans-serif;background:#f4f4f4;text-align:center;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;">
    <h1 style="font-size:20px;color:#111;">${title}</h1>
    <p style="color:#666;">${message}</p>
    <a href="${SITE_URL}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:4px;">Ir a ${SITE_NAME}</a>
  </div>
</body>
</html>`
}
