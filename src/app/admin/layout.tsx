import { auth } from "@/lib/auth"
import { SessionProvider } from "next-auth/react"
import AdminShell from "@/components/admin/AdminShell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  )
}
