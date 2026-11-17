/**
 * GET /api/admin/translation-usage
 * Returns real usage for the current DeepL billing period (14th to 14th).
 * Reads from DeepL /v2/usage — never counts locally.
 */

import { NextResponse } from "next/server"
import { requireAdminAPI } from "@/lib/auth-guard"
import { getDeepLUsage } from "@/lib/deepl-translator"

const CHAR_WARN  =   800_000
const CHAR_LIMIT = 1_000_000

export async function GET() {
  const session = await requireAdminAPI()
  if (session instanceof NextResponse) return session

  try {
    const { used, limit } = await getDeepLUsage()
    const effectiveLimit = Math.min(limit, CHAR_LIMIT)
    const pct    = Math.round((used / effectiveLimit) * 100)
    const warn   = used >= CHAR_WARN
    const blocked = used >= CHAR_LIMIT

    return NextResponse.json({ used, limit: effectiveLimit, pct, warn, blocked })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao consultar DeepL"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
