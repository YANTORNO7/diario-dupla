import Link from "next/link"
import { SECTIONS, type Section } from "@/lib/constants"

type Props = {
  title: string
  subtitle?: string | null
  slug: string
  section: string
  heroImageUrl?: string | null
  publishedAt?: string | Date | null
}

export default function HeroArticle({ title, subtitle, slug, section, heroImageUrl }: Props) {
  const sectionInfo = SECTIONS[section as Section]
  const href = `/${sectionInfo.slug}/${slug}`

  return (
    <Link href={href} className="block group">
      <article className="relative rounded-lg overflow-hidden bg-[#111111] aspect-[16/9] md:aspect-[21/9]">
        {heroImageUrl && (
          <img src={heroImageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <span className="inline-block text-xs font-cuerpo font-bold uppercase tracking-wider px-2 py-1 rounded mb-3" style={{ backgroundColor: sectionInfo.color, color: "white" }}>
            {sectionInfo.label}
          </span>
          <h2 className="font-titular text-2xl md:text-4xl lg:text-5xl text-white leading-tight">{title}</h2>
          {subtitle && <p className="font-cuerpo text-gray-300 mt-2 text-sm md:text-base line-clamp-2">{subtitle}</p>}
        </div>
      </article>
    </Link>
  )
}
