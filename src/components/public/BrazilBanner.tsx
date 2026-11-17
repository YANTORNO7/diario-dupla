"use client"

import { useEffect, useState } from "react"

type GeoData = { country: string | null; ptMode: string }

type Props = {
  ptUrl:          string   // full URL to PT article
  esUrl:          string   // full URL to ES article (current page)
}

// Basic bot UA check — banner should not be shown to crawlers
function isBot(): boolean {
  if (typeof navigator === "undefined") return true
  return /bot|crawl|spider|slurp|ia_archiver|facebookexternalhit|linkedinbot|twitterbot/i.test(
    navigator.userAgent
  )
}

export default function BrazilBanner({ ptUrl, esUrl }: Props) {
  const [show, setShow]       = useState(false)
  const [dismissed, setDis]   = useState(false)

  useEffect(() => {
    if (isBot()) return

    // Check cookie dismissal
    const cookies = document.cookie.split(";").map((c) => c.trim())
    const langCookie = cookies.find((c) => c.startsWith("lang="))?.split("=")[1]
    if (langCookie === "es") return  // user chose ES explicitly

    async function check() {
      try {
        const res  = await fetch("/api/geo")
        const data = (await res.json()) as GeoData
        if (data.ptMode !== "public") return
        const isBrazil = data.country === "BR" || langCookie === "pt"
        if (isBrazil) setShow(true)
      } catch {
        // fail silently
      }
    }
    check()
  }, [])

  if (!show || dismissed) return null

  function handlePt() {
    document.cookie = "lang=pt; path=/; max-age=" + 30 * 24 * 60 * 60
    window.location.href = ptUrl
  }

  function handleDismiss() {
    document.cookie = "lang=es; path=/; max-age=" + 30 * 24 * 60 * 60
    setDis(true)
  }

  return (
    <>
      {/* Mobile: fixed card at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ background: "#111214" }}>
        {/* Brasil flag stripe */}
        <div className="flex h-1">
          <div className="flex-1" style={{ background: "#009C3B" }} />
          <div className="flex-1" style={{ background: "#FFDF00" }} />
          <div className="flex-1" style={{ background: "#009C3B" }} />
        </div>
        <div className="p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-white font-titular text-base leading-tight">DUPLA</p>
            <p className="text-gray-300 text-xs font-cuerpo mt-0.5">Esta nota está disponível em português</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handlePt}
              className="px-3 py-1.5 text-xs font-cuerpo font-bold uppercase tracking-wider rounded"
              style={{ background: "#FFDF00", color: "#111214" }}
            >
              Ler em PT
            </button>
            <button onClick={handleDismiss} className="text-gray-400 hover:text-white p-1.5" aria-label="Fechar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: fixed bar above header */}
      <div className="fixed top-0 left-0 right-0 z-[60] hidden md:flex items-center justify-center gap-4 py-2 px-4" style={{ background: "#111214" }}>
        {/* Brasil flag stripe on the left */}
        <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col">
          <div className="flex-1" style={{ background: "#009C3B" }} />
          <div className="flex-1" style={{ background: "#FFDF00" }} />
          <div className="flex-1" style={{ background: "#009C3B" }} />
        </div>
        <span className="text-gray-200 text-sm font-cuerpo">
          Esta nota está disponível em português
        </span>
        <button
          onClick={handlePt}
          className="px-4 py-1 text-xs font-cuerpo font-bold uppercase tracking-wider rounded"
          style={{ background: "#FFDF00", color: "#111214" }}
        >
          Ler tradução
        </button>
        <a href={esUrl} className="text-gray-400 hover:text-white text-xs font-cuerpo underline">
          Ver original
        </a>
        <button onClick={handleDismiss} className="text-gray-400 hover:text-white p-1 ml-2" aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </>
  )
}
