export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
// Images are stored in the persisted demo state and localStorage only holds about 5 MB, so keep them small.
const DEFAULT_OUTPUT_SIDE = 240

/** Returns an error message if this file can't be used as an image, otherwise null. */
export function imageFileError(file) {
  if (!IMAGE_TYPES.includes(file.type)) return 'Use a PNG, JPG or WebP image.'
  if (file.size > MAX_IMAGE_BYTES) return 'Use an image under 10 MB.'
  return null
}

/** Side of the square crop in image pixels. Zoom 1 is the largest square that fits the image. */
export const cropSide = (zoom, width, height) => Math.min(width, height) / zoom

/** Keeps the crop, given by its zoom and centre point (x, y), fully inside the image. */
export function clampCrop(crop, width, height) {
  const half = cropSide(crop.zoom, width, height) / 2
  return {
    zoom: crop.zoom,
    x: Math.min(Math.max(crop.x, half), width - half),
    y: Math.min(Math.max(crop.y, half), height - half),
  }
}

/** Draws the cropped area filling a square canvas. The preview and the saved image both use this. */
export function drawCrop(context, image, crop, outputSide) {
  const side = cropSide(crop.zoom, image.width, image.height)
  // JPEG has no transparency; without this, transparent PNGs turn black.
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, outputSide, outputSide)
  context.drawImage(image, crop.x - side / 2, crop.y - side / 2, side, side, 0, 0, outputSide, outputSide)
}

/** Renders the crop to a small square JPEG data URL. */
export function cropToDataUrl(image, crop, outputSide = DEFAULT_OUTPUT_SIDE) {
  const canvas = document.createElement('canvas')
  canvas.width = outputSide
  canvas.height = outputSide
  drawCrop(canvas.getContext('2d'), image, crop, outputSide)
  return canvas.toDataURL('image/jpeg', 0.8)
}
