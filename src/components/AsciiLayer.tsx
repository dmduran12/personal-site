import { RefObject, useEffect, useRef } from 'react'

export function AsciiLayer({ target }: { target: RefObject<HTMLVideoElement> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = target.current
    if (!canvas || !video) return

    canvas.width = video.clientWidth
    canvas.height = video.clientHeight

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
    }
  }, [target])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />
}
