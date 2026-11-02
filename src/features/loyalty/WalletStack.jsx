import { useRef } from 'react'
import { QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import { formatDate } from '../../utils/format'

const MAX_TILT_DEGREES = 9

// Position in the stack, front to back. Each card behind leaves its name showing.
const DEPTH_CLASSES = [
  'z-30',
  'z-20 -translate-y-14 scale-[0.94] hover:-translate-y-16',
  'z-10 -translate-y-27 scale-[0.88] hover:-translate-y-29',
]
const STACK_OFFSET_CLASSES = ['', 'mt-14', 'mt-27']

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Coffee-ring watermark, echoing the Brewloop mark. */
function CoffeeRings() {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -right-12 -bottom-16 size-64 text-[var(--tone-ink)] opacity-20" fill="none" stroke="currentColor">
      <circle cx="100" cy="100" r="78" strokeWidth="5" strokeDasharray="190 18 96 12 150 44" />
      <circle cx="100" cy="100" r="62" strokeWidth="1.5" strokeDasharray="120 30 200 40" />
    </svg>
  )
}

function PassFront({ business, customer, card }) {
  return (
    <div className="pass-face wallet-surface absolute inset-0 flex flex-col justify-between rounded-3xl p-5 text-left text-cream-50 shadow-lifted ring-1 ring-white/15 sm:p-6">
      <CoffeeRings />
      <div className="pass-sheen absolute inset-0" />

      <div className="flex items-start justify-between gap-3">
        <p className="display-title truncate text-[26px] leading-[1.2] text-cream-50 sm:text-[30px]">{business?.name}</p>
        <span className="shrink-0 pt-1 text-[11px] tracking-[0.14em] text-cream-200 uppercase">{business?.city}</span>
      </div>

      <div className="relative flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium">{customer?.name}</p>
          <p className="tabular mt-0.5 font-mono text-[13px] tracking-[0.12em] text-cream-200">{card?.cardNumber}</p>
          <p className="mt-1 text-[11px] text-cream-300/80">Member since {formatDate(customer?.createdAt)}</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cream-50 ring-1 ring-white/15 backdrop-blur-sm transition group-hover/pass:bg-white/20">
          <QrCode className="size-5" />
        </span>
      </div>
    </div>
  )
}

/** Stays light in both themes: scanners need dark modules on a pale background. */
function PassBack({ business, card }) {
  return (
    <div className="pass-face pass-face-back absolute inset-0 flex items-center gap-4 rounded-3xl bg-cream-50 p-4 text-left text-[#171513] shadow-lifted ring-1 ring-black/5 sm:gap-5 sm:p-5">
      {card && <QRCodeSVG value={card.cardNumber} size={176} fgColor="#171513" bgColor="#fdfcfa" level="M" className="h-full w-auto shrink-0" />}
      <div className="min-w-0">
        <p className="text-[10px] font-medium tracking-[0.16em] text-[#77716a] uppercase">Show to barista</p>
        <p className="mt-1 font-display text-[22px] leading-tight sm:text-[26px]">{business?.name}</p>
        <p className="tabular mt-2 font-mono text-xs tracking-[0.08em] text-[#57524c]">{card?.cardNumber}</p>
      </div>
    </div>
  )
}

function Pass({ entry, depth, isFlipped, onActivate }) {
  const tiltRef = useRef(null)
  const isFront = depth === 0
  const { business, customer, card } = entry

  const handlePointerMove = (event) => {
    // The QR has to stay flat to scan, and tilt is a mouse-only flourish.
    if (!isFront || isFlipped || event.pointerType !== 'mouse' || prefersReducedMotion()) return
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - left) / width
    const y = (event.clientY - top) / height
    const { style } = tiltRef.current
    style.setProperty('--tilt-x', `${(0.5 - y) * MAX_TILT_DEGREES * 2}deg`)
    style.setProperty('--tilt-y', `${(x - 0.5) * MAX_TILT_DEGREES * 2}deg`)
    style.setProperty('--sheen-x', `${x * 100}%`)
    style.setProperty('--sheen-y', `${y * 100}%`)
    style.setProperty('--sheen-opacity', '1')
  }

  const resetTilt = () => {
    const { style } = tiltRef.current
    for (const property of ['--tilt-x', '--tilt-y', '--sheen-x', '--sheen-y', '--sheen-opacity']) {
      style.removeProperty(property)
    }
  }

  const frontLabel = `${business?.name} card ${card?.cardNumber ?? ''}. ${isFlipped ? 'Hide QR code' : 'Show QR code'}`

  return (
    <div
      className={`${entry.tone} absolute inset-0 origin-top animate-pop-in transition-[translate,scale,opacity] duration-500 ease-[cubic-bezier(0.2,0.9,0.3,1)] ${DEPTH_CLASSES[depth]}`}
    >
      <button
        type="button"
        ref={tiltRef}
        onClick={onActivate}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        tabIndex={isFront ? 0 : -1}
        aria-pressed={isFront ? isFlipped : undefined}
        aria-label={isFront ? frontLabel : `Switch to ${business?.name} card`}
        className="pass-tilt group/pass block size-full cursor-pointer rounded-3xl"
      >
        <span className="pass-flipper relative block size-full" data-flipped={isFront && isFlipped}>
          <PassFront business={business} customer={customer} card={card} />
          <PassBack business={business} card={card} />
        </span>
      </button>
    </div>
  )
}

/**
 * The customer's cards as a physical wallet: the selected card sits in front and flips
 * to its QR, with the next best cards peeking out behind it, tap one to switch.
 * Only these are rendered, however many cards the customer holds.
 */
export default function WalletStack({ cards, activeEntry, isFlipped, onFlip, onSelect }) {
  const behind = cards.filter((entry) => entry !== activeEntry).slice(0, DEPTH_CLASSES.length - 1)
  const stack = [activeEntry, ...behind]
  // Fixed DOM order: moving a node would cancel its slide. Stacking comes from z-index.
  const inDomOrder = [...stack].sort((a, b) => (a.business?.id ?? '').localeCompare(b.business?.id ?? ''))

  return (
    <div className={`relative mx-auto aspect-[1.586] w-full max-w-[26rem] ${STACK_OFFSET_CLASSES[behind.length]}`}>
      {inDomOrder.map((entry) => {
        const depth = stack.indexOf(entry)
        return (
          <Pass
            key={entry.business?.id ?? entry.card?.id}
            entry={entry}
            depth={depth}
            isFlipped={isFlipped}
            onActivate={depth === 0 ? onFlip : () => onSelect(entry.business?.id)}
          />
        )
      })}
    </div>
  )
}
