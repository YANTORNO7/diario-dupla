import sharp from "sharp"

export async function optimizeImage(
  buffer: Buffer,
  options?: { maxWidth?: number; quality?: number }
): Promise<{ data: Buffer; width: number; height: number; format: string }> {
  const maxWidth = options?.maxWidth || 1920
  const quality = options?.quality || 90

  // Use separate sharp instance for metadata to avoid consuming the buffer
  const metadata = await sharp(buffer).metadata()

  const origWidth = metadata.width || 0
  const origHeight = metadata.height || 0

  console.log(`[image] Original: ${origWidth}x${origHeight}, buffer: ${buffer.length} bytes`)

  // If image is already small, just convert to webp without resizing
  if (origWidth <= maxWidth) {
    const optimized = await sharp(buffer)
      .webp({ quality })
      .toBuffer()

    const outMeta = await sharp(optimized).metadata()
    console.log(`[image] Output: ${outMeta.width}x${outMeta.height}, ${optimized.length} bytes`)

    return {
      data: optimized,
      width: outMeta.width || origWidth,
      height: outMeta.height || origHeight,
      format: "webp",
    }
  }

  // Resize large images
  const ratio = maxWidth / origWidth
  const newHeight = Math.round(origHeight * ratio)

  const optimized = await sharp(buffer)
    .resize(maxWidth, newHeight, { fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toBuffer()

  const outMeta = await sharp(optimized).metadata()
  console.log(`[image] Output: ${outMeta.width}x${outMeta.height}, ${optimized.length} bytes`)

  return {
    data: optimized,
    width: outMeta.width || maxWidth,
    height: outMeta.height || newHeight,
    format: "webp",
  }
}
