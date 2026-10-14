import type { Metadata } from "next"
import Script from "next/script"
import { Anton, Archivo } from "next/font/google"
import "./globals.css"

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
})

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Diario Dupla — El diario del fútbol argentino y brasileño",
    template: "%s | Diario Dupla",
  },
  description:
    "Diario Dupla: todas las noticias de la Liga Profesional argentina y el Brasileirão. Cobertura completa del fútbol de Argentina y Brasil.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Diario Dupla",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${anton.variable} ${archivo.variable}`}>
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-CB0Q0FG74L" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-CB0Q0FG74L');`}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  )
}
