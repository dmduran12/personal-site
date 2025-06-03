import React from 'react'

export function AlphabetSpectrum() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const classes = [
    'hsl0','hsl14','hsl28','hsl42','hsl56','hsl70','hsl84','hsl98','hsl112','hsl126','hsl140',
    'hsl154','hsl168','hsl182','hsl196','hsl210','hsl224','hsl238','hsl252','hsl266','hsl280','hsl294','hsl308','hsl322','hsl336','hsl350'
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
