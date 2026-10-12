import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { SECTIONS, type Section } from "@/lib/constants"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, section: true, updatedAt: true },
  })

  const tags = await prisma.tag.findMany({
    select: { slug: true },
  })

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${BASE_URL}/argentina`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/brasil`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  ]

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/${SECTIONS[article.section as Section].slug}/${article.slug}`,
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

  return [...staticPages, ...articlePages, ...tagPages]
}
