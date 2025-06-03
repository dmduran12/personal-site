import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { AsciiLayer } from './AsciiLayer'

type VideoData = { src: string; width: number; height: number }

const TOKEN = import.meta.env.VITE_VIMEO_TOKEN

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `bearer ${TOKEN}`
    }
  })
  const type = res.headers.get('content-type') || ''
  const isJson = type.includes('application/json') || type.includes('+json')
  if (!res.ok || !isJson) {
    const text = await res.text().catch(() => '')
    const message = !res.ok
      ? `HTTP ${res.status}: ${text}`
      : `Unexpected content-type ${type}`
    throw new Error(message)
  }
  const json = await res.json()
  const mp4 = (json.files as any[])
    .filter(f => f.type === 'video/mp4')
    .sort((a, b) => b.width - a.width)[0]
  if (!mp4) {
    throw new Error('No MP4 file found in Vimeo response')
  }
  return { src: mp4.link, width: mp4.width, height: mp4.height }
}

const VIMEO_ID = import.meta.env.VITE_VIMEO_VIDEO_ID

export function HeroMontage() {
  if (!TOKEN || !VIMEO_ID) {
    return (
      <div className="p-4 text-red-500">
        Missing VITE_VIMEO_TOKEN or VITE_VIMEO_VIDEO_ID. See README for setup.
      </div>
    )
  }

  const { data, error } = useSWR<VideoData>(
    `https://api.vimeo.com/videos/${VIMEO_ID}?fields=files`,
    fetcher,
    {
      onError: err => console.error('Vimeo fetch error:', err),
      revalidateOnFocus: false,
      shouldRetryOnError: false
    }
  )
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [asciiError, setAsciiError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const handleError = () => {
      console.error('Video element error', video.error)
      setVideoError('Failed to play video')
    }
    const handleLoaded = () => {
      setVideoError(null)
    }
    video.addEventListener('error', handleError)
    video.addEventListener('loadeddata', handleLoaded)
    return () => {
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadeddata', handleLoaded)
    }
  }, [data])


  if (error || videoError || asciiError) {
    return (
      <div className="p-4 text-red-500">
        {error ? error.message : videoError || asciiError}
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
        className="absolute inset-0 h-full w-full object-cover opacity-0"
      />
      <AsciiLayer target={videoRef} ready={!!data} onError={setAsciiError} />
    </section>
  )
}
