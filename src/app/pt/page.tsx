export const revalidate = 30

import { prisma } from "@/lib/prisma"
import Header from "@/components/public/Header"
import Footer from "@/components/public/Footer"
import HeroArticle from "@/components/public/HeroArticle"
import ArticleCard from "@/components/public/ArticleCard"
import SectionBlock from "@/components/public/SectionBlock"
import { getNavSectionsPt, getSectionPathPt } from "@/lib/sections-pt"
import { SITE_URL } from "@/lib/constants"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Diario Dupla — O jornal do futebol argentino e brasileiro",
  description: "Diario Dupla: todas as notícias da Liga Profissional argentina e do Brasileirão.",
  alternates: { canonical: `${SITE_URL}/pt` },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_URL}/pt`,
  },
}

export default async function PtHomePage() {
  const [navSections] = await Promise.all([getNavSectionsPt()])

  // Featured: published article with approved PT translation
  const featured = await prisma.article.findFirst({
    where: {
      status: "PUBLISHED",
      featured: true,
      translation: { status: { in: ["AUTO", "REVIEWED"] } },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: {
      translation: true,
      primarySection: { include: { parent: true } },
    },
  })

  // Latest articles with approved PT translation
  const latest = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      translation: { status: { in: ["AUTO", "REVIEWED"] } },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 6,
    include: {
      translation: true,
      primarySection: { include: { parent: true } },
    },
  })

  // Homepage sections with PT translations
  const homepageSections = await prisma.section.findMany({
    where: { showOnHomepage: true, parentId: null },
    include: { children: true },
    orderBy: { order: "asc" },
  })

  const sectionBlocks = await Promise.all(
    homepageSections.map(async (section) => {
      const childIds = section.children.map((c) => c.id)
      const articles = await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          translation: { status: { in: ["AUTO", "REVIEWED"] } },
          OR: [
            { sectionId: section.id },
            ...(childIds.length > 0 ? [{ sectionId: { in: childIds } }] : []),
            { secondarySections: { some: { id: section.id } } },
          ],
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 3,
        include: {
          translation: true,
          primarySection: { include: { parent: true } },
        },
      })
      return {
        sectionLabel: section.namePt || section.name,
        sectionPath:  getSectionPathPt(section),
        sectionColor: section.color,
        articles,
      }
    })
  )

  const latestFiltered = latest.filter((a) => a.id !== featured?.id)

  function getArticlePtProps(article: typeof latest[number]) {
    const t = article.translation
    const ps = article.primarySection
    const sectionPathPt = ps ? getSectionPathPt(ps) : "/pt"
    const sectionLabel = ps?.namePt || ps?.name || ""
    const sectionColor = ps?.color || "#888888"
    // For PT, slugs go under the PT section path
    const slugPt = t?.slugPt || article.slug
    return {
      title:       t?.titlePt    || article.title,
      subtitle:    t?.subtitlePt ?? article.subtitle,
      slug:        `${sectionPathPt}/${slugPt}`.replace(/^\/pt\//, "").replace(/^\//, ""),
      sectionPath: sectionPathPt,
      sectionLabel,
      sectionColor,
    }
  }

  const organizationLd = JSON.stringify({
    "@context":  "https://schema.org",
    "@type":     "NewsMediaOrganization",
    name:        "Diario Dupla",
    url:         SITE_URL,
    inLanguage:  "pt-BR",
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationLd }} />
      <Header sections={navSections} />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {featured?.translation ? (
            <HeroArticle
              title={featured.translation.titlePt}
              subtitle={featured.translation.subtitlePt}
              slug={`pt/${getSectionPathPt(featured.primarySection ?? { slug: "", parent: null }).replace(/^\/pt\//, "")}/${featured.translation.slugPt}`}
              heroImageUrl={featured.heroImageUrl}
              publishedAt={featured.publishedAt}
              sectionPath={getSectionPathPt(featured.primarySection ?? { slug: "", parent: null })}
              sectionLabel={featured.primarySection?.namePt || featured.primarySection?.name || ""}
              sectionColor={featured.primarySection?.color || "#888888"}
            />
          ) : latestFiltered[0]?.translation ? (
            (() => {
              const a = latestFiltered[0]
              const props = getArticlePtProps(a)
              return (
                <HeroArticle
                  title={props.title}
                  subtitle={props.subtitle}
                  slug={`${props.sectionPath}/${a.translation!.slugPt}`}
                  heroImageUrl={a.heroImageUrl}
                  publishedAt={a.publishedAt}
                  sectionPath={props.sectionPath}
                  sectionLabel={props.sectionLabel}
                  sectionColor={props.sectionColor}
                />
              )
            })()
          ) : (
            <div className="bg-[#111111] rounded-lg p-12 text-center">
              <h2 className="font-titular text-3xl text-white">DIARIO DUPLA</h2>
              <p className="text-gray-400 font-cuerpo mt-2">
                O jornal do futebol argentino e brasileiro, e dos esportes que nos unem
              </p>
            </div>
          )}

          {latestFiltered.length > 0 && (
            <section className="mt-10">
              <h2 className="font-titular text-2xl md:text-3xl mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full inline-block bg-[#111111]" />
                Últimas notícias
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestFiltered.slice(0, 6).map((article) => {
                  if (!article.translation) return null
                  const ps = article.primarySection
                  const sectionPath = ps ? getSectionPathPt(ps) : "/pt"
                  return (
                    <ArticleCard
                      key={article.id}
                      title={article.translation.titlePt}
                      subtitle={article.translation.subtitlePt}
                      slug={`${sectionPath}/${article.translation.slugPt}`}
                      heroImageUrl={article.heroImageUrl}
                      publishedAt={article.publishedAt}
                      authorName=""
                      sectionPath={sectionPath}
                      sectionLabel={ps?.namePt || ps?.name || ""}
                      sectionColor={ps?.color || "#888888"}
                    />
                  )
                })}
              </div>
            </section>
          )}

          {sectionBlocks.map((block) => (
            <div key={block.sectionPath} className="mt-10">
              <SectionBlock
                sectionLabel={block.sectionLabel}
                sectionPath={block.sectionPath}
                sectionColor={block.sectionColor}
                articles={block.articles.map((a) => ({
                  ...a,
                  title: (a as typeof a & { translation?: { titlePt: string; subtitlePt?: string | null; slugPt: string } | null }).translation?.titlePt || a.title,
                  subtitle: (a as typeof a & { translation?: { titlePt: string; subtitlePt?: string | null; slugPt: string } | null }).translation?.subtitlePt ?? a.subtitle,
                  slug: (a as typeof a & { translation?: { titlePt: string; subtitlePt?: string | null; slugPt: string } | null }).translation?.slugPt || a.slug,
                }))}
              />
            </div>
          ))}
        </div>
      </main>
      <Footer sections={navSections} />
    </>
  )
}
