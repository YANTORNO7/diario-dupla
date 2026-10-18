"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import RichTextEditor from "./RichTextEditor"
import ImageUploader from "./ImageUploader"
import TagInput from "./TagInput"

type SectionOption = {
  id: string
  name: string
  slug: string
  parentId: string | null
  parent: { name: string } | null
  children: { id: string; name: string }[]
}

type Article = {
  id: string
  title: string
  subtitle: string | null
  body: string
  heroImageUrl: string | null
  heroCredit: string | null
  section: string
  sectionId: string | null
  status: string
  featured: boolean
  tags: { name: string }[]
  secondarySections?: { id: string }[]
  rejectionNote?: string | null
}

type UserOption = { id: string; name: string }

export default function ArticleForm({
  article,
  authorName,
  authorId: initialAuthorId,
  sections,
  userRole = "ADMIN",
  users = [],
}: {
  article?: Article
  authorName: string
  authorId?: string
  sections: SectionOption[]
  userRole?: string
  users?: UserOption[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Compute leaf sections first so we can use it as default for sectionId
  const leafSections = sections.filter((s) => s.children.length === 0)

  // Default to first leaf section — avoids accidentally saving La Dupla (parent) as primary
  const defaultSectionId = article?.sectionId && leafSections.some(s => s.id === article.sectionId)
    ? article.sectionId
    : leafSections.find(s => !s.parentId)?.id || leafSections[0]?.id || ""

  const [title, setTitle] = useState(article?.title || "")
  const [subtitle, setSubtitle] = useState(article?.subtitle || "")
  const [body, setBody] = useState(article?.body || "")
  const [heroImageUrl, setHeroImageUrl] = useState(article?.heroImageUrl || "")
  const [heroCredit, setHeroCredit] = useState(article?.heroCredit || "")
  const [sectionId, setSectionId] = useState(defaultSectionId)
  const [featured, setFeatured] = useState(article?.featured || false)
  const [tags, setTags] = useState<string[]>(article?.tags.map((t) => t.name) || [])
  const [author, setAuthor] = useState(authorName)
  const [selectedAuthorId, setSelectedAuthorId] = useState(initialAuthorId || "")
  const [secondaryIds, setSecondaryIds] = useState<string[]>(
    article?.secondarySections?.map((s) => s.id) || []
  )
  // Group by parent for optgroups
  const topLevel = leafSections.filter((s) => !s.parentId)
  const grouped = sections
    .filter((s) => s.children.length > 0)
    .map((parent) => ({
      parent,
      children: leafSections.filter((s) => s.parentId === parent.id),
    }))
    .filter((g) => g.children.length > 0)

  // Secondary options: leaf sections + parent sections (top-level with children, e.g. La Dupla)
  // excluding the current primary
  const parentSections = sections.filter((s) => s.children.length > 0 && !s.parentId)
  const secondaryOptions = [
    ...leafSections.filter((s) => s.id !== sectionId),
    ...parentSections.filter((s) => s.id !== sectionId),
  ]

  function toggleSecondary(id: string) {
    setSecondaryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    if (!title.trim()) { setError("El título es obligatorio"); return }
    if (!body.trim() || body === "<p></p>") { setError("El cuerpo del artículo es obligatorio"); return }
    if (!sectionId) { setError("La sección es obligatoria"); return }

    setSaving(true)
    setError("")

    const changingAuthor = userRole === "ADMIN" && users.length > 0 && selectedAuthorId && selectedAuthorId !== initialAuthorId
    const payload: Record<string, unknown> = {
      title,
      subtitle: subtitle || undefined,
      body,
      heroImageUrl: heroImageUrl || undefined,
      heroCredit: heroCredit || undefined,
      sectionId,
      secondarySectionIds: secondaryIds,
      status,
      featured,
      tags,
      // Don't send authorName when changing authorId — it would rename the wrong user
      authorName: changingAuthor ? undefined : (author.trim() || undefined),
    }
    if (changingAuthor) {
      payload.authorId = selectedAuthorId
    }

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
      {article?.rejectionNote && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-cuerpo">
          <p className="font-medium">Artículo devuelto para revisión</p>
          <p className="mt-1">{article.rejectionNote}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-cuerpo">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Título *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="El título de la nota"
          className="w-full px-3 py-2 border rounded-md text-lg font-titular focus:outline-none focus:ring-2 focus:ring-[#111111]" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Autor</label>
        {userRole === "ADMIN" && users.length > 0 ? (
          <select
            value={selectedAuthorId}
            onChange={(e) => {
              setSelectedAuthorId(e.target.value)
              const u = users.find(u => u.id === e.target.value)
              if (u) setAuthor(u.name)
            }}
            className="w-full px-3 py-2 border rounded-md font-cuerpo focus:outline-none focus:ring-2 focus:ring-[#111111]"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        ) : (
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nombre del autor"
            className="w-full px-3 py-2 border rounded-md font-cuerpo focus:outline-none focus:ring-2 focus:ring-[#111111]" />
        )}
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
          <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Sección principal *</label>
          <select value={sectionId} onChange={(e) => { setSectionId(e.target.value); setSecondaryIds(prev => prev.filter(id => id !== e.target.value)) }}
            className="w-full px-3 py-2 border rounded-md font-cuerpo focus:outline-none focus:ring-2 focus:ring-[#111111]">
            {topLevel.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
            {grouped.map((g) => (
              <optgroup key={g.parent.id} label={g.parent.name}>
                {g.children.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Etiquetas</label>
          <TagInput value={tags} onChange={setTags} />
        </div>
      </div>

      {secondaryOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">
            Secciones secundarias <span className="text-gray-400 font-normal">(también aparece en)</span>
          </label>
          <div className="flex flex-wrap gap-3 mt-1">
            {secondaryOptions.map((s) => (
              <label key={s.id} className="flex items-center gap-1.5 text-sm font-cuerpo cursor-pointer">
                <input
                  type="checkbox"
                  checked={secondaryIds.includes(s.id)}
                  onChange={() => toggleSecondary(s.id)}
                  className="rounded"
                />
                {s.parent ? `${s.parent.name} > ${s.name}` : s.name}
              </label>
            ))}
          </div>
        </div>
      )}

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
          {saving
            ? (userRole === "EDITOR" ? "Enviando..." : "Publicando...")
            : (userRole === "EDITOR" ? "Enviar a revisión" : "Publicar")
          }
        </button>
        <button onClick={() => router.push("/admin")}
          className="px-4 py-2 text-sm font-cuerpo text-gray-500 hover:text-gray-700 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  )
}
