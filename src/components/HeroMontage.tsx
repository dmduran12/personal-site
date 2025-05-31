import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { AsciiLayer } from './AsciiLayer'

type VideoData = { src: string; width: number; height: number }

const VIMEO_TOKEN = import.meta.env.VITE_VIMEO_TOKEN

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: { Authorization: `bearer ${VIMEO_TOKEN}` }
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
  if (!Array.isArray(json.files)) {
    throw new Error('Invalid Vimeo data')
  }
  const mp4 = json.files
    .filter((f: any) => f.type === 'video/mp4')
    .sort((a: any, b: any) => b.width - a.width)[0]
  if (!mp4) {
    throw new Error('No MP4 file found')
  }
  return { src: mp4.link, width: mp4.width, height: mp4.height }
}

const VIMEO_ID = import.meta.env.VITE_VIMEO_VIDEO_ID

export function HeroMontage() {
  const { data, error } = useSWR<VideoData>(
    `https://api.vimeo.com/videos/${VIMEO_ID}`,
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
