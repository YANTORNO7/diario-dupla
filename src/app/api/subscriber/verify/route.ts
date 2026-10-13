import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SITE_URL } from "@/lib/constants"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(`${SITE_URL}/verificar?status=error`)
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { verificationToken: token },
  })

  if (!subscriber) {
    return NextResponse.redirect(`${SITE_URL}/verificar?status=invalid`)
  }

  if (subscriber.emailVerified) {
    return NextResponse.redirect(`${SITE_URL}/verificar?status=already`)
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { emailVerified: true, verificationToken: null },
  })

  return NextResponse.redirect(`${SITE_URL}/verificar?status=success`)
}
