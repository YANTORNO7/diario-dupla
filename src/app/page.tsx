export const revalidate = 60

import { prisma } from "@/lib/prisma"
import Header from "@/components/public/Header"
import Footer from "@/components/public/Footer"
import HeroArticle from "@/components/public/HeroArticle"
import ArticleCard from "@/components/public/ArticleCard"
import SectionBlock from "@/components/public/SectionBlock"
import { getNavSections, getSectionPath } from "@/lib/sections"

export default async function HomePage() {
  const [featured, latest, navSections] = await Promise.all([
    prisma.article.findFirst({
      where: { status: "PUBLISHED", featured: true },
      orderBy: { publishedAt: "desc" },
      include: {
        tags: true,
        author: { select: { name: true } },
        primarySection: { include: { parent: true } },
      },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: {
        tags: true,
        author: { select: { name: true } },
        primarySection: { include: { parent: true } },
      },
    }),
    getNavSections(),
  ])

  // Load top-level sections flagged for homepage
  const homepageSections = await prisma.section.findMany({
    where: { showOnHomepage: true, parentId: null },
    include: { children: true, parent: true },
    orderBy: { order: "asc" },
  })

  const sectionBlocks = await Promise.all(
    homepageSections.map(async (section) => {
      const childIds = section.children.map((c) => c.id)
      const articles = await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { sectionId: section.id },
            ...(childIds.length > 0 ? [{ sectionId: { in: childIds } }] : []),
            { secondarySections: { some: { id: section.id } } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        take: 3,
        include: {
          tags: true,
          author: { select: { name: true } },
          primarySection: { include: { parent: true } },
        },
      })
      return {
        sectionLabel: section.name,
        sectionPath: getSectionPath(section),
        sectionColor: section.color,
        articles,
      }
    })
  )

  const latestFiltered = latest.filter((a) => a.id !== featured?.id)

  function getArticleSectionProps(article: {
    primarySection: {
      slug: string
      name: string
      color: string
      parent?: { slug: string } | null
    } | null
  }) {
    if (!article.primarySection) {
      return { sectionPath: "/", sectionLabel: "", sectionColor: "#888888" }
    }
    return {
      sectionPath: getSectionPath(article.primarySection),
      sectionLabel: article.primarySection.name,
      sectionColor: article.primarySection.color,
    }
  }

  const organizationLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "Diario Dupla",
    url: "https://diariodupla.com",
    logo: {
      "@type": "ImageObject",
      url: "https://diariodupla.com/icon.png",
      width: 512,
      height: 512,
    },
    sameAs: [
      "https://www.instagram.com/diariodupla.ar",
    ],
    description: "El diario del fútbol argentino y brasileño, y de los deportes que nos unen",
  })

  const websiteLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Diario Dupla",
    url: "https://diariodupla.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://diariodupla.com/buscar?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteLd }} />
      <Header sections={navSections} />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {featured ? (
            <HeroArticle
              title={featured.title}
              subtitle={featured.subtitle}
              slug={featured.slug}
              heroImageUrl={featured.heroImageUrl}
              publishedAt={featured.publishedAt}
              {...getArticleSectionProps(featured)}
            />
          ) : latestFiltered[0] ? (
            <HeroArticle
              title={latestFiltered[0].title}
              subtitle={latestFiltered[0].subtitle}
              slug={latestFiltered[0].slug}
              heroImageUrl={latestFiltered[0].heroImageUrl}
              publishedAt={latestFiltered[0].publishedAt}
              {...getArticleSectionProps(latestFiltered[0])}
            />
          ) : (
            <div className="bg-[#111111] rounded-lg p-12 text-center">
              <h2 className="font-titular text-3xl text-white">DIARIO DUPLA</h2>
              <p className="text-gray-400 font-cuerpo mt-2 hidden md:block">
                El diario del f&uacute;tbol argentino y brasile&ntilde;o, y de los deportes que nos unen
              </p>
              <p className="text-gray-400 font-cuerpo mt-2 md:hidden">
                F&uacute;tbol y deportes que nos unen
              </p>
              <p className="text-gray-500 font-cuerpo mt-4 text-sm">
                Todav&iacute;a no hay art&iacute;culos publicados. Ingres&aacute; al{" "}
                <a href="/admin" className="text-white underline">panel de administraci&oacute;n</a>{" "}
                para crear el primero.
              </p>
            </div>
          )}

          {latestFiltered.length > 0 && (
            <section className="mt-10">
              <h2 className="font-titular text-2xl md:text-3xl mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full inline-block bg-[#111111]" />
                &Uacute;ltimas noticias
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestFiltered.slice(0, 6).map((article) => (
                  <ArticleCard
                    key={article.id}
                    title={article.title}
                    subtitle={article.subtitle}
                    slug={article.slug}
                    heroImageUrl={article.heroImageUrl}
                    publishedAt={article.publishedAt}
                    authorName={article.author.name}
                    {...getArticleSectionProps(article)}
                  />
                ))}
              </div>
            </section>
          )}

          {sectionBlocks.map((block) => (
            <div key={block.sectionPath} className="mt-10">
              <SectionBlock
                sectionLabel={block.sectionLabel}
                sectionPath={block.sectionPath}
                sectionColor={block.sectionColor}
                articles={block.articles}
              />
            </div>
          ))}
        </div>
      </main>
      <Footer sections={navSections} />
    </>
  )
}
