"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import RichTextEditor from "./RichTextEditor"
import ImageUploader from "./ImageUploader"
import TagInput from "./TagInput"

type Article = {
  id: string
  title: string
  subtitle: string | null
  body: string
  heroImageUrl: string | null
  heroCredit: string | null
  section: string
  status: string
  featured: boolean
  tags: { name: string }[]
}

export default function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState(article?.title || "")
  const [subtitle, setSubtitle] = useState(article?.subtitle || "")
  const [body, setBody] = useState(article?.body || "")
  const [heroImageUrl, setHeroImageUrl] = useState(article?.heroImageUrl || "")
  const [heroCredit, setHeroCredit] = useState(article?.heroCredit || "")
  const [section, setSection] = useState(article?.section || "ARGENTINA")
  const [featured, setFeatured] = useState(article?.featured || false)
  const [tags, setTags] = useState<string[]>(article?.tags.map((t) => t.name) || [])

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    if (!title.trim()) { setError("El título es obligatorio"); return }
    if (!body.trim() || body === "<p></p>") { setError("El cuerpo del artículo es obligatorio"); return }

    setSaving(true)
    setError("")

    const payload = { title, subtitle: subtitle || undefined, body, heroImageUrl: heroImageUrl || undefined, heroCredit: heroCredit || undefined, section, status, featured, tags }

    try {
      const url = article ? `/api/articles/${article.id}` : "/api/articles"
      const method = article ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al guardar")
        return
      }
      router.push("/admin")
      router.refresh()
    } catch {
      setError("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-cuerpo">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Título *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="El título de la nota"
          className="w-full px-3 py-2 border rounded-md text-lg font-titular focus:outline-none focus:ring-2 focus:ring-[#111111]" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Bajada</label>
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Un resumen breve de la nota"
          className="w-full px-3 py-2 border rounded-md font-cuerpo focus:outline-none focus:ring-2 focus:ring-[#111111]" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Imagen principal</label>
        <ImageUploader currentUrl={heroImageUrl} onUpload={setHeroImageUrl} />
        <div className="mt-2">
          <input value={heroCredit} onChange={(e) => setHeroCredit(e.target.value)} placeholder="Crédito de la imagen (ej: Foto: AFP)"
            className="w-full px-3 py-2 border rounded-md text-sm font-cuerpo focus:outline-none focus:ring-2 focus:ring-[#111111]" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Cuerpo del artículo *</label>
        <RichTextEditor content={body} onChange={setBody} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Sección *</label>
          <select value={section} onChange={(e) => setSection(e.target.value)}
            className="w-full px-3 py-2 border rounded-md font-cuerpo focus:outline-none focus:ring-2 focus:ring-[#111111]">
            <option value="ARGENTINA">Argentina</option>
            <option value="BRASIL">Brasil</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Etiquetas</label>
          <TagInput value={tags} onChange={setTags} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
        <label htmlFor="featured" className="text-sm font-cuerpo text-gray-700">Nota destacada en la portada</label>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t">
        <button onClick={() => handleSave("DRAFT")} disabled={saving}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-cuerpo hover:bg-gray-50 disabled:opacity-50 transition-colors">
          {saving ? "Guardando..." : "Guardar borrador"}
        </button>
        <button onClick={() => handleSave("PUBLISHED")} disabled={saving}
          className="px-4 py-2 bg-[#111111] text-white rounded-md text-sm font-cuerpo hover:bg-gray-800 disabled:opacity-50 transition-colors">
          {saving ? "Publicando..." : "Publicar"}
        </button>
        <button onClick={() => router.push("/admin")}
          className="px-4 py-2 text-sm font-cuerpo text-gray-500 hover:text-gray-700 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  )
}
