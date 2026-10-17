import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth-guard"
import PlacaGenerator from "@/components/admin/placas-v2/PlacaGenerator"

export default async function PlacasPage() {
  const session = await requireAuth()
  if (!session) redirect("/admin/login")
  return <PlacaGenerator />
}
