import Link from "next/link"

export default function TagBadge({ name, slug }: { name: string; slug: string }) {
  return (
    <Link href={`/etiqueta/${slug}`}
      className="inline-block text-xs font-cuerpo bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors">
      {name}
    </Link>
  )
}
