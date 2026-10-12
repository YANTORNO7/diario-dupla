"use client"

import { useMemo } from "react"
import DOMPurify from "dompurify"

export default function ArticleBody({ html }: { html: string }) {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src"],
      }),
    [html]
  )

  return (
    <div
      className="prose prose-lg max-w-none font-cuerpo prose-headings:font-titular prose-headings:tracking-tight prose-a:text-[#111111] prose-a:underline prose-img:rounded-lg prose-blockquote:border-l-4 prose-blockquote:border-[#111111]"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
