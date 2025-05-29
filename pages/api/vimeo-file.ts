import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const VIMEO = process.env.VIMEO_TOKEN!
const CACHE = 60 * 60 * 24

export default async function handler(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')?.match(/\d+/)?.[0]
  if (!id) return new Response('Bad ID', { status: 400 })

  const cacheKey = `vimeo-${id}`
  const cached = await env.KV.get(cacheKey, 'json')
  if (cached) return Response.json(cached, { headers: { 'x-cache': 'HIT' } })

  const res = await fetch(`https://api.vimeo.com/videos/${id}`, {
    headers: { Authorization: `bearer ${VIMEO}` }
  })
  const json = await res.json()

  const mp4 = json.files
    .filter((f: any) => f.type === 'video/mp4')
    .sort((a: any, b: any) => b.width - a.width)[0]

  const payload = { src: mp4.link, width: mp4.width, height: mp4.height }
  await env.KV.put(cacheKey, JSON.stringify(payload), { expirationTtl: CACHE })
  return Response.json(payload, { headers: { 'x-cache': 'MISS' } })
}
