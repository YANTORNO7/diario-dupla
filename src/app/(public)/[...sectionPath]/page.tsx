export const revalidate = 60

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ArticleBody from "@/components/public/ArticleBody"
import ArticleCard from "@/components/public/ArticleCard"
import TagBadge from "@/components/public/TagBadge"
import { formatDate, formatDateShort } from "@/lib/utils"
import { getSectionPath, getArticlePath } from "@/lib/sections"
import { SITE_URL, SITE_NAME } from "@/lib/constants"
import type { Metadata } from "next"

type Props = { params: Promise<{ sectionPath: string[] }> }

/* ---------- helpers ---------- */

async function resolveSection(segments: string[]) {
  if (segments.length === 1) {
    return prisma.section.findFirst({
      where: { slug: segments[0], parentId: null },
      include: { children: true, parent: true },
    })
  }
  if (segments.length >= 2) {
    const parent = await prisma.section.findFirst({
      where: { slug: segments[0], parentId: null },
    })
    if (!parent) return null
    return prisma.section.findFirst({
      where: { slug: segments[1], parentId: parent.id },
      include: { children: true, parent: true },
    })
  }
  return null
}

async function findArticleInSection(sectionId: string, childIds: string[], articleSlug: string) {
  return prisma.article.findFirst({
    where: {
      slug: articleSlug,
      status: "PUBLISHED",
      OR: [
        { sectionId },
        ...(childIds.length > 0 ? [{ sectionId: { in: childIds } }] : []),
        { secondarySections: { some: { id: sectionId } } },
      ],
    },
    include: {
      author: { select: { id: true, name: true } },
      primarySection: { include: { parent: true } },
      tags: true,
    },
  })
}

async function sectionArticles(sectionId: string, childIds: string[]) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { sectionId },
        ...(childIds.length > 0 ? [{ sectionId: { in: childIds } }] : []),
        { secondarySections: { some: { id: sectionId } } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { name: true } },
      primarySection: { include: { parent: true } },
      tags: true,
    },
  })
}

/* ---------- metadata ---------- */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sectionPath } = await params

  if (sectionPath.length === 1) {
    const section = await resolveSection(sectionPath)
    if (!section) return {}
    return {
      title: section.name,
      description: `Todas las noticias de ${section.name}`,
    }
  }

  if (sectionPath.length === 2) {
    const childSection = await resolveSection(sectionPath)
    if (childSection) {
      return { title: childSection.name, description: `Todas las noticias de ${childSection.name}` }
    }
    // try article
    const parent = await prisma.section.findFirst({
      where: { slug: sectionPath[0], parentId: null },
      include: { children: true },
    })
    if (!parent) return {}
    const childIds = parent.children?.map((c: { id: string }) => c.id) ?? []
    const article = await findArticleInSection(parent.id, childIds, sectionPath[1])
    if (!article) return {}
    const articleUrl = `${SITE_URL}${getArticlePath(article)}`
    return articleMetadata(article, articleUrl)
  }

  if (sectionPath.length === 3) {
    const section = await resolveSection([sectionPath[0], sectionPath[1]])
    if (!section) return {}
    const article = await findArticleInSection(section.id, [], sectionPath[2])
    if (!article) return {}
    const articleUrl = `${SITE_URL}${getArticlePath(article)}`
    return articleMetadata(article, articleUrl)
  }

  return {}
}

