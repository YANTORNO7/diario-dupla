"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

const DISMISS_KEY = "dupla_prompt_dismissed"
const DISMISS_DAYS = 7

function isDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const ts = parseInt(raw, 10)
    if (isNaN(ts)) return false
    const diff = Date.now() - ts
    return diff < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {
    // ignorar erros de localStorage
  }
}

export default function SignupPrompt() {
  const [visible, setVisible] = useState(false)
  const [volver, setVolver] = useState("")

  const checkSubscriber = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/subscriber/me")
      const data = await res.json()
      return !!data.subscriber
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    setVolver(window.location.pathname)

    let timer: ReturnType<typeof setTimeout>

    async function init() {
      const loggedIn = await checkSubscriber()
      if (loggedIn) return
      if (isDismissedRecently()) return

      timer = setTimeout(async () => {
        // verificar novamente antes de mostrar
        const stillLoggedIn = await checkSubscriber()
        if (!stillLoggedIn) setVisible(true)
      }, 15000)
    }

    init()
    return () => clearTimeout(timer)
  }, [checkSubscriber])

  // Fechar automaticamente se o usuário fizer login com a janela aberta
  useEffect(() => {
    if (!visible) return

    async function handleFocus() {
      const loggedIn = await checkSubscriber()
      if (loggedIn) setVisible(false)
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [visible, checkSubscriber])

  function dismiss() {
    markDismissed()
    setVisible(false)
  }

  if (!visible) return null

  const volverEncoded = encodeURIComponent(volver)

  return (
    <div className="fixed z-40 animate-slide-up" style={{
      bottom: "32px",
      right: "32px",
      width: "475px",
      // Mobile: ocupar toda a largura com margem
    }}>
      {/* Desktop (≥768px) */}
      <div className="hidden md:block rounded-2xl overflow-hidden"
        style={{
          background: "#0B1631",
          boxShadow: "0 18px 40px rgba(0,0,0,.35)",
        }}
      >
        {/* Faixa de cores */}
        <div className="flex h-[6px]">
          <div className="flex-1" style={{ background: "#74ACDF" }} />
          <div className="flex-1" style={{ background: "#FFFFFF" }} />
          <div className="flex-1" style={{ background: "#009C3B" }} />
          <div className="flex-1" style={{ background: "#F2B632" }} />
        </div>

        {/* Conteúdo */}
        <div className="p-[26px] relative">
          {/* Botão fechar */}
          <button
            onClick={dismiss}
            aria-label="Cerrar"
            className="absolute top-4 right-4 flex items-center justify-center rounded-full"
            style={{
              width: 34,
              height: 34,
              background: "rgba(255,255,255,0.12)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Label */}
          <p className="text-[10px] font-cuerpo font-bold uppercase tracking-widest mb-2"
            style={{ color: "#F2B632" }}>
            Comunidad Dupla
          </p>

          {/* Título */}
          <h2 className="font-titular text-[26px] leading-tight text-white mb-2 pr-8">
            Seguí el fútbol argentino y brasileño sin límites
          </h2>

          {/* Subtítulo */}
          <p className="font-cuerpo text-sm mb-6" style={{ color: "#B8C2D9" }}>
            Accedé gratis a todas las notas, recibí las últimas noticias por
            email y formá parte de la comunidad.
          </p>

          {/* Botones */}
          <div className="flex flex-col gap-3 mb-4">
            {/* Google */}
            <a
              href={`/api/subscriber/google?volver=${volverEncoded}&source=popup`}
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-cuerpo font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: "#FFFFFF", color: "#111111" }}
            >
              <GoogleIcon />
              Continuar con Google
            </a>

            {/* Email */}
            <Link
              href={`/registro?volver=${volverEncoded}&source=popup`}
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-cuerpo font-semibold text-sm border transition-colors hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.25)", color: "#FFFFFF" }}
            >
              <MailIcon />
              Registrate con email
            </Link>
          </div>

          {/* Login link */}
          <p className="text-center font-cuerpo text-xs" style={{ color: "#8B9ABB" }}>
            ¿Ya tenés cuenta?{" "}
            <Link
              href={`/ingresar?volver=${volverEncoded}`}
              className="underline hover:text-white transition-colors"
              style={{ color: "#B8C2D9" }}
            >
              Ingresá
            </Link>
          </p>
        </div>
      </div>

      {/* Mobile (<768px) */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 rounded-[14px] overflow-hidden"
        style={{
          background: "#0B1631",
          boxShadow: "0 18px 40px rgba(0,0,0,.35)",
          margin: "0 10px 10px",
        }}
      >
        {/* Faixa de cores */}
        <div className="flex h-[6px]">
          <div className="flex-1" style={{ background: "#74ACDF" }} />
          <div className="flex-1" style={{ background: "#FFFFFF" }} />
          <div className="flex-1" style={{ background: "#009C3B" }} />
          <div className="flex-1" style={{ background: "#F2B632" }} />
        </div>

        <div className="px-4 pt-4 pb-5 relative">
          {/* Botão fechar */}
          <button
            onClick={dismiss}
            aria-label="Cerrar"
            className="absolute top-3 right-3 flex items-center justify-center rounded-full"
            style={{
              width: 30,
              height: 30,
              background: "rgba(255,255,255,0.12)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Label + título */}
          <p className="text-[9px] font-cuerpo font-bold uppercase tracking-widest mb-1"
            style={{ color: "#F2B632" }}>
            Comunidad Dupla
          </p>
          <h2 className="font-titular text-[20px] leading-tight text-white mb-1 pr-8">
            Seguí el fútbol sin límites
          </h2>
          <p className="font-cuerpo text-xs mb-4" style={{ color: "#B8C2D9" }}>
            Registrate gratis y recibí todas las noticias.
          </p>

          {/* Botones lado a lado */}
          <div className="flex gap-2 mb-3">
            <a
              href={`/api/subscriber/google?volver=${volverEncoded}&source=popup`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-cuerpo font-semibold text-xs transition-opacity hover:opacity-90"
              style={{ background: "#FFFFFF", color: "#111111" }}
            >
              <GoogleIcon size={14} />
              Google
            </a>
            <Link
              href={`/registro?volver=${volverEncoded}&source=popup`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-cuerpo font-semibold text-xs border transition-colors hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.25)", color: "#FFFFFF" }}
            >
              <MailIcon size={14} />
              Email
            </Link>
          </div>

          {/* Login */}
          <p className="text-center font-cuerpo text-[11px]" style={{ color: "#8B9ABB" }}>
            ¿Ya tenés cuenta?{" "}
            <Link
              href={`/ingresar?volver=${volverEncoded}`}
              className="underline"
              style={{ color: "#B8C2D9" }}
            >
              Ingresá
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}

function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
