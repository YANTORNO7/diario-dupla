import Link from "next/link"
import ArticleCard from "./ArticleCard"
import { SECTIONS } from "@/lib/constants"

type Article = {
  title: string
  subtitle?: string | null
  slug: string
  section: "ARGENTINA" | "BRASIL"
  heroImageUrl?: string | null
  publishedAt?: string | Date | null
}

export default function SectionBlock({ section, articles }: { section: "ARGENTINA" | "BRASIL"; articles: Article[] }) {
  const sectionInfo = SECTIONS[section]
  if (articles.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-titular text-2xl md:text-3xl flex items-center gap-2">
          <span className="w-1 h-6 rounded-full inline-block" style={{ backgroundColor: sectionInfo.color }} />
          {sectionInfo.label}
        </h2>
        <Link href={`/${sectionInfo.slug}`} className="text-sm font-cuerpo font-medium hover:underline" style={{ color: sectionInfo.color }}>
          Ver todo
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.slug} {...article} showSection={false} />
        ))}
      </div>
    </section>
  )
}
