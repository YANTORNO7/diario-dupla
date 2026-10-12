import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth-guard"
import { optimizeImage } from "@/lib/image"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  const session = await requireAuthAPI()
  if (session instanceof NextResponse) return session

  const contentType = request.headers.get("content-type") || ""

  // Handle JSON body (URL download)
  if (contentType.includes("application/json")) {
    return handleUrlDownload(request)
  }

  // Handle FormData (file upload)
  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json(
      { error: "No se envió ningún archivo" },
      { status: 400 }
    )
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido. Usá JPG, PNG, WebP, GIF o SVG." },
      { status: 400 }
    )
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "El archivo es demasiado grande. Máximo 5MB." },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const skipOptimize = formData.get("skipOptimize") === "true"

  return saveImage(buffer, file.type, skipOptimize)
}

async function handleUrlDownload(request: NextRequest) {
  const { url: imageUrl } = await request.json()

  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 })
  }

  try {
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      },
      redirect: "follow",
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `No se pudo descargar la imagen (HTTP ${res.status})` },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get("content-type") || ""

    // Detect image type from content-type header, URL extension, or magic bytes
    let detectedType = ""
    if (contentType.startsWith("image/")) {
      detectedType = contentType.split(";")[0]
    } else {
      // Check URL extension
      const urlPath = new URL(imageUrl).pathname.toLowerCase()
      if (urlPath.endsWith(".jpg") || urlPath.endsWith(".jpeg")) detectedType = "image/jpeg"
      else if (urlPath.endsWith(".png")) detectedType = "image/png"
      else if (urlPath.endsWith(".webp")) detectedType = "image/webp"
      else if (urlPath.endsWith(".gif")) detectedType = "image/gif"
      else if (urlPath.endsWith(".svg")) detectedType = "image/svg+xml"
    }

    // If still unknown, check magic bytes
    // If still unknown, check magic bytes
    if (!detectedType && buffer.length > 4) {
      const head = buffer.subarray(0, 12)
      if (head[0] === 0xFF && head[1] === 0xD8) detectedType = "image/jpeg"
      else if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47) detectedType = "image/png"
      else if (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46) detectedType = "image/webp"
      else if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) detectedType = "image/gif"
    }

    // If we got HTML, try to extract og:image from the page
    if (!detectedType && contentType.includes("text/html")) {
      const html = buffer.toString("utf-8")
      const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)

      if (ogMatch?.[1]) {
        let ogUrl = ogMatch[1]
        // Handle relative URLs
        if (ogUrl.startsWith("/")) {
          const base = new URL(imageUrl)
          ogUrl = `${base.protocol}//${base.host}${ogUrl}`
        }
        console.log(`[image] HTML page detected, found og:image: ${ogUrl}`)

        // Download the actual image from og:image
        const imgRes = await fetch(ogUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
          },
          redirect: "follow",
        })

        if (imgRes.ok) {
          const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
          const imgContentType = imgRes.headers.get("content-type") || ""
          let imgType = ""

          if (imgContentType.startsWith("image/")) {
            imgType = imgContentType.split(";")[0]
          } else {
            // Detect from magic bytes
            const h = imgBuffer.subarray(0, 12)
            if (h[0] === 0xFF && h[1] === 0xD8) imgType = "image/jpeg"
            else if (h[0] === 0x89 && h[1] === 0x50 && h[2] === 0x4E && h[3] === 0x47) imgType = "image/png"
            else if (h[0] === 0x52 && h[1] === 0x49 && h[2] === 0x46 && h[3] === 0x46) imgType = "image/webp"
            else if (h[0] === 0x47 && h[1] === 0x49 && h[2] === 0x46) imgType = "image/gif"
          }

          if (imgType && imgBuffer.length > 0) {
            console.log(`[image] og:image downloaded: ${imgBuffer.length} bytes, type: ${imgType}`)
            if (imgBuffer.length > 10 * 1024 * 1024) {
              return NextResponse.json({ error: "La imagen es demasiado grande. Máximo 10MB." }, { status: 400 })
            }
            return saveImage(imgBuffer, imgType, false)
          }
        }
      }

      console.log(`[image] URL download: got HTML page, no og:image found. Content-Type: ${contentType}`)
      return NextResponse.json(
        { error: "Esa URL es una página web, no una imagen. Hacé clic derecho en la imagen → 'Copiar dirección de imagen' y pegá esa URL." },
        { status: 400 }
      )
    }

    if (!detectedType) {
      console.log(`[image] URL download: could not detect image type. Content-Type: ${contentType}, size: ${buffer.length}`)
      return NextResponse.json(
        { error: "No se pudo detectar el tipo de imagen. Probá descargar la imagen primero y subirla como archivo." },
        { status: 400 }
      )
    }

    console.log(`[image] Downloaded from URL: ${buffer.length} bytes, detected: ${detectedType}, header: ${contentType}`)

    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande. Máximo 10MB." },
        { status: 400 }
      )
    }

    return saveImage(buffer, detectedType, false)
  } catch (err) {
    console.error("[image] URL download error:", err)
    return NextResponse.json(
      { error: "Error al descargar la imagen. Verificá que la URL sea correcta." },
      { status: 400 }
    )
  }
}

async function saveImage(buffer: Buffer, mimeType: string, skipOptimize: boolean) {
  let fileData: Buffer
  let width: number | null = null
  let height: number | null = null
  let ext: string

  if (mimeType === "image/svg+xml" || skipOptimize) {
    fileData = buffer
    ext = mimeType === "image/svg+xml" ? "svg" : "png"
  } else {
    const optimized = await optimizeImage(buffer)
    fileData = optimized.data
    width = optimized.width
    height = optimized.height
    ext = "webp"
    mimeType = "image/webp"
  }

  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
  let url: string

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Production: use Vercel Blob
    const blob = await put(filename, fileData, {
      access: "public",
      contentType: mimeType,
    })
    url = blob.url
  } else {
    // Development: save to local filesystem
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })
    await writeFile(path.join(uploadsDir, filename), fileData)
    url = `/uploads/${filename}`
  }

  const image = await prisma.image.create({
    data: {
      url,
      filename,
      width,
      height,
      sizeBytes: fileData.length,
      mimeType,
    },
  })

  return NextResponse.json({ url: image.url, id: image.id }, { status: 201 })
}
