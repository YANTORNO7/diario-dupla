export const revalidate = 60

import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { getSectionPath, getArticlePath } from "@/lib/sections"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sections, articles, tags] = await Promise.all([
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
      },
    }),
    prisma.tag.findMany({
      select: { slug: true },
    }),
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
  }))

  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${BASE_URL}/etiqueta/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.5,
  }))

  return [...staticPages, ...sectionPages, ...articlePages, ...tagPages]
}
