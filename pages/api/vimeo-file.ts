import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const VIMEO = process.env.VIMEO_TOKEN
const DEFAULT_ID = process.env.VITE_VIMEO_VIDEO_ID
const CACHE = 60 * 60 * 24
const cache = new Map<string, any>()

export default async function handler(req: NextRequest) {
  if (!VIMEO) {
    console.error('VIMEO_TOKEN is not set')
    return new Response('Server misconfiguration', { status: 500 })
  }
  const id =
    req.nextUrl.searchParams.get('id')?.match(/\d+/)?.[0] ?? DEFAULT_ID
  if (!id) {
    console.error('VITE_VIMEO_VIDEO_ID is not set')
    return new Response('Server misconfiguration', { status: 500 })
  }

  const cacheKey = `vimeo-${id}`
  const cached = cache.get(cacheKey)
  if (cached) return Response.json(cached, { headers: { 'x-cache': 'HIT' } })

  try {
    const url = `https://api.vimeo.com/videos/${id}?fields=files`
    console.log('Fetching', url)
    const res = await fetch(url, {
      headers: { Authorization: `bearer ${VIMEO}` }
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('Vimeo API error:', res.status, text)
      return Response.json(
        { error: 'Upstream error', status: res.status },
        { status: res.status }
      )
    }
    const json = await res.json().catch(e => {
      console.error('Failed to parse Vimeo response', e)
      return null
    })
    if (!json || !Array.isArray(json.files)) {
      console.error('Invalid Vimeo data:', json)
      return new Response('Bad upstream response', { status: 502 })
    }

    const mp4 = json.files
      .filter((f: any) => f.type === 'video/mp4')
      .sort((a: any, b: any) => b.width - a.width)[0]
    if (!mp4) {
      console.error('No MP4 file found in Vimeo response')
      return new Response('No suitable video', { status: 502 })
    }

    const payload = { src: mp4.link, width: mp4.width, height: mp4.height }
    console.log(`Fetched Vimeo video ${id}`)
    cache.set(cacheKey, payload)
    setTimeout(() => cache.delete(cacheKey), CACHE * 1000)
    return Response.json(payload, { headers: { 'x-cache': 'MISS' } })
  } catch (err) {
    console.error(err)
    return new Response('Internal Error', { status: 500 })
  }
}
