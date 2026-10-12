export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import ArticleCard from "@/components/public/ArticleCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fútbol Argentino",
  description:
    "Todas las noticias de la Liga Profesional, el ascenso y los clubes argentinos. Cobertura completa del fútbol de Argentina.",
}

export default async function ArgentinaPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", section: "ARGENTINA" },
    orderBy: { publishedAt: "desc" },
    include: { tags: true },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-titular text-4xl md:text-5xl flex items-center gap-3">
          <span className="w-1.5 h-8 rounded-full inline-block bg-celeste" />
          Fútbol Argentino
        </h1>
        <p className="font-cuerpo text-gray-500 mt-2">
          Liga Profesional, ascenso y todo el fútbol de Argentina
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
