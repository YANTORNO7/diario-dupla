"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Article = {
  id: string
  title: string
  section: string
  status: string
  featured: boolean
  publishedAt: Date | string | null
  createdAt: Date | string
  author: { name: string }
  tags: { name: string }[]
}

export default function ArticleList({ articles }: { articles: Article[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este artículo?")) return
    setDeleting(id)
    await fetch(`/api/articles/${id}`, { method: "DELETE" })
    router.refresh()
    setDeleting(null)
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
    await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    router.refresh()
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500 font-cuerpo">No hay artículos todavía.</p>
        <Link href="/admin/articulos/nuevo" className="inline-block mt-4 text-sm text-[#111111] underline font-cuerpo">
          Crear el primero
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-cuerpo">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold">Título</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Sección</th>
              <th className="text-left px-4 py-3 font-semibold">Estado</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Fecha</th>
              <th className="text-right px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{article.title}</div>
                  <div className="text-xs text-gray-500 md:hidden mt-1">
                    {article.section === "ARGENTINA" ? "Argentina" : "Brasil"}
                  </div>
                  {article.featured && (
                    <span className="inline-block text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded mt-1">
                      Destacada
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded font-medium ${
                      article.section === "ARGENTINA"
                        ? "bg-[#75AADB]/10 text-[#75AADB]"
                        : "bg-[#009C3B]/10 text-[#009C3B]"
                    }`}
                  >
                    {article.section === "ARGENTINA" ? "Argentina" : "Brasil"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded font-medium ${
                      article.status === "PUBLISHED"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {article.status === "PUBLISHED" ? "Publicado" : "Borrador"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                  {new Date(article.createdAt).toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/articulos/${article.id}/editar`} className="text-xs text-blue-600 hover:underline">
                      Editar
                    </Link>
                    <button onClick={() => toggleStatus(article.id, article.status)} className="text-xs text-gray-600 hover:underline">
                      {article.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={deleting === article.id}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deleting === article.id ? "..." : "Eliminar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
