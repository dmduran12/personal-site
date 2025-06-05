import { RefObject, useEffect, useRef, MutableRefObject } from 'react'

function startHalftone(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  sizeRef: MutableRefObject<{ w: number; h: number }>
) {
  canvas.width = video.videoWidth || video.clientWidth
  canvas.height = video.videoHeight || video.clientHeight
  const ctx = canvas.getContext('2d')!
  const lineColor = '#f8f8f5'
  const bgColor = '#1a1a1a'
  let prevW = sizeRef.current.w
  let prevH = sizeRef.current.h
  let raf: number

  const draw = () => {
    const { w: cellW, h: cellH } = sizeRef.current
    if (cellW !== prevW || cellH !== prevH) {
      prevW = cellW
      prevH = cellH
    }
    const cols = Math.floor(canvas.width / cellW)
    const rows = Math.floor(canvas.height / cellH)

    ctx.drawImage(video, 0, 0, cols, rows)
    const data = ctx.getImageData(0, 0, cols, rows).data

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = lineColor

    let i = 0
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const lum = r * 0.2126 + g * 0.7152 + b * 0.0722
        const lineH = (lum / 255) * cellH
        if (lineH > 0) {
          const xPos = x * cellW
          const yPos = y * cellH + (cellH - lineH) / 2
          ctx.fillRect(xPos, yPos, cellW, lineH)
        }
        i += 4
      }
    }

    raf = requestAnimationFrame(draw)
  }

  draw()
  return () => cancelAnimationFrame(raf)
}

export function HalftoneLayer({
  target,
  ready,
  sizeRef,
  onError
}: {
  target: RefObject<HTMLVideoElement>
  ready: boolean
  sizeRef: MutableRefObject<{ w: number; h: number }>
  onError?: (msg: string | null) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = target.current
    if (!canvas || !video || !ready) return

    let cleanup: (() => void) | undefined

    const start = () => {
      cleanup = startHalftone(canvas, video, sizeRef)
      onError?.(null)
    }

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      start()
    } else {
      video.addEventListener('loadeddata', start, { once: true })
    }

    return () => {
      video.removeEventListener('loadeddata', start)
      cleanup?.()
    }
  }, [target, ready, sizeRef])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full object-cover pointer-events-none"
    />
  )
}
