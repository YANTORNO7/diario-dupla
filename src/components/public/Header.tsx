"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Logo from "./Logo"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: "/argentina", label: "Argentina", color: "#75AADB" },
    { href: "/brasil", label: "Brasil", color: "#009C3B" },
  ]

  return (
    <header className="bg-[#111111] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo size="small" />
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-cuerpo font-semibold uppercase tracking-wide transition-colors ${
                  pathname.startsWith(link.href) ? "text-white" : "text-gray-400 hover:text-white"
                }`}
                style={pathname.startsWith(link.href) ? { borderBottom: `2px solid ${link.color}` } : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2" aria-label="Menú">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm font-cuerpo font-semibold text-gray-300 hover:text-white uppercase tracking-wide">
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
