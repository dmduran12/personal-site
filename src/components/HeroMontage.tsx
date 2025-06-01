import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { AsciiLayer } from './AsciiLayer'

type VideoData = { src: string; width: number; height: number }

const API_BASE = import.meta.env.VITE_API_BASE || ''

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const type = res.headers.get('content-type') || ''
  const isJson = type.includes('application/json') || type.includes('+json')
  if (!res.ok || !isJson) {
    const text = await res.text().catch(() => '')
    const message = !res.ok
      ? `HTTP ${res.status}: ${text}`
      : `Unexpected content-type ${type}`
    throw new Error(message)
  }
  return res.json()
}

const VIMEO_ID = import.meta.env.VITE_VIMEO_VIDEO_ID

export function HeroMontage() {
  const { data, error } = useSWR<VideoData>(
    `${API_BASE}/api/vimeo-file?id=${VIMEO_ID}`,
    fetcher,
    {
      onError: err => console.error('Vimeo fetch error:', err),
      revalidateOnFocus: false,
      shouldRetryOnError: false
    }
  )
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const handleError = () => {
      console.error('Video element error', video.error)
      setVideoError('Failed to play video')
    }
    const handleLoaded = () => {
      console.log('Video loaded')
      setVideoError(null)
    }
    video.addEventListener('error', handleError)
    video.addEventListener('loadeddata', handleLoaded)
    return () => {
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadeddata', handleLoaded)
    }
  }, [data])

  if (error || videoError) {
    return (
      <div className="p-4 text-red-500">
        {error ? error.message : videoError}
      </div>
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
    </section>
  )
}
