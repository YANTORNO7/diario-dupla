import Link from "next/link"
import ArticleCard from "./ArticleCard"

type Article = {
  title: string
  subtitle?: string | null
  slug: string
  heroImageUrl?: string | null
  publishedAt?: string | Date | null
  author?: { name: string } | null
  primarySection?: {
    name: string
    slug: string
    color: string
    parent?: { slug: string } | null
  } | null
}

type Props = {
  sectionLabel: string
  sectionPath: string
  sectionColor: string
  articles: Article[]
}

export default function SectionBlock({ sectionLabel, sectionPath, sectionColor, articles }: Props) {
  if (articles.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        {sectionPath === "/la-dupla" ? (
          <div>
            <h2 className="font-titular text-2xl md:text-3xl">{sectionLabel}</h2>
            <div className="flex gap-[2px] mt-1 w-20">
              <div className="flex flex-1 gap-[1px]" style={{ height: 4 }}>
                <div className="flex-1 bg-celeste rounded-l-full" />
                <div className="flex-[0.5] bg-white" />
                <div className="flex-1 bg-celeste rounded-r-full" />
              </div>
              <div className="flex flex-1 gap-[1px]" style={{ height: 4 }}>
                <div className="flex-1 bg-verde rounded-l-full" />
                <div className="flex-[0.5] bg-amarelo" />
                <div className="flex-1 bg-verde rounded-r-full" />
              </div>
            </div>
          </div>
        ) : (
          <h2 className="font-titular text-2xl md:text-3xl flex items-center gap-2">
            <span className="w-1 h-6 rounded-full inline-block" style={{ backgroundColor: sectionColor }} />
            {sectionLabel}
          </h2>
        )}
        <Link href={sectionPath} className="text-sm font-cuerpo font-medium hover:underline" style={{ color: sectionColor }}>
          Ver todo
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => {
          const ps = article.primarySection
          const artPath = ps
            ? ps.parent
              ? `/${ps.parent.slug}/${ps.slug}`
              : `/${ps.slug}`
            : sectionPath
          const artLabel = ps?.name ?? sectionLabel
          const artColor = ps?.color ?? sectionColor

          return (
            <ArticleCard
              key={article.slug}
              title={article.title}
              subtitle={article.subtitle}
              slug={article.slug}
              heroImageUrl={article.heroImageUrl}
              publishedAt={article.publishedAt}
              authorName={article.author?.name}
              sectionPath={artPath}
              sectionLabel={artLabel}
              sectionColor={artColor}
              showSection={false}
            />
          )
        })}
      </div>
    </section>
  )
}
