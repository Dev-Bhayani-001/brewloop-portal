import { useEffect, useState } from 'react'

import cupArt from '../../assets/login/cup-art.webp'
import cupThree from '../../assets/login/cup-3.webp'
import cupFour from '../../assets/login/cup-4.webp'
import cupFive from '../../assets/login/cup-5.webp'
import cupSix from '../../assets/login/cup-6.webp'
import cupScene from '../../assets/login/cup-scene.webp'

const STAMPS_NEEDED = 6
const START_COUNT = 2

function statusFor(count) {
  if (count === STAMPS_NEEDED) return 'A free coffee, on us.'
  return `${STAMPS_NEEDED - count} more for a free coffee`
}

/** Login panel: a cup that fills up on a loop, with one headline and one progress line. */
export default function CupStory() {
  const [count, setCount] = useState(START_COUNT)

  useEffect(() => {
    const isFull = count === STAMPS_NEEDED
    const timer = setTimeout(() => setCount(isFull ? START_COUNT : count + 1), isFull ? 5000 : 1800)
    return () => clearTimeout(timer)
  }, [count])

  const showFrom = (stamp) => `cup-layer ${count >= stamp ? 'cup-layer-on' : ''}`

  return (
    <>
      <div className="cup-scene">
        <img src={cupScene} alt="A cup of coffee on a saucer" className="block size-full" />
        <img src={cupThree} alt="" className={showFrom(3)} />
        <img src={cupFour} alt="" className={showFrom(4)} />
        <img src={cupFive} alt="" className={showFrom(5)} />
        <img src={cupSix} alt="" className={showFrom(6)} />
        <img src={cupArt} alt="" className={`${showFrom(6)} cup-layer-art`} />
      </div>

      <div className="relative mt-auto">
        <h1 className="display-title text-[52px] leading-[0.98] text-balance xl:text-[64px]">
          Turn first visits into <em>regulars.</em>
        </h1>
        <div className="cup-status mt-5 flex items-center justify-between gap-4 border-t pt-3.5">
          <p className="font-display text-[23px] leading-tight italic">{statusFor(count)}</p>
          <p className="tabular shrink-0 text-sm font-medium">
            {count}/{STAMPS_NEEDED}
          </p>
        </div>
      </div>
    </>
  )
}
