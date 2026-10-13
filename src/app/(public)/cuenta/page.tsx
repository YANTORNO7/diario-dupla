import CuentaPanel from "@/components/public/CuentaPanel"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mi cuenta",
}

export default function CuentaPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-titular text-2xl mb-6">Mi cuenta</h1>
      <CuentaPanel />
    </div>
  )
}
