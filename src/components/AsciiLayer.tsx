import { RefObject, useEffect, useRef } from 'react'

function startAscii(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  canvas.width = video.videoWidth || video.clientWidth
  canvas.height = video.videoHeight || video.clientHeight
  const ctx = canvas.getContext('2d')!
  const chars = ' .:-=+*#%@'
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
        const idx = Math.floor((lum / 255) * (chars.length - 1))
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillText(chars[idx], x * cellW + cellW / 2, y * cellH + cellH / 2)
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
