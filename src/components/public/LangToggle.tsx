"use client"

import { useEffect, useState } from "react"

type GeoData = { country: string | null; ptMode: string }

type Props = {
  /**
   * If provided, the toggle links to the equivalent page in the other language.
   * On ES pages: ptHref = "/pt/..."
   * On PT pages: esHref = "/es-equivalent-url"
   */
  ptHref?: string
  esHref?: string
  /** Which language is the current page? */
  currentLang: "es" | "pt"
}

function isBot(): boolean {
  if (typeof navigator === "undefined") return true
  return /bot|crawl|spider|slurp/i.test(navigator.userAgent)
}

export default function LangToggle({ ptHref, esHref, currentLang }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isBot()) return

    // Always show on PT pages
    if (currentLang === "pt") { setVisible(true); return }

    // On ES pages: show only if ptMode=public AND visitor is from BR or has lang=pt cookie
    async function check() {
      try {
        const res  = await fetch("/api/geo")
        const data = (await res.json()) as GeoData
        if (data.ptMode !== "public") return
        const cookies   = document.cookie.split(";").map((c) => c.trim())
        const langCookie = cookies.find((c) => c.startsWith("lang="))?.split("=")[1]
        if (data.country === "BR" || langCookie === "pt") setVisible(true)
      } catch {
        // fail silently
      }
    }
    check()
  }, [currentLang])

  if (!visible) return null

  if (currentLang === "es" && ptHref) {
    return (
      <a
        href={ptHref}
        onClick={() => { document.cookie = "lang=pt; path=/; max-age=" + 30 * 24 * 60 * 60 }}
        className="text-xs font-cuerpo text-gray-400 hover:text-[#FFDF00] transition-colors px-2 py-1 border border-gray-600 rounded"
        title="Ler em português"
      >
        ES | PT
      </a>
    )
  }

  if (currentLang === "pt" && esHref) {
    return (
      <a
        href={esHref}
        onClick={() => { document.cookie = "lang=es; path=/; max-age=" + 30 * 24 * 60 * 60 }}
        className="text-xs font-cuerpo text-[#FFDF00] hover:text-white transition-colors px-2 py-1 border border-[#FFDF00]/50 rounded"
        title="Ver en español"
      >
        ES | PT
      </a>
    )
  }

  return null
}
