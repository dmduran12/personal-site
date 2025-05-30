import { useRef } from 'react'
import useSWR from 'swr'
import { AsciiLayer } from './AsciiLayer'

type VideoData = { src: string; width: number; height: number }

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function HeroMontage() {
  const { data, error } = useSWR<VideoData>(
    '/api/vimeo-file?id=' + import.meta.env.VITE_VIMEO_RIP_URL,
    fetcher
  )
  const videoRef = useRef<HTMLVideoElement>(null)

  if (error) {
    return (
      <div className="p-4 text-red-500">Failed to load video</div>
    )
  }

  return (
    <section className="fixed inset-0 overflow-hidden">
      <video
        ref={videoRef}
        src={data?.src}
        autoPlay
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <AsciiLayer target={videoRef} />
      <div className="relative z-10 p-6 text-white mix-blend-difference">
        <h1 className="text-4xl font-bold">Danny Duran — Creative Director</h1>
      </div>
    </section>
  )
}
