import { prisma } from "./prisma"

export type SectionNav = {
  id: string
  name: string
  slug: string
  color: string
  path: string
  children: { id: string; name: string; slug: string; color: string; path: string }[]
}

export async function getNavSections(): Promise<SectionNav[]> {
  const sections = await prisma.section.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  })

  return sections.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    color: s.color,
    path: `/${s.slug}`,
    children: s.children.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      color: c.color,
      path: `/${s.slug}/${c.slug}`,
    })),
  }))
}

export function getSectionPath(section: { slug: string; parent?: { slug: string } | null }): string {
  if (section.parent) {
    return `/${section.parent.slug}/${section.slug}`
  }
  return `/${section.slug}`
}

export function getArticlePath(article: { slug: string; primarySection: { slug: string; parent?: { slug: string } | null } | null }): string {
  if (!article.primarySection) return `/${article.slug}`
  return `${getSectionPath(article.primarySection)}/${article.slug}`
}
