import { prisma } from "@/lib/prisma"
import Header from "@/components/public/Header"
import Footer from "@/components/public/Footer"
import HeroArticle from "@/components/public/HeroArticle"
import ArticleCard from "@/components/public/ArticleCard"
import SectionBlock from "@/components/public/SectionBlock"

export default async function HomePage() {
  const [featured, latest, argArticles, braArticles] = await Promise.all([
    prisma.article.findFirst({
      where: { status: "PUBLISHED", featured: true },
      orderBy: { publishedAt: "desc" },
      include: { tags: true },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: { tags: true },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", section: "ARGENTINA" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { tags: true },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", section: "BRASIL" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { tags: true },
    }),
  ])

  const latestFiltered = latest.filter((a) => a.id !== featured?.id)

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {featured ? (
            <HeroArticle
              title={featured.title}
              subtitle={featured.subtitle}
              slug={featured.slug}
              section={featured.section}
              heroImageUrl={featured.heroImageUrl}
              publishedAt={featured.publishedAt}
            />
          ) : latestFiltered[0] ? (
            <HeroArticle
              title={latestFiltered[0].title}
              subtitle={latestFiltered[0].subtitle}
              slug={latestFiltered[0].slug}
              section={latestFiltered[0].section}
              heroImageUrl={latestFiltered[0].heroImageUrl}
              publishedAt={latestFiltered[0].publishedAt}
            />
          ) : (
            <div className="bg-[#111111] rounded-lg p-12 text-center">
              <h2 className="font-titular text-3xl text-white">DIARIO DUPLA</h2>
              <p className="text-gray-400 font-cuerpo mt-2">
                El diario del fútbol argentino y brasileño
              </p>
              <p className="text-gray-500 font-cuerpo mt-4 text-sm">
                Todavía no hay artículos publicados. Ingresá al{" "}
                <a href="/admin" className="text-white underline">panel de administración</a>{" "}
                para crear el primero.
              </p>
            </div>
          )}

          {latestFiltered.length > 0 && (
            <section className="mt-10">
              <h2 className="font-titular text-2xl md:text-3xl mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full inline-block bg-[#111111]" />
                Últimas noticias
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestFiltered.slice(0, 6).map((article) => (
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
            </section>
          )}

          <div className="mt-10">
            <SectionBlock section="ARGENTINA" articles={argArticles} />
          </div>

          <div className="mt-10">
            <SectionBlock section="BRASIL" articles={braArticles} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
