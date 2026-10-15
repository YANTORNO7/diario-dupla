"use client"

import { usePathname } from "next/navigation"
import AdminSidebar from "./Sidebar"

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64">{children}</main>
    </div>
  )
}
