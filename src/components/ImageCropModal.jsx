import { useEffect, useRef, useState } from 'react'
import { ZoomIn, ZoomOut } from 'lucide-react'

import Button from './Button'
import Modal from './Modal'
import { clampCrop, cropSide, cropToDataUrl, drawCrop } from '../utils/image'

const VIEWPORT_SIDE = 260 // Keep in sync with size-[260px] below.
const PREVIEW_PIXELS = VIEWPORT_SIDE * 2 // Stays sharp on high-density screens.
const MAX_ZOOM = 3
const KEYBOARD_STEP = 10

const ARROW_KEYS = {
  ArrowLeft: [KEYBOARD_STEP, 0],
  ArrowRight: [-KEYBOARD_STEP, 0],
  ArrowUp: [0, KEYBOARD_STEP],
  ArrowDown: [0, -KEYBOARD_STEP],
}

/** Drag and zoom a photo inside a circle or square frame, then get back the cropped image as a data URL. */
export default function ImageCropModal({ file, shape = 'square', outputSide, onCancel, onCrop }) {
  const canvasRef = useRef(null)
  const dragRef = useRef(null)
  const [image, setImage] = useState(null)
  const [crop, setCrop] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let loaded = null
    createImageBitmap(file)
      .then((bitmap) => {
        if (cancelled) {
          bitmap.close()
          return
        }
        loaded = bitmap
        setImage(bitmap)
        setCrop({ zoom: 1, x: bitmap.width / 2, y: bitmap.height / 2 })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
      loaded?.close()
    }
  }, [file])

  useEffect(() => {
    if (image && crop) drawCrop(canvasRef.current.getContext('2d'), image, crop, PREVIEW_PIXELS)
  }, [image, crop])

  /** Moves the photo by a distance in screen pixels; the crop centre moves the opposite way. */
  const pan = (deltaX, deltaY) => {
    if (!image) return
    setCrop((current) => {
      const imagePixelsPerScreenPixel = cropSide(current.zoom, image.width, image.height) / VIEWPORT_SIDE
      return clampCrop(
        {
          zoom: current.zoom,
          x: current.x - deltaX * imagePixelsPerScreenPixel,
          y: current.y - deltaY * imagePixelsPerScreenPixel,
        },
        image.width,
        image.height,
      )
    })
  }

  const startDrag = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { x: event.clientX, y: event.clientY }
  }

  const drag = (event) => {
    if (!dragRef.current) return
    pan(event.clientX - dragRef.current.x, event.clientY - dragRef.current.y)
    dragRef.current = { x: event.clientX, y: event.clientY }
  }

  const endDrag = () => {
    dragRef.current = null
  }

  const handleKeyDown = (event) => {
    const delta = ARROW_KEYS[event.key]
    if (!delta) return
    event.preventDefault()
    pan(delta[0], delta[1])
  }

  const changeZoom = (event) => {
    const zoom = Number(event.target.value)
    setCrop((current) => clampCrop({ ...current, zoom }, image.width, image.height))
  }

  return (
    <Modal
      open
      onClose={onCancel}
      size="sm"
      title="Crop image"
      description="Drag to reposition, and use the slider to zoom."
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={!image} onClick={() => onCrop(cropToDataUrl(image, crop, outputSide))}>
            Apply
          </Button>
        </>
      }
    >
      {failed ? (
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
          Couldn’t read that image. Try another.
        </p>
      ) : (
        <>
          <div className="relative mx-auto size-[260px] overflow-hidden rounded-lg bg-cream-200 dark:bg-white/5">
            <canvas
              ref={canvasRef}
              width={PREVIEW_PIXELS}
              height={PREVIEW_PIXELS}
              tabIndex={0}
              aria-label="Image position. Drag, or use the arrow keys, to reposition."
              className="size-full cursor-grab touch-none active:cursor-grabbing"
              onPointerDown={startDrag}
              onPointerMove={drag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={handleKeyDown}
            />
            <div
              className={`pointer-events-none absolute inset-0 ring-2 ring-white/90 ring-inset ${
                shape === 'circle' ? 'rounded-full shadow-[0_0_0_200px_rgb(0_0_0/0.55)]' : 'rounded-lg'
              }`}
              aria-hidden="true"
            />
          </div>
          <div className="mx-auto mt-4 flex w-[260px] items-center gap-3 text-espresso-500 dark:text-cream-300/80">
            <ZoomOut className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <input
              type="range"
              min="1"
              max={MAX_ZOOM}
              step="0.01"
              value={crop?.zoom ?? 1}
              onChange={changeZoom}
              disabled={!image}
              aria-label="Zoom"
              className="w-full accent-roast-500"
            />
            <ZoomIn className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          </div>
        </>
      )}
    </Modal>
  )
}
