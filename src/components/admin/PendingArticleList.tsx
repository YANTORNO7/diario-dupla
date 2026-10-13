"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Article = {
  id: string
  title: string
  subtitle: string | null
  body: string
  createdAt: Date | string
  updatedAt: Date | string
  author: { id: string; name: string }
  primarySection: { name: string; color: string; parent?: { name: string } | null } | null
  tags: { name: string }[]
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()
}

export default function PendingArticleList({ articles }: { articles: Article[] }) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionNote, setRejectionNote] = useState("")

  async function handleApprove(id: string) {
    setProcessing(id)
    await fetch(`/api/articles/${id}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    })
    router.refresh()
    setProcessing(null)
  }

  async function handleReject(id: string) {
    setProcessing(id)
    await fetch(`/api/articles/${id}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", rejectionNote: rejectionNote || undefined }),
    })
    setRejectingId(null)
    setRejectionNote("")
    router.refresh()
    setProcessing(null)
  }

  function getSectionLabel(article: Article): string {
    if (!article.primarySection) return ""
    if (article.primarySection.parent) {
      return `${article.primarySection.parent.name} > ${article.primarySection.name}`
    }
    return article.primarySection.name
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500 font-cuerpo">No hay artículos pendientes de revisión.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => {
        const sectionLabel = getSectionLabel(article)
        const excerpt = stripHtml(article.body).slice(0, 200)
        const isProcessing = processing === article.id

        return (
          <div key={article.id} className="bg-white rounded-lg border p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold font-cuerpo">{article.title}</h2>
                {article.subtitle && (
                  <p className="text-sm text-gray-600 font-cuerpo mt-1">{article.subtitle}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500 font-cuerpo">
                  <span>{article.author.name}</span>
                  <span>·</span>
                  {sectionLabel && (
                    <>
                      <span
                        className="inline-block px-2 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor: `${article.primarySection?.color || "#888"}1A`,
                          color: article.primarySection?.color || "#888",
                        }}
                      >
                        {sectionLabel}
                      </span>
                      <span>·</span>
                    </>
                  )}
                  <span>{new Date(article.updatedAt).toLocaleDateString("es-AR")}</span>
                </div>
                <p className="text-sm text-gray-600 font-cuerpo mt-3 line-clamp-3">
                  {excerpt}{excerpt.length >= 200 ? "..." : ""}
                </p>
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.tags.map((tag) => (
                      <span key={tag.name} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-cuerpo">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {rejectingId === article.id ? (
              <div className="mt-4 border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">
                  Motivo del rechazo <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="Explicá por qué el artículo necesita cambios..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md text-sm font-cuerpo focus:outline-none focus:ring-2 focus:ring-[#111111]"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleReject(article.id)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-cuerpo hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Rechazando..." : "Confirmar rechazo"}
                  </button>
                  <button
                    onClick={() => { setRejectingId(null); setRejectionNote("") }}
                    className="px-3 py-1.5 text-sm font-cuerpo text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-4 border-t pt-4">
                <Link
                  href={`/admin/articulos/${article.id}/editar`}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-cuerpo hover:bg-gray-50 transition-colors"
                >
                  Ver completo
                </Link>
                <button
                  onClick={() => handleApprove(article.id)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-cuerpo hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? "Aprobando..." : "Aprobar"}
                </button>
                <button
                  onClick={() => setRejectingId(article.id)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-cuerpo hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Rechazar
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
