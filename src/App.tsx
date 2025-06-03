import { HeroMontage } from './components/HeroMontage'
import { AlphabetSpectrum } from './components/AlphabetSpectrum'

export default function App() {
  return (
    <div className="relative min-h-screen bg-black text-white micro-5-regular">
      <HeroMontage />
      <AlphabetSpectrum />
    </div>
  )
}
