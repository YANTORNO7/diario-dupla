"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useState } from "react"

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role as string | undefined

  const links = [
    { href: "/admin", label: "Artículos", adminOnly: false },
    { href: "/admin/articulos/nuevo", label: "Nuevo artículo", adminOnly: false },
    { href: "/admin/clubes", label: "Clubes", adminOnly: false },
    { href: "/admin/placas", label: "Placas IG", adminOnly: false },
    { href: "/admin/goles", label: "Goles", adminOnly: false },
    { href: "/admin/pendientes", label: "Pendientes", adminOnly: true },
    { href: "/admin/estadisticas", label: "Estadísticas", adminOnly: true },
    { href: "/admin/usuarios", label: "Usuarios", adminOnly: true },
  ]

  const visibleLinks = links.filter(
    (link) => !link.adminOnly || userRole === "ADMIN"
  )

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#111111] text-white p-2 rounded-md"
        aria-label="Menú"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
        </svg>
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#111111] text-white z-40 transform transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <Link href="/" className="block mb-8">
            <h2 className="font-titular text-2xl tracking-tight">DUPLA</h2>
            <p className="text-gray-400 text-xs font-cuerpo">{userRole === "ADMIN" ? "Admin" : "Colaborador"}</p>
          </Link>
          <nav className="space-y-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-cuerpo transition-colors ${
                  pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href + '/'))
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white font-cuerpo transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
