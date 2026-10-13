import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSubscriberFromCookie } from "@/lib/subscriber-auth"

export async function PUT(req: Request) {
  const payload = await getSubscriberFromCookie()
  if (!payload) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { newsletterOptIn } = await req.json()
  if (typeof newsletterOptIn !== "boolean") {
    return NextResponse.json(
      { error: "newsletterOptIn debe ser true o false" },
      { status: 400 }
    )
  }

  const subscriber = await prisma.subscriber.update({
    where: { id: payload.sub },
    data: { newsletterOptIn },
    select: {
      id: true,
      email: true,
      name: true,
      newsletterOptIn: true,
      emailVerified: true,
    },
  })

  return NextResponse.json({ subscriber })
}
