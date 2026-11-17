"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type Subscriber = {
  id: string
  name: string
}

export default function SubscriberHeaderMenu() {
  const pathname = usePathname()
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/subscriber/me")
      .then((res) => res.json())
      .then((data) => {
        setSubscriber(data.subscriber)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  if (!loaded) return null

  if (subscriber) {
    return (
      <Link
        href="/cuenta"
        className="flex items-center gap-1 px-2 py-1 text-xs font-cuerpo text-white hover:text-[#F2B632] transition-colors"
        title="Mi cuenta"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="hidden sm:inline">{subscriber.name.split(" ")[0]}</span>
      </Link>
    )
  }

  return (
    <Link
      href={`/ingresar?volver=${encodeURIComponent(pathname)}`}
      className="px-2 py-1 text-xs font-cuerpo font-semibold uppercase tracking-wide text-white hover:text-[#F2B632] transition-colors"
    >
      Ingresar
    </Link>
  )
}
