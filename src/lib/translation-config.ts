/**
 * translation-config.ts
 * Reads SiteConfig values from the database.
 */

import { prisma } from "@/lib/prisma"

export type PtMode = "off" | "admin" | "public"
export type TranslationProvider = "deepl" | "azure"

export async function getSiteConfig(key: string): Promise<string | null> {
  const rec = await prisma.siteConfig.findUnique({ where: { key } })
  return rec?.value ?? null
}

export async function getPtMode(): Promise<PtMode> {
  const val = await getSiteConfig("pt_mode")
  if (val === "admin" || val === "public") return val
  return "off"
}

export async function getTranslationProvider(): Promise<TranslationProvider> {
  const val = await getSiteConfig("translation_provider")
  if (val === "azure") return "azure"
  return "deepl"
}
