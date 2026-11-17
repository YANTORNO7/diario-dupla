export const revalidate = 30

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/public/Header"
import Footer from "@/components/public/Footer"
import ArticleBody from "@/components/public/ArticleBody"
import ArticleCard from "@/components/public/ArticleCard"
import ShareButtons from "@/components/public/ShareButtons"
import { getNavSectionsPt, getSectionPathPt, getArticlePathPt } from "@/lib/sections-pt"
import { SITE_URL, SITE_NAME } from "@/lib/constants"
import { PT } from "@/lib/pt-strings"
import type { Metadata } from "next"

const PAGE_SIZE = 18

type Props = {
  params: Promise<{ sectionPath: string[] }>
  searchParams: Promise<{ page?: string }>
}

// ─── Section resolvers (by slugPt) ───────────────────────────────────────────

async function resolveSectionPt(segments: string[]) {
  if (segments.length === 1) {
    return prisma.section.findFirst({
      where: { OR: [{ slugPt: segments[0] }, { slug: segments[0] }], parentId: null },
      include: { children: { orderBy: { order: "asc" } }, parent: true },
    })
  }
  if (segments.length >= 2) {
    const parent = await prisma.section.findFirst({
      where: { OR: [{ slugPt: segments[0] }, { slug: segments[0] }], parentId: null },
    })
    if (!parent) return null
    return prisma.section.findFirst({
      where: { OR: [{ slugPt: segments[1] }, { slug: segments[1] }], parentId: parent.id },
      include: { children: { orderBy: { order: "asc" } }, parent: true },
    })
  }
  return null
}

async function findTranslationInSection(sectionId: string, childIds: string[], slugPt: string) {
  return prisma.articleTranslation.findFirst({
    where: {
      slugPt,
      status: { in: ["AUTO", "REVIEWED"] },
      article: {
        status: "PUBLISHED",
        OR: [
          { sectionId },
          ...(childIds.length > 0 ? [{ sectionId: { in: childIds } }] : []),
          { secondarySections: { some: { id: sectionId } } },
        ],
      },
    },
    include: {
      article: {
        include: {
          author: { select: { id: true, name: true } },
          primarySection: { include: { parent: true } },
          tags: true,
        },
      },
    },
  })
}

async function sectionArticlesPt(sectionId: string, childIds: string[]) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      translation: { status: { in: ["AUTO", "REVIEWED"] } },
      OR: [
        { sectionId },
        ...(childIds.length > 0 ? [{ sectionId: { in: childIds } }] : []),
        { secondarySections: { some: { id: sectionId } } },
      ],
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: {
      translation: true,
      primarySection: { include: { parent: true } },
    },
  })
}

async function relatedPt(excludeId: string, sectionId: string) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: excludeId },
      sectionId,
      translation: { status: { in: ["AUTO", "REVIEWED"] } },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      translation: true,
      primarySection: { include: { parent: true } },
    },
  })
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sectionPath } = await params

  if (sectionPath.length === 1) {
    const section = await resolveSectionPt(sectionPath)
    if (!section) return {}
    const name = section.namePt || section.name
    return { title: name, description: section.descPt || section.description || `${name} — Diario Dupla` }
  }

  if (sectionPath.length === 2) {
    const childSection = await resolveSectionPt(sectionPath)
    if (childSection) {
      const name = childSection.namePt || childSection.name
      return { title: name, description: childSection.descPt || childSection.description || `${name} — Diario Dupla` }
    }
    const parent = await prisma.section.findFirst({
      where: { OR: [{ slugPt: sectionPath[0] }, { slug: sectionPath[0] }], parentId: null },
      include: { children: true },
    })
    if (!parent) return {}
    const childIds = parent.children.map((c) => c.id)
    const translation = await findTranslationInSection(parent.id, childIds, sectionPath[1])
    if (!translation) return {}
    return translationMetadata(translation, `${SITE_URL}/pt/${sectionPath.join("/")}`)
  }

  if (sectionPath.length === 3) {
    const section = await resolveSectionPt([sectionPath[0], sectionPath[1]])
    if (!section) return {}
    const translation = await findTranslationInSection(section.id, [], sectionPath[2])
    if (!translation) return {}
    return translationMetadata(translation, `${SITE_URL}/pt/${sectionPath.join("/")}`)
  }

  return {}
}

