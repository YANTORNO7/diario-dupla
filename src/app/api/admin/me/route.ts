import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-guard"

export async function PATCH(request: NextRequest) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const userId = (session.user as any).id as string
  const body = await request.json()
  const { avatarUrl } = body

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: avatarUrl ?? null },
    select: { id: true, name: true, avatarUrl: true },
  })

  return NextResponse.json(user)
}
