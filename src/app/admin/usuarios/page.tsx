import { requireAdmin } from "@/lib/auth-guard"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import UsersManager from "@/components/admin/UsersManager"
import SubscribersManager from "@/components/admin/SubscribersManager"
import SubscriberSignupStats from "@/components/admin/SubscriberSignupStats"

export default async function UsuariosPage() {
  const session = await requireAdmin()
  if (!session) redirect("/admin")

  const [users, subscribers] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        active: true,
        createdAt: true,
        _count: { select: { articles: true } },
      },
    }),
    prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        newsletterOptIn: true,
        signupSource: true,
        createdAt: true,
      },
    }),
  ])

  return (
    <div className="space-y-10">
      <UsersManager initialUsers={users} />
      <SubscribersManager initialSubscribers={subscribers} />

      <div>
        <h2 className="text-xl font-bold font-cuerpo mb-4">Suscripciones por fuente (últimas 8 semanas)</h2>
        <SubscriberSignupStats />
      </div>
    </div>
  )
}
