import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSubscriberFromCookie } from "@/lib/subscriber-auth"

export async function GET() {
  const payload = await getSubscriberFromCookie()
  if (!payload) {
    return NextResponse.json({ subscriber: null })
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: payload.sub },
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
