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
    <>
      {/* Hero oscuro */}
      <div className="bg-[#111111] py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-titular text-5xl md:text-6xl text-white mb-4">Buscar</h1>
          <div className="flex gap-[4px] mx-auto w-28 mb-8">
            <div className="flex flex-1 gap-[1px]" style={{ height: 6 }}>
              <div className="flex-1 bg-celeste rounded-l-full" />
              <div className="flex-[0.5] bg-white/30" />
              <div className="flex-1 bg-celeste rounded-r-full" />
            </div>
            <div className="flex flex-1 gap-[1px]" style={{ height: 6 }}>
              <div className="flex-1 bg-verde rounded-l-full" />
              <div className="flex-[0.5] bg-amarelo" />
              <div className="flex-1 bg-verde rounded-r-full" />
            </div>
          </div>
          <SearchForm initialQuery={query} />
        </div>
      </div>

      {/* Resultados */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {query.length >= 2 && (
          <p className="font-cuerpo text-gray-500 text-sm mb-6">
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
          <p className="font-cuerpo text-gray-400 text-center py-16">
            Ingresá un término para buscar noticias.
          </p>
        )}

        {query.length >= 2 && articles.length === 0 && (
          <p className="font-cuerpo text-gray-400 text-center py-16">
            No se encontraron resultados para &ldquo;{query}&rdquo;.
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
    </>
  )
}
