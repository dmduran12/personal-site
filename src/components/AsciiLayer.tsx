import { RefObject, useEffect, useRef } from 'react'
function startFallback(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  canvas.width = video.videoWidth || video.clientWidth
  canvas.height = video.videoHeight || video.clientHeight
  const ctx = canvas.getContext('2d')!
  const ascii = '$#WMN8HAE69CFY+?'
  const cellW = 6
  const cellH = 8
  ctx.font = '700 10px/8px "SF Mono", "IBM Plex Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let raf: number
  const draw = () => {
    const cols = Math.floor(canvas.width / cellW)
    const rows = Math.floor(canvas.height / cellH)
    ctx.drawImage(video, 0, 0, cols, rows)
    const data = ctx.getImageData(0, 0, cols, rows).data
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const lum = r * 0.2126 + g * 0.7152 + b * 0.0722
        const index = Math.min(ascii.length - 1, Math.floor(lum / 255 * (ascii.length - 1)))
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillText(ascii[index], x * cellW + cellW / 2, y * cellH + cellH / 2)
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
      canvas.width = video.videoWidth || video.clientWidth
      canvas.height = video.videoHeight || video.clientHeight

      if (!('transferControlToOffscreen' in canvas) ||
          typeof OffscreenCanvas === 'undefined' ||
          !('WebGL2RenderingContext' in window)) {
        onError?.(null)
        cleanup = startFallback(canvas, video)
        return
      }

      const offscreen = canvas.transferControlToOffscreen()
      const worker = new Worker(
        new URL('../workers/asciiWorker.ts', import.meta.url),
        { type: 'module' }
      )
      const handleWorker = (e: MessageEvent) => {
        if (e.data?.error && typeof e.data.error === 'string') {
          onError?.(e.data.error)
        }
      }
      worker.addEventListener('message', handleWorker)
      worker.postMessage({ canvas: offscreen }, [offscreen])
      onError?.(null)

      let raf: number
      async function loop() {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          const frame = await createImageBitmap(video)
          worker.postMessage({ frame }, [frame])
        }
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)

      cleanup = () => {
        cancelAnimationFrame(raf)
        worker.removeEventListener('message', handleWorker)
        worker.terminate()
      }
    }

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      start()
    } else {
      video.addEventListener('loadeddata', start, { once: true })
    }

    return () => {
      video.removeEventListener('loadeddata', start)
      cleanup?.()
      if (canvas.parentNode) {
        const clone = canvas.cloneNode(false) as HTMLCanvasElement
        clone.className = canvas.className
        canvas.parentNode.replaceChild(clone, canvas)
        canvasRef.current = clone
      }
    }
  }, [target, ready])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full object-cover pointer-events-none"
    />
  )
}