function articleMetadata(
  article: { title: string; subtitle: string | null; heroImageUrl: string | null; publishedAt: Date | null; createdAt: Date; author: { name: string }; primarySection: { name: string } | null; tags: { name: string }[] },
  articleUrl: string
): Metadata {
  const pubDate = new Date(article.publishedAt || article.createdAt).toISOString()
  const description = article.subtitle || article.title
  return {
    title: article.title,
    description,
    alternates: { canonical: articleUrl },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      url: articleUrl,
      publishedTime: pubDate,
      authors: [article.author.name],
      section: article.primarySection?.name,
      tags: article.tags.map((t) => t.name),
      ...(article.heroImageUrl ? { images: [{ url: article.heroImageUrl, width: 1200, height: 630, alt: article.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      ...(article.heroImageUrl ? { images: [article.heroImageUrl] } : {}),
    },
  }
}

/* ---------- page ---------- */

export default async function SectionCatchAllPage({ params }: Props) {
  const { sectionPath } = await params

  /* --- 1 segment: top-level section listing --- */
  if (sectionPath.length === 1) {
    const section = await resolveSection(sectionPath)
    if (!section) notFound()
    const childIds = section.children?.map((c: { id: string }) => c.id) ?? []
    const articles = await sectionArticles(section.id, childIds)
    return renderSectionListing(section, articles)
  }

  /* --- 2 segments: child section listing OR article in parent section --- */
  if (sectionPath.length === 2) {
    const childSection = await resolveSection(sectionPath)
    if (childSection) {
      const childIds = childSection.children?.map((c: { id: string }) => c.id) ?? []
      const articles = await sectionArticles(childSection.id, childIds)
      return renderSectionListing(childSection, articles)
    }

    // try article in parent section
    const parentSection = await prisma.section.findFirst({
      where: { slug: sectionPath[0], parentId: null },
      include: { children: true, parent: true },
    })
    if (!parentSection) notFound()
    const childIds = parentSection.children?.map((c: { id: string }) => c.id) ?? []
    const article = await findArticleInSection(parentSection.id, childIds, sectionPath[1])
    if (!article) notFound()
    return renderArticle(article, parentSection)
  }

  /* --- 3 segments: article in child section --- */
  if (sectionPath.length === 3) {
    const section = await resolveSection([sectionPath[0], sectionPath[1]])
    if (!section) notFound()
    const article = await findArticleInSection(section.id, [], sectionPath[2])
    if (!article) notFound()
    return renderArticle(article, section)
  }

  notFound()
}

/* ---------- renderers ---------- */

type SectionWithParent = {
  id: string
  name: string
  slug: string
  color: string
  parent?: { slug: string } | null
  children?: { id: string }[]
}

type ArticleWithRelations = {
  id: string
  title: string
  subtitle: string | null
  slug: string
  body: string
  heroImageUrl: string | null
  heroImageAlt: string | null
  heroCredit: string | null
  publishedAt: Date | null
  createdAt: Date
  author: { id?: string; name: string }
  primarySection: { id: string; name: string; slug: string; color: string; parent?: { slug: string } | null } | null
  tags: { id: string; name: string; slug: string }[]
}

function renderSectionListing(
  section: SectionWithParent,
  articles: ArticleWithRelations[]
) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-titular text-4xl md:text-5xl flex items-center gap-3">
          <span
            className="w-1.5 h-8 rounded-full inline-block"
            style={{ backgroundColor: section.color }}
          />
          {section.name}
        </h1>
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-400 font-cuerpo text-center py-12">
          No hay articulos publicados en esta seccion.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const ps = article.primarySection
            const artSectionPath = ps ? getSectionPath(ps) : `/${section.slug}`
            const artSectionLabel = ps ? ps.name : section.name
            const artSectionColor = ps ? ps.color : section.color

            return (
              <ArticleCard
                key={article.id}
                title={article.title}
                subtitle={article.subtitle}
                slug={article.slug}
                sectionPath={artSectionPath}
                sectionLabel={artSectionLabel}
                sectionColor={artSectionColor}
                heroImageUrl={article.heroImageUrl}
                publishedAt={article.publishedAt}
                authorName={article.author.name}
                showSection={false}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function renderArticle(article: ArticleWithRelations, section: SectionWithParent) {
  const sectionColor = article.primarySection?.color ?? section.color
  const sectionName = article.primarySection?.name ?? section.name
  const articleUrl = `${SITE_URL}${getArticlePath(article)}`
  const pubDate = new Date(article.publishedAt || article.createdAt).toISOString()

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.subtitle || article.title,
    url: articleUrl,
    datePublished: pubDate,
    dateModified: pubDate,
    author: { "@type": "Person", name: article.author?.name || "Diario Dupla" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    ...(article.heroImageUrl ? { image: { "@type": "ImageObject", url: article.heroImageUrl } } : {}),
    articleSection: sectionName,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <article className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <span
          className="inline-block text-xs font-cuerpo font-bold uppercase tracking-wider px-2 py-1 rounded text-white mb-3"
          style={{ backgroundColor: sectionColor }}
        >
          {sectionName}
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
          <span>&middot;</span>
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
    </>
  )
}
