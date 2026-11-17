export const revalidate = 60

import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { getSectionPath, getArticlePath } from "@/lib/sections"
import { getSectionPathPt, getArticlePathPt } from "@/lib/sections-pt"
import { getPtMode } from "@/lib/translation-config"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sections, articles, tags, ptMode] = await Promise.all([
    prisma.section.findMany({
      include: { parent: true },
      orderBy: { order: "asc" },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        primarySection: { include: { parent: true } },
        translation: {
          select: { slugPt: true, updatedAt: true, status: true }
        },
      },
    }),
    prisma.tag.findMany({
      select: { slug: true },
    }),
    getPtMode(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
  ]

  const sectionPages: MetadataRoute.Sitemap = sections.map((section) => ({
    url: `${BASE_URL}${getSectionPath(section)}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }))

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}${getArticlePath(article)}`,
    lastModified: article.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
    // Add hreflang alternates when PT is public and article has approved translation
    ...(ptMode === "public" && article.translation && article.translation.status !== "REVIEW"
      ? {
          alternates: {
            languages: {
              "es": `${BASE_URL}${getArticlePath(article)}`,
              "pt-BR": `${BASE_URL}${getArticlePathPt({
                slugPt: article.translation.slugPt,
                article: { primarySection: article.primarySection },
              })}`,
            },
          },
        }
      : {}),
  }))

  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${BASE_URL}/etiqueta/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.5,
  }))

  // PT pages (only when public)
  const ptSectionPages: MetadataRoute.Sitemap = ptMode === "public"
    ? sections.map((section) => ({
        url: `${BASE_URL}${getSectionPathPt(section)}`,
        lastModified: new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.8,
      }))
    : []

  const ptArticlePages: MetadataRoute.Sitemap = ptMode === "public"
    ? articles
        .filter((a) => a.translation && a.translation.status !== "REVIEW")
        .map((article) => ({
          url: `${BASE_URL}${getArticlePathPt({
            slugPt: article.translation!.slugPt,
            article: { primarySection: article.primarySection },
          })}`,
          lastModified: article.translation!.updatedAt,
          changeFrequency: "daily" as const,
          priority: 0.7,
          alternates: {
            languages: {
              "pt-BR": `${BASE_URL}${getArticlePathPt({
                slugPt: article.translation!.slugPt,
                article: { primarySection: article.primarySection },
              })}`,
              "es": `${BASE_URL}${getArticlePath(article)}`,
            },
          },
        }))
    : []

  return [
    ...staticPages,
    ...sectionPages,
    ...articlePages,
    ...tagPages,
    ...ptSectionPages,
    ...ptArticlePages,
  ]
}
