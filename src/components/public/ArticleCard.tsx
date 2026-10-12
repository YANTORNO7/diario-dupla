import Link from "next/link"
import { SECTIONS } from "@/lib/constants"
import { formatDateShort } from "@/lib/utils"

type Props = {
  title: string
  subtitle?: string | null
  slug: string
  section: "ARGENTINA" | "BRASIL"
  heroImageUrl?: string | null
  publishedAt?: string | Date | null
  showSection?: boolean
}

export default function ArticleCard({ title, subtitle, slug, section, heroImageUrl, publishedAt, showSection = true }: Props) {
  const sectionInfo = SECTIONS[section]
  const href = `/${sectionInfo.slug}/${slug}`

  return (
    <Link href={href} className="block group">
      <article className="flex flex-col h-full">
        <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-gray-100 mb-3">
          {heroImageUrl ? (
            <img src={heroImageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-gray-400 font-titular text-xl">DUPLA</span>
            </div>
          )}
          {showSection && (
            <span className="absolute top-2 left-2 text-[10px] font-cuerpo font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ backgroundColor: sectionInfo.color, color: "white" }}>
              {sectionInfo.label}
            </span>
          )}
        </div>
        <h3 className="font-titular text-lg md:text-xl leading-tight group-hover:text-gray-600 transition-colors">{title}</h3>
        {subtitle && <p className="font-cuerpo text-gray-500 text-sm mt-1 line-clamp-2">{subtitle}</p>}
        {publishedAt && <p className="font-cuerpo text-gray-400 text-xs mt-2">{formatDateShort(publishedAt)}</p>}
      </article>
    </Link>
  )
}
