import { RefObject, useEffect, useRef } from 'react'

export function AsciiLayer({ target }: { target: RefObject<HTMLVideoElement> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = target.current
    if (!canvas || !video) return

    const resize = () => {
      canvas.width = video.clientWidth
      canvas.height = video.clientHeight
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(video)

    const offscreen = canvas.transferControlToOffscreen()
    const worker = new Worker(new URL('../workers/asciiWorker.ts', import.meta.url), { type: 'module' })
    worker.postMessage({ canvas: offscreen }, [offscreen])

    let raf: number
    async function loop() {
      const frame = await createImageBitmap(video)
      worker.postMessage({ frame }, [frame])
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      worker.terminate()
      observer.disconnect()
    }
  }, [target])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />
}
