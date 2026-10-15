import Header from "@/components/public/Header"
import Footer from "@/components/public/Footer"
import { getNavSections } from "@/lib/sections"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sections = await getNavSections()

  return (
    <>
      <Header sections={sections} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
