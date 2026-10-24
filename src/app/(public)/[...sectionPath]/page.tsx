export const revalidate = 60

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import ArticleBody from "@/components/public/ArticleBody"
import ArticleCard from "@/components/public/ArticleCard"
import SubsectionBlock from "@/components/public/SubsectionBlock"
import TagBadge from "@/components/public/TagBadge"
import ShareButtons from "@/components/public/ShareButtons"
import { formatDate, formatDateShort } from "@/lib/utils"
import { getSectionPath, getArticlePath } from "@/lib/sections"
import { SITE_URL, SITE_NAME } from "@/lib/constants"
import { DIAS_ACTIVIDAD } from "@/lib/section-colors"
import type { Metadata } from "next"

const PAGE_SIZE = 18

type Props = {
  params: Promise<{ sectionPath: string[] }>
  searchParams: Promise<{ page?: string }>
}

/* ---------- helpers ---------- */

async function resolveSection(segments: string[]) {
  if (segments.length === 1) {
    return prisma.section.findFirst({
      where: { slug: segments[0], parentId: null },
      include: { children: { orderBy: { order: "asc" } }, parent: true },
    })
  }
  if (segments.length >= 2) {
    const parent = await prisma.section.findFirst({
      where: { slug: segments[0], parentId: null },
    })
    if (!parent) return null
    return prisma.section.findFirst({
      where: { slug: segments[1], parentId: parent.id },
      include: { children: { orderBy: { order: "asc" } }, parent: true },
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

async function relatedArticles(excludeId: string, sectionId: string) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", id: { not: excludeId }, sectionId },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      author: { select: { name: true } },
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
      description: section.description ?? `Todas las noticias de ${section.name} en Diario Dupla`,
    }
  }

  if (sectionPath.length === 2) {
    const childSection = await resolveSection(sectionPath)
    if (childSection) {
      return {
        title: childSection.name,
        description: childSection.description ?? `Todas las noticias de ${childSection.name} en Diario Dupla`,
      }
    }
    const parent = await prisma.section.findFirst({
      where: { slug: sectionPath[0], parentId: null },
      include: { children: true },
    })
    if (!parent) return {}
    const childIds = parent.children?.map((c: { id: string }) => c.id) ?? []
    const article = await findArticleInSection(parent.id, childIds, sectionPath[1])
    if (!article) return {}
    return articleMetadata(article, `${SITE_URL}${getArticlePath(article)}`)
  }

  if (sectionPath.length === 3) {
    const section = await resolveSection([sectionPath[0], sectionPath[1]])
    if (!section) return {}
    const article = await findArticleInSection(section.id, [], sectionPath[2])
    if (!article) return {}
    return articleMetadata(article, `${SITE_URL}${getArticlePath(article)}`)
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

export default async function SectionCatchAllPage({ params, searchParams }: Props) {
  const { sectionPath } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  /* --- 1 segment: top-level section listing --- */
  if (sectionPath.length === 1) {
    const section = await resolveSection(sectionPath)
    if (!section) notFound()
    const childIds = section.children?.map((c: { id: string }) => c.id) ?? []

    if (section.children && section.children.length > 0) {
      const allArticles = await sectionArticles(section.id, childIds)
      return renderSectionWithChildren(section, allArticles)
    }

    const articles = await sectionArticles(section.id, childIds)
    return renderSectionListing(section, articles, page)
  }

  /* --- 2 segments: child section listing OR article in parent section --- */
  if (sectionPath.length === 2) {
    const childSection = await resolveSection(sectionPath)
    if (childSection) {
      const childIds = childSection.children?.map((c: { id: string }) => c.id) ?? []
      const articles = await sectionArticles(childSection.id, childIds)
      return renderSectionListing(childSection, articles, page)
    }

    const parentSection = await prisma.section.findFirst({
      where: { slug: sectionPath[0], parentId: null },
      include: { children: true, parent: true },
    })
    if (!parentSection) notFound()
    const childIds = parentSection.children?.map((c: { id: string }) => c.id) ?? []
    const article = await findArticleInSection(parentSection.id, childIds, sectionPath[1])
    if (!article) notFound()
    const related = await relatedArticles(article.id, article.sectionId || parentSection.id)
    return renderArticle(article, parentSection, related)
  }

  /* --- 3 segments: article in child section --- */
  if (sectionPath.length === 3) {
    const section = await resolveSection([sectionPath[0], sectionPath[1]])
    if (!section) notFound()
    const article = await findArticleInSection(section.id, [], sectionPath[2])
    if (!article) notFound()
    const related = await relatedArticles(article.id, article.sectionId || section.id)
    return renderArticle(article, section, related)
  }

  notFound()
}

/* ---------- types ---------- */

type SectionWithParent = {
  id: string
  name: string
  slug: string
  color: string
  description?: string | null
  parent?: { slug: string; name: string } | null
  children?: { id: string; name: string; slug: string; color: string; parent?: { slug: string } | null }[]
}

type ArticleWithRelations = {
  id: string
  title: string
  subtitle: string | null
  slug: string
  body: string
  sectionId?: string | null
  heroImageUrl: string | null
  heroImageAlt: string | null
  heroCredit: string | null
  publishedAt: Date | null
  createdAt: Date
  author: { id?: string; name: string }
  primarySection: { id: string; name: string; slug: string; color: string; parent?: { slug: string } | null } | null
  tags: { id: string; name: string; slug: string }[]
}

/* ---------- breadcrumb helper ---------- */

function Breadcrumb({ section }: { section: SectionWithParent }) {
  return (
    <nav className="text-xs font-cuerpo text-gray-400 mb-3 flex items-center gap-1 flex-wrap">
      <a href="/" className="hover:text-gray-600">Inicio</a>
      {section.parent && (
        <>
          <span>›</span>
          <a href={`/${section.parent.slug}`} className="hover:text-gray-600">{section.parent.name}</a>
        </>
      )}
      <span>›</span>
      <span style={{ color: section.color }}>{section.name}</span>
    </nav>
  )
}

function SectionTitle({ section }: { section: SectionWithParent }) {
  if (section.slug === "la-dupla" || section.parent?.slug === "la-dupla") {
    return (
      <>
        <h1 className="font-titular text-4xl md:text-5xl">{section.name}</h1>
        <div className="flex gap-[3px] mt-2 w-32">
          <div className="flex flex-1 gap-[1px]" style={{ height: 6 }}>
            <div className="flex-1 bg-celeste rounded-l-full" />
            <div className="flex-[0.5] bg-white" />
            <div className="flex-1 bg-celeste rounded-r-full" />
          </div>
          <div className="flex flex-1 gap-[1px]" style={{ height: 6 }}>
            <div className="flex-1 bg-verde rounded-l-full" />
            <div className="flex-[0.5] bg-amarelo" />
            <div className="flex-1 bg-verde rounded-r-full" />
          </div>
        </div>
      </>
    )
  }
  return (
    <h1 className="font-titular text-4xl md:text-5xl flex items-center gap-3">
      <span className="w-1.5 h-8 rounded-full inline-block" style={{ backgroundColor: section.color }} />
      {section.name}
    </h1>
  )
}

/* ---------- renderer: sección con subsecciones (título + descripción + bloques) ---------- */

function renderSectionWithChildren(
  section: SectionWithParent,
  allArticles: ArticleWithRelations[]
) {
  const sectionUrl = `${SITE_URL}${getSectionPath(section)}`

  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: section.name, item: sectionUrl },
    ],
  })

  const children = section.children ?? []

  // Para cada subsección: artículos + fecha más reciente
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - DIAS_ACTIVIDAD)

  const subsectionData = children.map((child) => {
    const childArticles = allArticles.filter(
      (a) => a.primarySection?.slug === child.slug || a.sectionId === child.id
    )
    const latest = childArticles[0]?.publishedAt ?? null
    const active = latest ? new Date(latest) >= cutoff : false
    return { child, articles: childArticles, latest, active }
  })

  // Ordenar por nota más reciente
  const activeBlocks = subsectionData
    .filter((d) => d.active)
    .sort((a, b) => {
      if (!a.latest) return 1
      if (!b.latest) return -1
      return new Date(b.latest).getTime() - new Date(a.latest).getTime()
    })

  const inactiveBlocks = subsectionData.filter((d) => !d.active && d.articles.length > 0)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbLd }} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Breadcrumb section={section} />
          <SectionTitle section={section} />
          {section.description && (
            <p className="font-cuerpo text-gray-500 text-base md:text-lg mt-3 max-w-[700px]">{section.description}</p>
          )}
        </div>

        {/* Bloques por subsección */}
        <div className="space-y-14">
          {activeBlocks.map(({ child, articles }) => (
            <SubsectionBlock
              key={child.id}
              subsection={{ ...child, parent: { slug: section.slug } }}
              articles={articles}
            />
          ))}
          {inactiveBlocks.map(({ child, articles }) => (
            <SubsectionBlock
              key={child.id}
              subsection={{ ...child, parent: { slug: section.slug } }}
              articles={articles}
            />
          ))}
        </div>

        {activeBlocks.length === 0 && inactiveBlocks.length === 0 && (
          <p className="text-gray-400 font-cuerpo text-center py-12">
            No hay artículos publicados en esta sección.
          </p>
        )}
      </div>
    </>
  )
}