function translationMetadata(
  t: { titlePt: string; subtitlePt?: string | null; article: { heroImageUrl?: string | null } },
  url: string
): Metadata {
  const description = t.subtitlePt || t.titlePt
  return {
    title: t.titlePt,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: t.titlePt,
      description,
      type: "article",
      url,
      locale: "pt_BR",
      ...(t.article.heroImageUrl ? { images: [{ url: t.article.heroImageUrl, width: 1200, height: 630 }] } : {}),
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PtCatchAllPage({ params, searchParams }: Props) {
  const { sectionPath } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  const navSections = await getNavSectionsPt()

  /* 1 segment: top-level section */
  if (sectionPath.length === 1) {
    const section = await resolveSectionPt(sectionPath)
    if (!section) notFound()
    const childIds = section.children?.map((c) => c.id) ?? []
    const articles = await sectionArticlesPt(section.id, childIds)
    return renderSectionListing(section, articles, page, navSections)
  }

  /* 2 segments: child section OR article in parent section */
  if (sectionPath.length === 2) {
    const childSection = await resolveSectionPt(sectionPath)
    if (childSection) {
      const childIds = childSection.children?.map((c) => c.id) ?? []
      const articles = await sectionArticlesPt(childSection.id, childIds)
      return renderSectionListing(childSection, articles, page, navSections)
    }

    const parentSection = await prisma.section.findFirst({
      where: { OR: [{ slugPt: sectionPath[0] }, { slug: sectionPath[0] }], parentId: null },
      include: { children: true, parent: true },
    })
    if (!parentSection) notFound()
    const childIds = parentSection.children.map((c) => c.id)
    const translation = await findTranslationInSection(parentSection.id, childIds, sectionPath[1])
    if (!translation) notFound()
    const related = await relatedPt(translation.article.id, translation.article.sectionId || parentSection.id)
    return renderArticle(translation, parentSection, related, navSections)
  }

  /* 3 segments: article in child section */
  if (sectionPath.length === 3) {
    const section = await resolveSectionPt([sectionPath[0], sectionPath[1]])
    if (!section) notFound()
    const translation = await findTranslationInSection(section.id, [], sectionPath[2])
    if (!translation) notFound()
    const related = await relatedPt(translation.article.id, translation.article.sectionId || section.id)
    return renderArticle(translation, section, related, navSections)
  }

  notFound()
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionFull = {
  id: string; name: string; namePt?: string | null; slug: string; slugPt?: string | null
  color: string; description?: string | null; descPt?: string | null
  parent?: { slug: string; slugPt?: string | null; name: string; namePt?: string | null } | null
  children?: { id: string; name: string; namePt?: string | null; slug: string; slugPt?: string | null; color: string }[]
}

type TranslationFull = {
  id: string; titlePt: string; subtitlePt: string | null; bodyPt: string; slugPt: string
  heroAltPt?: string | null; metaTitlePt?: string | null; metaDescPt?: string | null
  translatedAt: Date; updatedAt: Date; status: string
  article: {
    id: string; slug: string; heroImageUrl: string | null; heroCredit: string | null
    publishedAt: Date | null; createdAt: Date; sectionId?: string | null
    author: { id?: string; name: string }
    primarySection: { id: string; name: string; namePt?: string | null; slug: string; slugPt?: string | null; color: string; parent?: { slug: string; slugPt?: string | null } | null } | null
    tags: { id: string; name: string; slug: string }[]
  }
}

type NavSections = Awaited<ReturnType<typeof getNavSectionsPt>>

// ─── Section listing renderer ─────────────────────────────────────────────────

function renderSectionListing(section: SectionFull, articles: ReturnType<typeof sectionArticlesPt> extends Promise<infer T> ? T : never, page: number, navSections: NavSections) {
  const name = section.namePt || section.name
  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = articles.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const ptPath     = getSectionPathPt(section)

  return (
    <>
      <Header sections={navSections} />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="font-titular text-4xl md:text-5xl flex items-center gap-3">
              <span className="w-1.5 h-8 rounded-full inline-block" style={{ backgroundColor: section.color }} />
              {name}
            </h1>
            {(section.descPt || section.description) && (
              <p className="font-cuerpo text-gray-500 text-base md:text-lg mt-3 max-w-[700px]">
                {section.descPt || section.description}
              </p>
            )}
          </div>

          {paginated.length === 0 ? (
            <p className="text-gray-400 font-cuerpo text-center py-12">{PT.noArticles}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((article) => {
                if (!article.translation) return null
                const ps = article.primarySection
                const sectionPath = ps ? getSectionPathPt(ps) : ptPath
                return (
                  <ArticleCard
                    key={article.id}
                    title={article.translation.titlePt}
                    subtitle={article.translation.subtitlePt}
                    slug={article.translation.slugPt}
                    sectionPath={sectionPath}
                    sectionLabel={ps?.namePt || ps?.name || name}
                    sectionColor={ps?.color || section.color}
                    heroImageUrl={article.heroImageUrl}
                    publishedAt={article.publishedAt}
                    showSection={true}
                  />
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10 font-cuerpo text-sm">
              {safePage > 1 && (
                <Link href={`${ptPath}?page=${safePage - 1}`} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100">
                  {PT.previous}
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`${ptPath}?page=${p}`}
                  className={`px-3 py-1.5 rounded border ${p === safePage ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 hover:bg-gray-100"}`}>
                  {p}
                </Link>
              ))}
              {safePage < totalPages && (
                <Link href={`${ptPath}?page=${safePage + 1}`} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100">
                  {PT.next}
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer sections={navSections} />
    </>
  )
}

// ─── Article renderer ─────────────────────────────────────────────────────────

function renderArticle(translation: TranslationFull, section: SectionFull, related: Awaited<ReturnType<typeof relatedPt>>, navSections: NavSections) {
  const article     = translation.article
  const ps          = article.primarySection
  const sectionColor = ps?.color ?? section.color
  const sectionNamePt = (ps?.namePt || ps?.name) ?? section.namePt ?? section.name
  const ptSectionPath = ps ? getSectionPathPt(ps) : getSectionPathPt(section)
  const articleUrl  = `${SITE_URL}/pt/${ptSectionPath.replace(/^\/pt\//, "")}/${translation.slugPt}`
  const esUrl       = `${SITE_URL}${ps ? `/${ps.parent ? `${ps.parent.slug}/${ps.slug}` : ps.slug}` : ""}/${article.slug}`
  const pubDate     = new Date(article.publishedAt || article.createdAt).toISOString()

  const jsonLd = JSON.stringify({
    "@context":   "https://schema.org",
    "@type":      "NewsArticle",
    headline:     translation.titlePt,
    description:  translation.subtitlePt || translation.titlePt,
    url:          articleUrl,
    inLanguage:   "pt-BR",
    datePublished: pubDate,
    dateModified:  pubDate,
    author: { "@type": "Person", name: article.author.name || SITE_NAME },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    ...(article.heroImageUrl ? { image: { "@type": "ImageObject", url: article.heroImageUrl } } : {}),
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Header sections={navSections} />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* "Traduzido do espanhol · Ver original" */}
        <div className="text-xs font-cuerpo text-gray-400 mb-4">
          {PT.translatedFrom}
          {" · "}
          <a href={esUrl} className="underline hover:text-gray-600">{PT.seeOriginal}</a>
        </div>

        <div className="mb-6">
          <span
            className="inline-block text-xs font-cuerpo font-bold uppercase tracking-wider px-2 py-1 rounded text-white mb-3"
            style={{ backgroundColor: sectionColor }}
          >
            {sectionNamePt}
          </span>
          <h1 className="font-titular text-3xl md:text-5xl leading-tight">{translation.titlePt}</h1>
          {translation.subtitlePt && (
            <p className="font-cuerpo text-gray-600 text-lg mt-3">{translation.subtitlePt}</p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            <div className="flex items-center gap-3 text-sm text-gray-500 font-cuerpo">
              <span>{PT.by} {article.author.name}</span>
              <span>&middot;</span>
              <time>{PT.formatDate(article.publishedAt || article.createdAt)}</time>
            </div>
            <ShareButtons url={articleUrl} title={translation.titlePt} />
          </div>
        </div>

        {article.heroImageUrl && (
          <figure className="mb-8">
            <Image
              src={article.heroImageUrl}
              alt={translation.heroAltPt || translation.titlePt}
              width={896}
              height={504}
              sizes="(max-width: 896px) 100vw, 896px"
              className="w-full rounded-lg"
              quality={90}
              priority
            />
            {/* Credit not translated — keep original */}
            {article.heroCredit && (
              <figcaption className="text-xs text-gray-400 mt-2 font-cuerpo">{article.heroCredit}</figcaption>
            )}
          </figure>
        )}

        <ArticleBody html={translation.bodyPt} />

        <div className="mt-8 pt-6 border-t">
          <ShareButtons url={articleUrl} title={translation.titlePt} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <h2 className="font-titular text-2xl md:text-3xl mb-6 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full inline-block" style={{ backgroundColor: sectionColor }} />
            {PT.relatedArticles} {sectionNamePt}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((rel) => {
              if (!rel.translation) return null
              const rps = rel.primarySection
              const rPath = rps ? getSectionPathPt(rps) : ptSectionPath
              return (
                <ArticleCard
                  key={rel.id}
                  title={rel.translation.titlePt}
                  subtitle={rel.translation.subtitlePt}
                  slug={rel.translation.slugPt}
                  sectionPath={rPath}
                  sectionLabel={rps?.namePt || rps?.name || sectionNamePt}
                  sectionColor={rps?.color ?? sectionColor}
                  heroImageUrl={rel.heroImageUrl}
                  publishedAt={rel.publishedAt}
                  showSection={true}
                />
              )
            })}
          </div>
        </section>
      )}

      <Footer sections={navSections} />
    </>
  )
}
