import Link from "next/link"
import Logo from "./Logo"
import type { SectionNav } from "@/lib/sections"

type Props = {
  sections?: SectionNav[]
}

export default function Footer({ sections }: Props) {
  return (
    <footer className="bg-[#111111] text-white mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <Logo size="small" />
            <p className="text-gray-400 text-sm font-cuerpo mt-2 hidden md:block">El diario del fútbol argentino y brasileño, y de los deportes que nos unen</p>
            <p className="text-gray-400 text-sm font-cuerpo mt-2 md:hidden">Fútbol y deportes que nos unen</p>
          </div>

          {sections && sections.length > 0 && (
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={section.path}
                  className="text-sm text-gray-400 font-cuerpo transition-colors hover:text-white"
                >
                  {section.name}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/diariodupla" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="/feed.xml" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="RSS Feed">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M6.18 15.64a2.18 2.18 0 010 4.36 2.18 2.18 0 010-4.36zM4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44zm0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-xs font-cuerpo">
            &copy; {new Date().getFullYear()} Diario Dupla. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
