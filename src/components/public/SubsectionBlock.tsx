import Link from "next/link"
import ArticleCard from "./ArticleCard"
import { getSectionPath } from "@/lib/sections"

type Article = {
  id: string
  title: string
  subtitle: string | null
  slug: string
  heroImageUrl: string | null
  publishedAt: Date | null
  author: { name: string }
  primarySection: { id: string; name: string; slug: string; color: string; parent?: { slug: string } | null } | null
}

type Subsection = {
  id: string
  name: string
  slug: string
  color: string
  parent: { slug: string } | null
}

type Props = {
  subsection: Subsection
  articles: Article[]
  heroId?: string // ID del artículo destacado a excluir
}

export default function SubsectionBlock({ subsection, articles, heroId }: Props) {
  const filtered = heroId ? articles.filter((a) => a.id !== heroId) : articles
  if (filtered.length === 0) return null

  const subsectionPath = getSectionPath(subsection)

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-5">
        <span className="w-1 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: subsection.color }} />
        <h2 className="font-titular text-2xl md:text-3xl leading-none">{subsection.name.toUpperCase()}</h2>
        <div className="flex-1 h-px bg-gray-200 hidden sm:block" />
        <Link
          href={subsectionPath}
          className="font-cuerpo text-sm font-medium whitespace-nowrap hover:underline flex-shrink-0"
          style={{ color: subsection.color }}
        >
          Ver todas →
        </Link>
      </div>

      {/* Cards — grilla en desktop, carrusel en mobile */}
      <div className="
        flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2
        sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:pb-0
        lg:grid-cols-3
        [&::-webkit-scrollbar]:hidden
      ">
        {filtered.slice(0, 3).map((article) => {
          const ps = article.primarySection
          const artPath = ps ? getSectionPath(ps) : subsectionPath
          const artLabel = ps?.name ?? subsection.name
          const artColor = ps?.color ?? subsection.color

          return (
            <div key={article.id} className="w-[82vw] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink">
              <ArticleCard
                title={article.title}
                subtitle={article.subtitle}
                slug={article.slug}
                sectionPath={artPath}
                sectionLabel={artLabel}
                sectionColor={artColor}
                heroImageUrl={article.heroImageUrl}
                publishedAt={article.publishedAt}
                authorName={article.author.name}
                showSection={true}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
