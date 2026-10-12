export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ArticleBody from "@/components/public/ArticleBody"
import TagBadge from "@/components/public/TagBadge"
import { formatDate } from "@/lib/utils"
import type { Metadata } from "next"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await prisma.article.findFirst({
    where: { slug, section: "ARGENTINA", status: "PUBLISHED" },
  })
  if (!article) return {}
  return {
    title: article.title,
    description: article.subtitle || article.title,
    openGraph: {
      title: article.title,
      description: article.subtitle || article.title,
      type: "article",
      ...(article.heroImageUrl ? { images: [article.heroImageUrl] } : {}),
    },
  }
}

export default async function ArgentinaArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await prisma.article.findFirst({
    where: { slug, section: "ARGENTINA", status: "PUBLISHED" },
    include: {
      author: { select: { id: true, name: true } },
      tags: true,
    },
  })

  if (!article) notFound()

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <span className="inline-block text-xs font-cuerpo font-bold uppercase tracking-wider px-2 py-1 rounded bg-celeste text-white mb-3">
          Argentina
        </span>
        <h1 className="font-titular text-3xl md:text-5xl leading-tight">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="font-cuerpo text-gray-600 text-lg mt-3">
            {article.subtitle}
          </p>
        )}
        <div className="flex items-center gap-3 mt-4 text-sm text-gray-500 font-cuerpo">
          <span>Por {article.author.name}</span>
          <span>·</span>
          <time>{formatDate(article.publishedAt || article.createdAt)}</time>
        </div>
      </div>

      {article.heroImageUrl && (
        <figure className="mb-8">
          <img
            src={article.heroImageUrl}
            alt={article.heroImageAlt || article.title}
            className="w-full rounded-lg"
          />
          {article.heroCredit && (
            <figcaption className="text-xs text-gray-400 mt-2 font-cuerpo">
              {article.heroCredit}
            </figcaption>
          )}
        </figure>
      )}

      <ArticleBody html={article.body} />

      {article.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <TagBadge key={tag.id} name={tag.name} slug={tag.slug} />
          ))}
        </div>
      )}
    </article>
  )
}