/* ---------- renderer: listado plano con paginación ---------- */

function renderSectionListing(
  section: SectionWithParent,
  articles: ArticleWithRelations[],
  page: number
) {
  const sectionUrl = `${SITE_URL}${getSectionPath(section)}`
  const breadcrumbItems: { name: string; url: string }[] = [
    { name: "Inicio", url: SITE_URL },
  ]
  if (section.parent) {
    breadcrumbItems.push({ name: section.parent.name, url: `${SITE_URL}/${section.parent.slug}` })
  }
  breadcrumbItems.push({ name: section.name, url: sectionUrl })

  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  })

  const total = articles.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = articles.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const sectionPath = getSectionPath(section)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbLd }} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Breadcrumb section={section} />
          <SectionTitle section={section} />
          {section.description && (
            <p className="font-cuerpo text-gray-500 text-base md:text-lg mt-3 max-w-[700px]">{section.description}</p>
          )}
        </div>

        {paginated.length === 0 ? (
          <p className="text-gray-400 font-cuerpo text-center py-12">
            No hay artículos publicados en esta sección.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((article) => {
              const ps = article.primarySection
              const artSectionPath = ps ? getSectionPath(ps) : sectionPath
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
                  showSection={true}
                />
              )
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 font-cuerpo text-sm">
            {safePage > 1 && (
              <Link
                href={`${sectionPath}?page=${safePage - 1}`}
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                ← Anterior
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`${sectionPath}?page=${p}`}
                className={`px-3 py-1.5 rounded border transition-colors ${
                  p === safePage
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {p}
              </Link>
            ))}
            {safePage < totalPages && (
              <Link
                href={`${sectionPath}?page=${safePage + 1}`}
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Siguiente →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ---------- renderer: artículo ---------- */

function renderArticle(article: ArticleWithRelations, section: SectionWithParent, related: ArticleWithRelations[] = []) {
  const sectionColor = article.primarySection?.color ?? section.color
  const sectionName = article.primarySection?.name ?? section.name
  const sectionPath = article.primarySection ? getSectionPath(article.primarySection) : `/${section.slug}`
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
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    ...(article.heroImageUrl ? { image: { "@type": "ImageObject", url: article.heroImageUrl } } : {}),
    articleSection: sectionName,
  })

  const breadcrumbItems: { name: string; url: string }[] = [
    { name: "Inicio", url: SITE_URL },
  ]
  if (section.parent) {
    breadcrumbItems.push({ name: section.parent.name, url: `${SITE_URL}/${section.parent.slug}` })
  }
  breadcrumbItems.push({ name: sectionName, url: `${SITE_URL}${sectionPath}` })
  breadcrumbItems.push({ name: article.title, url: articleUrl })

  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbLd }} />
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <nav className="text-xs font-cuerpo text-gray-400 mb-3 flex items-center gap-1 flex-wrap">
            <a href="/" className="hover:text-gray-600">Inicio</a>
            {section.parent && (
              <>
                <span>›</span>
                <a href={`/${section.parent.slug}`} className="hover:text-gray-600">{section.parent.name}</a>
              </>
            )}
            <span>›</span>
            <a href={sectionPath} className="hover:text-gray-600" style={{ color: sectionColor }}>{sectionName}</a>
          </nav>
          <span
            className="inline-block text-xs font-cuerpo font-bold uppercase tracking-wider px-2 py-1 rounded text-white mb-3"
            style={{ backgroundColor: sectionColor }}
          >
            {sectionName}
          </span>
          <h1 className="font-titular text-3xl md:text-5xl leading-tight">{article.title}</h1>
          {article.subtitle && (
            <p className="font-cuerpo text-gray-600 text-lg mt-3">{article.subtitle}</p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            <div className="flex items-center gap-3 text-sm text-gray-500 font-cuerpo">
              <span>Por {article.author.name}</span>
              <span>&middot;</span>
              <time>{formatDate(article.publishedAt || article.createdAt)}</time>
            </div>
            <ShareButtons url={articleUrl} title={article.title} />
          </div>
        </div>

        {article.heroImageUrl && (
          <figure className="mb-8">
            <Image
              src={article.heroImageUrl}
              alt={article.heroImageAlt || article.title}
              width={896}
              height={504}
              sizes="(max-width: 896px) 100vw, 896px"
              className="w-full rounded-lg"
              quality={90}
              priority
            />
            {article.heroCredit && (
              <figcaption className="text-xs text-gray-400 mt-2 font-cuerpo">{article.heroCredit}</figcaption>
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

        <div className="mt-8 pt-6 border-t">
          <ShareButtons url={articleUrl} title={article.title} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <h2 className="font-titular text-2xl md:text-3xl mb-6 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full inline-block" style={{ backgroundColor: sectionColor }} />
            Más de {sectionName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((rel) => {
              const ps = rel.primarySection
              const relPath = ps ? getSectionPath(ps) : `/${section.slug}`
              return (
                <ArticleCard
                  key={rel.id}
                  title={rel.title}
                  subtitle={rel.subtitle}
                  slug={rel.slug}
                  sectionPath={relPath}
                  sectionLabel={ps?.name ?? sectionName}
                  sectionColor={ps?.color ?? sectionColor}
                  heroImageUrl={rel.heroImageUrl}
                  publishedAt={rel.publishedAt}
                  authorName={rel.author.name}
                  showSection={true}
                />
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}
