import { MutableRefObject, useReducer } from 'react'

export function NesController({
  cellSizeRef
}: {
  cellSizeRef: MutableRefObject<{ w: number; h: number }>
}) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)

  const adjust = (dx: number, dy: number) => {
    cellSizeRef.current.w = Math.max(1, cellSizeRef.current.w + dx)
    cellSizeRef.current.h = Math.max(1, cellSizeRef.current.h + dy)
    forceUpdate()
  }

  const placeholder = (btn: string) => {
    console.log(`TODO: ${btn}`)
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 relative select-none">
      <svg viewBox="0 0 32 16" className="w-full h-full">
        <rect x="0" y="0" width="32" height="16" className="fill-gray-500" />
        <rect x="1" y="1" width="30" height="14" className="fill-gray-300" />
        <rect x="5" y="3" width="2" height="10" className="fill-gray-800" />
        <rect x="3" y="5" width="6" height="2" className="fill-gray-800" />
        <rect x="13" y="7" width="2" height="2" className="fill-gray-700" />
        <rect x="17" y="7" width="2" height="2" className="fill-gray-700" />
        <circle cx="23" cy="8" r="2" className="fill-red-600" />
        <circle cx="27" cy="8" r="2" className="fill-red-600" />
      </svg>
      <button onClick={() => adjust(1, 0)} className="absolute left-0 top-6 w-4 h-4" aria-label="left" />
      <button onClick={() => adjust(-1, 0)} className="absolute left-8 top-6 w-4 h-4" aria-label="right" />
      <button onClick={() => adjust(0, 1)} className="absolute left-4 top-2 w-4 h-4" aria-label="up" />
      <button onClick={() => adjust(0, -1)} className="absolute left-4 top-10 w-4 h-4" aria-label="down" />
      <button onClick={() => placeholder('select')} className="absolute left-[52px] top-6 w-4 h-4" aria-label="select" />
      <button onClick={() => placeholder('b')} className="absolute left-[88px] top-6 w-4 h-4" aria-label="b" />
      <button onClick={() => placeholder('a')} className="absolute left-[104px] top-6 w-4 h-4" aria-label="a" />
    </div>
  )
}
