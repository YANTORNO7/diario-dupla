import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth-guard"
import ConfiguracionClient from "./ConfiguracionClient"

export const metadata = { title: "Configuración — Dupla Admin" }

export default async function ConfiguracionPage() {
  const session = await requireAdmin()
  if (!session) redirect("/admin")

  return <ConfiguracionClient />
}
