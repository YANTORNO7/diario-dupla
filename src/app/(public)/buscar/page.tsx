export const revalidate = 0

import { prisma } from "@/lib/prisma"
import ArticleCard from "@/components/public/ArticleCard"
import { getSectionPath } from "@/lib/sections"
import SearchForm from "@/components/public/SearchForm"
import type { Metadata } from "next"

type Props = { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Buscar: ${q}` : "Buscar",
    description: "Buscá noticias en Diario Dupla.",
    robots: { index: false },
  }
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ""

  let articles: any[] = []
  if (query.length >= 2) {
    articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { subtitle: { contains: query, mode: "insensitive" } },
          { body: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 30,
      include: {
        author: { select: { name: true } },
        primarySection: { include: { parent: true } },
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-titular text-4xl md:text-5xl mb-6">Buscar</h1>

      <SearchForm initialQuery={query} />

      {query.length >= 2 && (
        <p className="font-cuerpo text-gray-500 mb-6">
          {articles.length === 0
            ? `No se encontraron resultados para "${query}"`
            : `${articles.length} ${articles.length === 1 ? "resultado" : "resultados"} para "${query}"`}
        </p>
      )}

      {query.length === 1 && (
        <p className="font-cuerpo text-gray-400 text-center py-12">
          Escribí al menos 2 caracteres para buscar.
        </p>
      )}

      {!query && (
        <p className="font-cuerpo text-gray-400 text-center py-12">
          Buscá noticias por título, contenido o tema.
        </p>
      )}

      {articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const sectionPath = article.primarySection
              ? getSectionPath(article.primarySection)
              : `/${article.section.toLowerCase()}`
            const sectionLabel = article.primarySection?.name || article.section
            const sectionColor = article.primarySection?.color || "#888888"
            return (
              <ArticleCard
                key={article.id}
                title={article.title}
                subtitle={article.subtitle}
                slug={article.slug}
                sectionPath={sectionPath}
                sectionLabel={sectionLabel}
                sectionColor={sectionColor}
                heroImageUrl={article.heroImageUrl}
                publishedAt={article.publishedAt}
                authorName={article.author.name}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
