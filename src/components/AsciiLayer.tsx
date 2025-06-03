import { RefObject, useEffect, useRef } from 'react'

function rgbToHue(r: number, g: number, b: number) {
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  if (max === min) return 0
  let h = 0
  if (max === rr) h = (gg - bb) / (max - min)
  else if (max === gg) h = 2 + (bb - rr) / (max - min)
  else h = 4 + (rr - gg) / (max - min)
  h *= 60
  if (h < 0) h += 360
  return h
}

function startAscii(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  canvas.width = video.videoWidth || video.clientWidth
  canvas.height = video.videoHeight || video.clientHeight
  const ctx = canvas.getContext('2d')!
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const charCount = alphabet.length
  const cellW = 6
  const cellH = 8
  ctx.font = '400 10px/8px "Micro 5", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let raf: number

  const draw = () => {
    const cols = Math.floor(canvas.width / cellW)
    const rows = Math.floor(canvas.height / cellH)
    ctx.drawImage(video, 0, 0, cols, rows)
    const data = ctx.getImageData(0, 0, cols, rows).data
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let i = 0
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const lum = r * 0.2126 + g * 0.7152 + b * 0.0722
        const hue = rgbToHue(r, g, b)
        if (lum > 0.95 * 255) {
          ctx.fillStyle = `hsl(${hue} 90% 55%)`
          ctx.fillText('+', x * cellW + cellW / 2, y * cellH + cellH / 2)
        } else {
          const idx = Math.floor((hue / 360) * charCount)
          ctx.fillStyle = `hsl(${hue} 90% 50%)`
          ctx.fillText(alphabet[idx], x * cellW + cellW / 2, y * cellH + cellH / 2)
        }
        i += 4
      }
    }

    raf = requestAnimationFrame(draw)
  }

  draw()
  return () => cancelAnimationFrame(raf)
}

export function AsciiLayer({
  target,
  ready,
  onError
}: {
  target: RefObject<HTMLVideoElement>
  ready: boolean
  onError?: (msg: string | null) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = target.current
    if (!canvas || !video || !ready) return

    let cleanup: (() => void) | undefined

    const start = () => {
      cleanup = startAscii(canvas, video)
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
  }, [target, ready])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full object-cover pointer-events-none"
    />
  )
}
