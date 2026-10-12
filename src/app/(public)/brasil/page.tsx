import { prisma } from "@/lib/prisma"
import ArticleCard from "@/components/public/ArticleCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fútbol Brasileño",
  description:
    "Todas las noticias del Brasileirão, la Copa do Brasil y los clubes brasileños en las copas internacionales.",
}

export default async function BrasilPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", section: "BRASIL" },
    orderBy: { publishedAt: "desc" },
    include: { tags: true },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-titular text-4xl md:text-5xl flex items-center gap-3">
          <span className="w-1.5 h-8 rounded-full inline-block bg-verde" />
          Fútbol Brasileño
        </h1>
        <p className="font-cuerpo text-gray-500 mt-2">
          Brasileirão, Copa do Brasil y clubes brasileños en las copas
        </p>
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-400 font-cuerpo text-center py-12">
          No hay artículos publicados en esta sección.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              title={article.title}
              subtitle={article.subtitle}
              slug={article.slug}
              section={article.section}
              heroImageUrl={article.heroImageUrl}
              publishedAt={article.publishedAt}
              showSection={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
