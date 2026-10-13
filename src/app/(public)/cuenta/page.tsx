import Link from "next/link"
import CuentaPanel from "@/components/public/CuentaPanel"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mi cuenta",
}

export default function CuentaPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link href="/" className="inline-block mb-6 text-sm font-cuerpo text-gray-500 hover:text-gray-900 transition-colors">
        &larr; Volver al inicio
      </Link>
      <h1 className="font-titular text-2xl mb-6">Mi cuenta</h1>
      <CuentaPanel />
    </div>
  )
}
