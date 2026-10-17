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

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

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
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    site: "@diariodupla",
  },
  alternates: {
    types: {
      "application/rss+xml": `${BASE_URL}/feed.xml`,
    },
  },
  verification: {
    google: "google16ac96cb8fe68292",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon.png",
    shortcut: "/favicon-48.png",
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
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-CB0Q0FG74L" strategy="beforeInteractive" />
        <Script id="google-analytics" strategy="beforeInteractive">
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
