/**
 * PT Layout
 *
 * Note: <html lang="es"> is set in the root layout (src/app/layout.tsx) and
 * cannot be overridden from a nested layout in Next.js App Router.
 * We set lang="pt-BR" on the top-level content wrapper instead.
 */

import type { Metadata } from "next"
import Script from "next/script"
import { getPtMode } from "@/lib/translation-config"

export const metadata: Metadata = {
  title: {
    default: "Diario Dupla — O jornal do futebol argentino e brasileiro",
    template: "%s | Diario Dupla",
  },
  description:
    "Diario Dupla: todas as notícias da Liga Profissional argentina e do Brasileirão. Cobertura completa do futebol da Argentina e do Brasil.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Diario Dupla",
  },
}

export default async function PtLayout({ children }: { children: React.ReactNode }) {
  const ptMode = await getPtMode()

  const extraHeaders: Record<string, string> = {}
  if (ptMode === "admin") {
    extraHeaders["X-Robots-Tag"] = "noindex, nofollow"
  }

  return (
    <div lang="pt-BR" className="min-h-screen flex flex-col">
      {/* Analytics: override page_language for PT pages */}
      <Script id="ga-pt-lang" strategy="afterInteractive">
        {`if(typeof gtag === 'function') { gtag('set', {'page_language': 'pt-BR'}); }`}
      </Script>
      {children}
    </div>
  )
}
