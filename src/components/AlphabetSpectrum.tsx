import React from 'react'

export function AlphabetSpectrum() {
  const chars = 'ABCDEFGHIJK+MNOPQRSTUVWXYZ'.split('')
  const classes = [
    'hsl0','hsl15','hsl30','hsl45','hsl60','hsl75','hsl90','hsl105','hsl120','hsl135','hsl150',
    'hsl165','hsl180','hsl195','hsl210','hsl225','hsl240','hsl255','hsl270','hsl285','hsl300','hsl315','hsl330','hsl345','hsl360'
  ]
  return (
    <div className="pointer-events-none absolute bottom-4 w-full text-center text-4xl">
      {chars.map((char, idx) => (
        <span key={idx} className={`${classes[idx]} px-0.5`}>
          {char}
        </span>
      ))}
    </div>
  )
}
