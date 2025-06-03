import { useRef } from 'react'
import { HeroMontage } from './components/HeroMontage'
import { NesController } from './components/NesController'

export default function App() {
  const cellSizeRef = useRef({ w: 6, h: 8 })
  return (
    <div className="relative min-h-screen bg-black text-white micro-5-regular">
      <HeroMontage cellSizeRef={cellSizeRef} />
      <NesController cellSizeRef={cellSizeRef} />
    </div>
  )
}
