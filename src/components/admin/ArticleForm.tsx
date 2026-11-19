"use client"

import { useState, useEffect, useCallback } from "react"
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
  publishedAt?: Date | string | null
  updatedAt?: Date | string | null
  tags: { name: string }[]
  secondarySections?: { id: string }[]
  rejectionNote?: string | null
}

export default function ArticleForm({
  article,
  authorName,
  sections,
  userRole = "ADMIN",
}: {
  article?: Article
  authorName: string
  sections: SectionOption[]
  userRole?: string
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
  const [secondaryIds, setSecondaryIds] = useState<string[]>(
    article?.secondarySections?.map((s) => s.id) || []
  )
  const [pubDate, setPubDate] = useState(() =>
    article?.publishedAt ? new Date(article.publishedAt).toISOString().slice(0, 10) : ""
  )
  const [activeTab, setActiveTab] = useState<"es" | "pt">("es")
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
      authorName: author.trim() || undefined,
      ...(userRole === "ADMIN" && pubDate && { publishedAt: pubDate }),
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
      {/* ── Tab selector: only show when editing an existing article ── */}
      {article && (
        <div className="flex gap-1 border-b">
          <button
            onClick={() => setActiveTab("es")}
            className={`px-4 py-2 text-sm font-cuerpo transition-colors ${
              activeTab === "es"
                ? "border-b-2 border-[#111111] font-semibold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Español
          </button>
          <button
            onClick={() => setActiveTab("pt")}
            className={`px-4 py-2 text-sm font-cuerpo transition-colors ${
              activeTab === "pt"
                ? "border-b-2 border-green-600 font-semibold text-green-700"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Português
          </button>
        </div>
      )}

      {/* ── Aba PT ───────────────────────────────────────────────────── */}
      {activeTab === "pt" && article && (
        <PtTab articleId={article.id} articleUpdatedAt={article.updatedAt} />
      )}

      {/* ── Aba ES (always rendered to preserve form state) ──────────── */}
      <div className={activeTab !== "es" ? "hidden" : ""}>

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
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nombre del autor"
          className="w-full px-3 py-2 border rounded-md font-cuerpo focus:outline-none focus:ring-2 focus:ring-[#111111]" />
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

      {userRole === "ADMIN" && article && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Fecha de publicación</label>
          <input
            type="date"
            value={pubDate}
            onChange={(e) => setPubDate(e.target.value)}
            className="px-3 py-2 border rounded-md font-cuerpo focus:outline-none focus:ring-2 focus:ring-[#111111]"
          />
          <p className="text-xs text-gray-400 mt-1 font-cuerpo">Cambiá la fecha para que aparezca en el orden correcto en la portada.</p>
        </div>
      )}

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

      </div> {/* end ES tab wrapper */}
    </div>
  )
}

// ─── PT Tab ───────────────────────────────────────────────────────────────────

type Translation = {
  id: string
  titlePt: string
  subtitlePt: string | null
  bodyPt: string
  slugPt: string
  metaTitlePt: string | null
  metaDescPt: string | null
  heroAltPt: string | null
  status: string
  translatedAt: string
  updatedAt: string
}

function StatusBadge({ status }: { status: string }) {
  if (status === "REVIEWED") return (
    <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-cuerpo">Revisada ✓</span>
  )
  if (status === "REVIEW") return (
    <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 font-cuerpo">Revisar ⚠</span>
  )
  return (
    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-cuerpo">Automática</span>
  )
}

function PtTab({ articleId, articleUpdatedAt }: { articleId: string; articleUpdatedAt?: Date | string | null }) {
  const [translation, setTranslation] = useState<Translation | null>(null)
  const [loading, setLoading]         = useState(true)
  const [translating, setTranslating] = useState(false)
  const [saving, setSaving]           = useState(false)
  const [msg, setMsg]                 = useState("")

  // Editable fields
  const [titlePt, setTitlePt]       = useState("")
  const [subtitlePt, setSubtitlePt] = useState("")
  const [bodyPt, setBodyPt]         = useState("")
  const [slugPt, setSlugPt]         = useState("")
  const [metaTitlePt, setMetaTitlePt] = useState("")
  const [metaDescPt, setMetaDescPt]   = useState("")

  const loadTranslation = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/translation/${articleId}`)
    if (res.ok) {
      const t: Translation = await res.json()
      setTranslation(t)
      setTitlePt(t.titlePt)
      setSubtitlePt(t.subtitlePt ?? "")
      setBodyPt(t.bodyPt)
      setSlugPt(t.slugPt)
      setMetaTitlePt(t.metaTitlePt ?? "")
      setMetaDescPt(t.metaDescPt ?? "")
    } else {
      setTranslation(null)
    }
    setLoading(false)
  }, [articleId])

  useEffect(() => { loadTranslation() }, [loadTranslation])

  async function handleTranslate(force = false) {
    setTranslating(true); setMsg("")
    const res = await fetch("/api/admin/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, force }),
    })
    const data = await res.json()
    if (res.ok && !data.skipped) {
      await loadTranslation()
      setMsg(`Traducido (${data.charsUsed?.toLocaleString()} chars)`)
    } else if (data.skipped) {
      setMsg("Ya tiene traducción. Usa 'Volver a traducir' para regenerar.")
    } else {
      setMsg(data.error || "Error al traducir")
    }
    setTranslating(false)
    setTimeout(() => setMsg(""), 5000)
  }

  async function handleSave() {
    if (!translation) return
    setSaving(true); setMsg("")
    const res = await fetch(`/api/admin/translation/${articleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titlePt, subtitlePt: subtitlePt || null, bodyPt, slugPt, metaTitlePt: metaTitlePt || null, metaDescPt: metaDescPt || null }),
    })
    if (res.ok) {
      await loadTranslation()
      setMsg("Traducción guardada")
    } else {
      const d = await res.json()
      setMsg(d.error || "Error al guardar")
    }
    setSaving(false)
    setTimeout(() => setMsg(""), 4000)
  }

  async function markReviewed() {
    if (!translation) return
    const res = await fetch(`/api/admin/translation/${articleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REVIEWED" }),
    })
    if (res.ok) { await loadTranslation(); setMsg("Estado actualizado a Revisada") }
    setTimeout(() => setMsg(""), 3000)
  }

  if (loading) return <p className="text-sm text-gray-400 font-cuerpo py-4">Cargando traducción…</p>

  // Check if ES was edited after last translation
  const isStale =
    translation &&
    articleUpdatedAt &&
    new Date(articleUpdatedAt) > new Date(translation.translatedAt)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        {translation && <StatusBadge status={translation.status} />}
        {translation && (
          <span className="text-xs text-gray-400 font-cuerpo">
            Traducido: {new Date(translation.translatedAt).toLocaleString("es-AR")}
          </span>
        )}
        {msg && <span className="text-sm font-cuerpo text-green-600">{msg}</span>}
      </div>

      {/* Stale warning */}
      {isStale && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded text-sm font-cuerpo">
          ⚠ El artículo en español fue editado después de la última traducción. Conviene volver a traducir.
        </div>
      )}

      {/* No translation yet */}
      {!translation && (
        <div className="bg-gray-50 border rounded p-6 text-center space-y-3">
          <p className="text-sm text-gray-500 font-cuerpo">Este artículo no tiene versión en portugués todavía.</p>
          <button
            onClick={() => handleTranslate(false)}
            disabled={translating}
            className="px-4 py-2 bg-green-600 text-white rounded text-sm font-cuerpo hover:bg-green-700 disabled:opacity-50"
          >
            {translating ? "Traduciendo…" : "Traducir ahora"}
          </button>
        </div>
      )}

      {/* Translation fields */}
      {translation && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Título PT</label>
            <input value={titlePt} onChange={(e) => setTitlePt(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-lg font-titular focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Bajada PT</label>
            <input value={subtitlePt} onChange={(e) => setSubtitlePt(e.target.value)}
              className="w-full px-3 py-2 border rounded-md font-cuerpo focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Cuerpo PT</label>
            <textarea value={bodyPt} onChange={(e) => setBodyPt(e.target.value)} rows={12}
              className="w-full px-3 py-2 border rounded-md font-cuerpo text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Slug PT</label>
              <input value={slugPt} onChange={(e) => setSlugPt(e.target.value)}
                className="w-full px-3 py-2 border rounded-md font-cuerpo text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Meta título PT</label>
              <input value={metaTitlePt} onChange={(e) => setMetaTitlePt(e.target.value)}
                className="w-full px-3 py-2 border rounded-md font-cuerpo text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-cuerpo">Meta descripción PT</label>
            <input value={metaDescPt} onChange={(e) => setMetaDescPt(e.target.value)}
              className="w-full px-3 py-2 border rounded-md font-cuerpo text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm font-cuerpo hover:bg-green-700 disabled:opacity-50">
              {saving ? "Guardando…" : "Guardar traducción"}
            </button>
            <button onClick={() => handleTranslate(true)} disabled={translating}
              className="px-4 py-2 border border-gray-300 rounded text-sm font-cuerpo hover:bg-gray-50 disabled:opacity-50">
              {translating ? "Traduciendo…" : "Volver a traducir"}
            </button>
            {translation.status !== "REVIEWED" && (
              <button onClick={markReviewed}
                className="px-4 py-2 border border-green-300 text-green-700 rounded text-sm font-cuerpo hover:bg-green-50">
                Marcar como revisada
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
