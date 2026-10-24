import Link from "next/link"
import Image from "next/image"
import { formatDateShort } from "@/lib/utils"

type Props = {
  title: string
  subtitle?: string | null
  slug: string
  sectionPath: string
  sectionLabel: string
  sectionColor: string
  heroImageUrl?: string | null
  publishedAt?: string | Date | null
  showSection?: boolean
  authorName?: string | null
}

export default function ArticleCard({ title, subtitle, slug, sectionPath, sectionLabel, sectionColor, heroImageUrl, publishedAt, showSection = true, authorName }: Props) {
  const href = `${sectionPath}/${slug}`

  return (
    <article className="flex flex-col h-full">
      <Link href={href} className="block group">
        <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-gray-100 mb-3">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              quality={85}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-gray-400 font-titular text-xl">DUPLA</span>
            </div>
          )}
        </div>
      </Link>
      {showSection && (
        <Link
          href={sectionPath}
          className="inline-block mb-1.5 font-cuerpo font-extrabold uppercase tracking-[2px] text-[11px] hover:opacity-75 transition-opacity w-fit"
          style={{ color: sectionColor }}
        >
          {sectionLabel}
        </Link>
      )}
      <Link href={href} className="block group flex-1 flex flex-col">
        <h3 className="font-titular text-lg md:text-xl leading-tight group-hover:text-gray-600 transition-colors">{title}</h3>
        {subtitle && <p className="font-cuerpo text-gray-500 text-sm mt-1 line-clamp-2">{subtitle}</p>}
        {(authorName || publishedAt) && (
          <p className="font-cuerpo text-gray-400 text-xs mt-2">
            {authorName && <span>Por {authorName}</span>}
            {authorName && publishedAt && <span> · </span>}
            {publishedAt && <span>{formatDateShort(publishedAt)}</span>}
          </p>
        )}
      </Link>
    </article>
  )
}
