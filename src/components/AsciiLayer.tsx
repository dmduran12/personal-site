import { RefObject, useEffect, useRef } from 'react'

function rgbToHsl(r: number, g: number, b: number) {
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rr:
        h = (gg - bb) / d + (gg < bb ? 6 : 0)
        break
      case gg:
        h = (bb - rr) / d + 2
        break
      default:
        h = (rr - gg) / d + 4
    }
    h /= 6
  }
  return [h * 360, s, l]
}

function startAscii(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  canvas.width = video.videoWidth || video.clientWidth
  canvas.height = video.videoHeight || video.clientHeight
  const ctx = canvas.getContext('2d')!
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const charCount = alphabet.length
  const shadows = ' .:-=+*#%@'
  // decrease grid spacing by 50%
  const cellW = 6
  const cellH = 8
  // base font for ASCII grid - one step down the type scale
  ctx.font = '400 24px/16px "Micro 5", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let raf: number

  const lines = ['DANNY', 'DURAN']
  // tighten spacing around the overlay text
  const charScale = 5.6
  const lineScale = 5
  let bounds: { x: number; y: number; w: number; h: number } | null = null

  const draw = () => {
    // ensure base font for ASCII grid
    ctx.font = '400 24px/16px "Micro 5", sans-serif'
    const cols = Math.floor(canvas.width / cellW)
    const rows = Math.floor(canvas.height / cellH)

    if (!bounds) {
      const textCols = Math.max(...lines.map(l => l.length)) * charScale
      const textRows = lines.length * lineScale
      const startCol = Math.floor((cols - textCols) / 2)
      const startRow = Math.floor((rows - textRows) / 2)
      bounds = { x: startCol, y: startRow, w: textCols, h: textRows }
    }

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
        const [hue, sat] = rgbToHsl(r, g, b)
        const satPct = Math.round(sat * 100)
        const lumNorm = lum / 255
        const lumPct = Math.round(lumNorm * 100)
        ctx.fillStyle = `hsl(${hue} ${satPct}% ${lumPct}%)`
        if (
          x >= bounds.x &&
          x < bounds.x + bounds.w &&
          y >= bounds.y &&
          y < bounds.y + bounds.h
        ) {
          // skip cells under the overlay text
        } else if (lumNorm > 0.95) {
          ctx.fillText('+', x * cellW + cellW / 2, y * cellH + cellH / 2)
        } else if (lumNorm < 0.1) {
          const idx = Math.floor((lumNorm / 0.1) * (shadows.length - 1))
          ctx.fillText(shadows[idx], x * cellW + cellW / 2, y * cellH + cellH / 2)
        } else {
          const idx = Math.floor((hue / 360) * charCount)
          ctx.fillText(alphabet[idx], x * cellW + cellW / 2, y * cellH + cellH / 2)
        }
        i += 4
      }
    }

    // draw the static overlay text
    const overlayFont = `800 ${24 * charScale}px/${16 * lineScale}px "Micro 5", sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.font = overlayFont
    lines.forEach((line, rowIndex) => {
      for (let iChar = 0; iChar < line.length; iChar++) {
        const ch = line[iChar]
        const xPos = (bounds!.x + iChar * charScale + charScale / 2) * cellW
        const yPos = (bounds!.y + rowIndex * lineScale + lineScale / 2) * cellH
        ctx.fillText(ch, xPos, yPos)
      }
    })


    // reset font for next frame
    ctx.font = '400 24px/16px "Micro 5", sans-serif'

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
