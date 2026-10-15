import Link from "next/link"

type Props = {
  title: string
  subtitle?: string | null
  slug: string
  sectionPath: string
  sectionLabel: string
  sectionColor: string
  heroImageUrl?: string | null
  publishedAt?: string | Date | null
}

export default function HeroArticle({ title, subtitle, slug, sectionPath, sectionLabel, sectionColor, heroImageUrl }: Props) {
  const href = `${sectionPath}/${slug}`

  return (
    <Link href={href} className="block group">
      <article className="relative rounded-lg overflow-hidden bg-[#111111] aspect-[16/9] md:aspect-[21/9]">
        {heroImageUrl && (
          <img src={heroImageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <span className="absolute top-3 left-3 md:hidden text-[9px] font-cuerpo font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: sectionColor, color: "white" }}>
          {sectionLabel}
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <span className="hidden md:inline-block text-xs font-cuerpo font-bold uppercase tracking-wider px-2 py-1 rounded mb-3" style={{ backgroundColor: sectionColor, color: "white" }}>
            {sectionLabel}
          </span>
          <h2 className="font-titular text-2xl md:text-4xl lg:text-5xl text-white leading-tight">{title}</h2>
          {subtitle && <p className="font-cuerpo text-gray-300 mt-2 text-sm md:text-base line-clamp-2">{subtitle}</p>}
        </div>
      </article>
    </Link>
  )
}
