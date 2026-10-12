"use client"

import { useState, useRef } from "react"

type Props = {
  currentUrl?: string
  onUpload: (url: string) => void
}

export default function ImageUploader({ currentUrl, onUpload }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"file" | "url">("file")
  const [imageUrl, setImageUrl] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError("")

    // Check image dimensions before uploading
    const dimensions = await getImageDimensions(file)
    if (dimensions && dimensions.width < 400) {
      setError(
        `La imagen es muy chica (${dimensions.width}×${dimensions.height}px). Usá una foto de al menos 800px de ancho. Probá con "Pegar URL" para descargar la imagen en tamaño completo.`
      )
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al subir la imagen")
        return
      }
      setPreview(data.url)
      onUpload(data.url)
    } catch {
      setError("Error de conexión al subir la imagen")
    } finally {
      setUploading(false)
    }
  }

  async function handleUrlSubmit() {
    if (!imageUrl.trim()) return
    setError("")
    setUploading(true)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al descargar la imagen")
        return
      }
      setPreview(data.url)
      onUpload(data.url)
      setImageUrl("")
    } catch {
      setError("Error de conexión")
    } finally {
      setUploading(false)
    }
  }

  function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(null)
      }
      img.src = url
    })
  }

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`text-xs font-cuerpo px-2 py-1 rounded transition-colors ${
            mode === "file" ? "bg-negro text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          Subir archivo
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`text-xs font-cuerpo px-2 py-1 rounded transition-colors ${
            mode === "url" ? "bg-negro text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          Pegar URL
        </button>
      </div>

      {mode === "file" ? (
        <div
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            uploading ? "border-gray-300 bg-gray-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Vista previa" className="max-h-48 mx-auto rounded" />
              <p className="text-xs text-gray-500 mt-2 font-cuerpo">Hacé clic o arrastrá otra imagen para cambiarla</p>
            </div>
          ) : (
            <div className="py-8">
              <p className="text-gray-500 font-cuerpo">{uploading ? "Subiendo..." : "Arrastrá una imagen o hacé clic para seleccionar"}</p>
              <p className="text-xs text-gray-400 mt-1 font-cuerpo">JPG, PNG, WebP o GIF. Máximo 5MB.</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} className="hidden" />
        </div>
      ) : (
        <div className="space-y-2">
          {preview && (
            <div className="border rounded-lg p-2">
              <img src={preview} alt="Vista previa" className="max-h-48 mx-auto rounded" />
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlSubmit())}
              placeholder="https://ejemplo.com/foto.jpg"
              className="flex-1 border rounded-md px-3 py-2 font-cuerpo text-sm"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={uploading || !imageUrl.trim()}
              className="bg-negro text-white px-4 py-2 rounded-md text-sm font-cuerpo hover:bg-gray-800 disabled:opacity-50 transition-colors shrink-0"
            >
              {uploading ? "Bajando..." : "Descargar"}
            </button>
          </div>
          <p className="text-xs text-gray-400 font-cuerpo">
            Hacé clic derecho en la imagen → "Copiar dirección de imagen" y pegala acá. Se descarga en tamaño completo.
          </p>
        </div>
      )}
      {error && <p className="text-red-600 text-sm mt-2 font-cuerpo">{error}</p>}
    </div>
  )
}
