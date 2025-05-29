import { RefObject, useEffect, useRef } from 'react'

export function AsciiLayer({ target }: { target: RefObject<HTMLVideoElement> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const worker = new Worker(new URL('../workers/asciiWorker.ts', import.meta.url), { type: 'module' })
    let raf: number

    function loop() {
      const video = target.current
      const canvas = canvasRef.current
      if (video && canvas) worker.postMessage({ video, canvas })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [target])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}
