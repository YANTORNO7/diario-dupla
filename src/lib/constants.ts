export type Section = "ARGENTINA" | "BRASIL"

export const SECTIONS: Record<Section, { label: string; slug: string; color: string }> = {
  ARGENTINA: {
    label: "Argentina",
    slug: "argentina",
    color: "#75AADB",
  },
  BRASIL: {
    label: "Brasil",
    slug: "brasil",
    color: "#009C3B",
  },
} as const

export const ROLES = {
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
} as const

export const SITE_NAME = "Diario Dupla"
export const SITE_DESCRIPTION = "El diario del fútbol argentino y brasileño"
export const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"
