import { RefObject, useEffect, useRef } from 'react'

export function AsciiLayer({
  target,
  ready
}: {
  target: RefObject<HTMLVideoElement>
  ready: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = target.current
    if (!canvas || !video || !ready) return

    canvas.width = video.clientWidth
    canvas.height = video.clientHeight

    const offscreen = canvas.transferControlToOffscreen()
    const worker = new Worker(
      new URL('../workers/asciiWorker.ts', import.meta.url),
      { type: 'module' }
    )
    worker.postMessage({ canvas: offscreen }, [offscreen])

    let raf: number
    async function loop() {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const frame = await createImageBitmap(video)
        worker.postMessage({ frame }, [frame])
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      worker.terminate()
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
