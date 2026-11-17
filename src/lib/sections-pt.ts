/**
 * sections-pt.ts
 * Route helpers for the PT version — uses slugPt instead of slug.
 */

import { prisma } from "@/lib/prisma"
import type { SectionNav } from "@/lib/sections"

type SectionPt = {
  slugPt?: string | null
  slug: string
  parent?: { slugPt?: string | null; slug: string } | null
}

type ArticleTranslationPt = {
  slugPt: string
  article: {
    primarySection: SectionPt | null
  }
}

export function getSectionPathPt(section: SectionPt): string {
  const slugPt = section.slugPt || section.slug
  if (section.parent) {
    const parentSlugPt = section.parent.slugPt || section.parent.slug
    return `/pt/${parentSlugPt}/${slugPt}`
  }
  return `/pt/${slugPt}`
}

export function getArticlePathPt(translation: ArticleTranslationPt): string {
  const section = translation.article.primarySection
  if (!section) return `/pt/${translation.slugPt}`
  return `${getSectionPathPt(section)}/${translation.slugPt}`
}

/** Build nav sections for PT header/footer — uses PT names and PT paths. */
export async function getNavSectionsPt(): Promise<SectionNav[]> {
  const sections = await prisma.section.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  })

  return sections.map((s) => {
    const slugPt = s.slugPt || s.slug
    return {
      id:          s.id,
      name:        s.namePt || s.name,
      slug:        slugPt,
      color:       s.color,
      description: s.descPt || s.description,
      path:        `/pt/${slugPt}`,
      children:    s.children.map((c) => {
        const cSlugPt = (c as typeof c & { slugPt?: string | null }).slugPt || c.slug
        return {
          id:    c.id,
          name:  (c as typeof c & { namePt?: string | null }).namePt || c.name,
          slug:  cSlugPt,
          color: c.color,
          path:  `/pt/${slugPt}/${cSlugPt}`,
        }
      }),
    }
  })
}
