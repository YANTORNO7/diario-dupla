import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ArticleCard from "@/components/public/ArticleCard"
import type { Metadata } from "next"

type Props = { params: Promise<{ tag: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: tagSlug } = await params
  const tag = await prisma.tag.findUnique({ where: { slug: tagSlug } })
  if (!tag) return {}
  return {
    title: `Noticias de ${tag.name}`,
    description: `Todas las noticias sobre ${tag.name} en Diario Dupla.`,
  }
}

export default async function TagPage({ params }: Props) {
  const { tag: tagSlug } = await params
  const tag = await prisma.tag.findUnique({
    where: { slug: tagSlug },
    include: {
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: { tags: true },
      },
    },
  })

  if (!tag) notFound()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-titular text-4xl md:text-5xl">{tag.name}</h1>
        <p className="font-cuerpo text-gray-500 mt-2">
          {tag.articles.length} {tag.articles.length === 1 ? "artículo" : "artículos"}
        </p>
      </div>

      {tag.articles.length === 0 ? (
        <p className="text-gray-400 font-cuerpo text-center py-12">
          No hay artículos publicados con esta etiqueta.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tag.articles.map((article) => (
            <ArticleCard
              key={article.id}
              title={article.title}
              subtitle={article.subtitle}
              slug={article.slug}
              section={article.section}
              heroImageUrl={article.heroImageUrl}
              publishedAt={article.publishedAt}
            />
          ))}
        </div>
      )}
    </div>
  )
}
