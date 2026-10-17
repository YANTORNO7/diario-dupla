"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Logo from "./Logo"
import SubscriberHeaderMenu from "./SubscriberHeaderMenu"
import type { SectionNav } from "@/lib/sections"

type Props = {
  sections: SectionNav[]
}

export default function Header({ sections }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-[#111111] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:max-w-full md:px-10">
        <div className="flex items-center justify-between h-16">
          <Logo size="small" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {sections.map((section) => {
              const isActive = pathname === section.path || pathname.startsWith(section.path + "/")
              const hasChildren = section.children.length > 0

              return (
                <div key={section.id} className="relative group">
                  <Link
                    href={section.path}
                    className={`px-2 py-2 text-xs font-cuerpo font-semibold uppercase tracking-wide transition-colors whitespace-nowrap ${
                      isActive ? "text-white" : "text-gray-400 hover:text-white"
                    }`}
                    style={isActive ? { borderBottom: `2px solid ${section.color}` } : undefined}
                  >
                    {section.name}
                    {hasChildren && <span className="ml-1 text-[10px] text-gray-500 group-hover:text-gray-300">&#9662;</span>}
                  </Link>

                  {hasChildren && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 hidden group-hover:block z-50">
                      <div className="bg-[#1a1a1a] border border-gray-700/50 rounded shadow-xl py-1 min-w-[160px]">
                        {section.children.map((child) => {
                          const childActive = pathname === child.path || pathname.startsWith(child.path + "/")
                          return (
                            <Link
                              key={child.id}
                              href={child.path}
                              className={`flex items-center gap-2 px-4 py-2 text-xs font-cuerpo transition-colors ${
                                childActive ? "text-white bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: child.color }} />
                              {child.name}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <Link href="/buscar" className="px-2 py-2 text-gray-400 hover:text-white transition-colors" aria-label="Buscar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </Link>
            <SubscriberHeaderMenu />
          </nav>

          <div className="flex items-center md:hidden">
            <Link href="/buscar" className="text-gray-400 hover:text-white transition-colors p-2" aria-label="Buscar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </Link>
            <SubscriberHeaderMenu />
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white p-2" aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {sections.map((section) => (
              <div key={section.id}>
                <Link
                  href={section.path}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-cuerpo font-semibold text-gray-300 hover:text-white uppercase tracking-wide"
                >
                  {section.name}
                </Link>
                {section.children.length > 0 && (
                  <div className="pl-6">
                    {section.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.path}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-1.5 text-sm font-cuerpo text-gray-400 hover:text-white"
                      >
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: child.color }}
                        />
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
