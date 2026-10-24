import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-guard"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const { id } = await params
  const body = await request.json()

  const section = await prisma.section.update({
    where: { id },
    data: {
      ...(body.showOnHomepage !== undefined && { showOnHomepage: body.showOnHomepage }),
      ...(body.name !== undefined && { name: body.name }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.description !== undefined && { description: body.description || null }),
    },
  })

  return NextResponse.json(section)
}
