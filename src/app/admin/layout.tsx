import { auth } from "@/lib/auth"
import { SessionProvider } from "next-auth/react"
import AdminSidebar from "@/components/admin/Sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      {session?.user ? (
        <div className="min-h-screen bg-gray-50 flex">
          <AdminSidebar />
          <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64">{children}</main>
        </div>
      ) : (
        children
      )}
    </SessionProvider>
  )
}
