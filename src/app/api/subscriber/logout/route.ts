import { NextResponse } from "next/server"
import { clearSubscriberCookie } from "@/lib/subscriber-auth"

export async function POST() {
  await clearSubscriberCookie()
  return NextResponse.json({ ok: true })
}
