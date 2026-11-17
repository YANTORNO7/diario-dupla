"use client"

import { useState, useEffect } from "react"

export default function WelcomeBanner() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("welcome") !== "1") return

    // Remover ?welcome=1 da URL imediatamente
    const url = new URL(window.location.href)
    url.searchParams.delete("welcome")
    history.replaceState(null, "", url.pathname + (url.search || ""))

    setVisible(true)

    // Iniciar fade após 3.5s, remover aos 4s
    const fadeTimer = setTimeout(() => setFading(true), 3500)
    const hideTimer = setTimeout(() => setVisible(false), 4000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-3 px-4 text-center transition-opacity duration-500"
      style={{
        background: "#0B1631",
        opacity: fading ? 0 : 1,
      }}
    >
      <p className="font-cuerpo text-sm font-semibold" style={{ color: "#F2B632" }}>
        ¡Bienvenido a la comunidad DUPLA!
      </p>
    </div>
  )
}
