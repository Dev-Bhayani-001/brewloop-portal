import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, QrCode, RotateCcw, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'

import StampTrail from './StampTrail'
import {
  primaryProgress,
  rewardTitle,
  remainingLabel,
  cafeShortStatus,
} from './loyaltyPresentation'

/* ─── Wallet card faces (matching WalletStack visual style) ─── */

function CoffeeRings() {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -right-12 -bottom-16 size-64 text-[var(--tone-ink)] opacity-20" fill="none" stroke="currentColor">
      <circle cx="100" cy="100" r="78" strokeWidth="5" strokeDasharray="190 18 96 12 150 44" />
      <circle cx="100" cy="100" r="62" strokeWidth="1.5" strokeDasharray="120 30 200 40" />
    </svg>
  )
}

function CardFront({ business, customer, card }) {
  return (
    <div className="wallet-surface relative flex aspect-[1.586] flex-col justify-between overflow-hidden rounded-3xl p-5 text-left text-cream-50 shadow-lifted ring-1 ring-white/15 sm:p-6">
      <CoffeeRings />
      <div className="pass-sheen absolute inset-0" />

      <div className="relative flex items-start justify-between gap-3">
        <p className="display-title truncate text-[26px] leading-[1.2] text-cream-50 sm:text-[30px]">{business?.name}</p>
        <span className="shrink-0 pt-1 text-[11px] tracking-[0.14em] text-cream-200 uppercase">{business?.city}</span>
      </div>

      <div className="relative flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium">{customer?.name}</p>
          <p className="tabular mt-0.5 font-mono text-[13px] tracking-[0.12em] text-cream-200">{card?.cardNumber}</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cream-50 ring-1 ring-white/15 backdrop-blur-sm">
          <QrCode className="size-5" />
        </span>
      </div>
    </div>
  )
}

function CardBack({ business, card }) {
  return (
    <div className="relative flex aspect-[1.586] items-center gap-4 overflow-hidden rounded-3xl bg-cream-50 p-4 text-left text-[#171513] shadow-lifted ring-1 ring-black/5 sm:gap-5 sm:p-5">
      {card && <QRCodeSVG value={card.cardNumber} size={176} fgColor="#171513" bgColor="#fdfcfa" level="M" className="h-full w-auto shrink-0" />}
      <div className="min-w-0">
        <p className="text-[10px] font-medium tracking-[0.16em] text-[#77716a] uppercase">Show to barista</p>
        <p className="mt-1 font-display text-[22px] leading-tight sm:text-[26px]">{business?.name}</p>
        <p className="tabular mt-2 font-mono text-xs tracking-[0.08em] text-[#57524c]">{card?.cardNumber}</p>
      </div>
    </div>
  )
}

/* ─── Download helper: uses html-to-image for reliable rendering ─── */

async function downloadCard(element, filename) {
  if (!element) return

  const dataUrl = await toPng(element, {
    pixelRatio: 3,
    cacheBust: true,
    backgroundColor: null,
  })

  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = dataUrl
  link.click()
}

/* ─── Modal component ─── */

export default function CafeCardModal({ entry, open, onClose }) {
  const dialogRef = useRef(null)
  const cardRef = useRef(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      setIsFlipped(false)
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    try {
      await downloadCard(cardRef.current, `${entry.business?.name ?? 'card'}-loyalty-card`)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(false)
    }
  }, [entry, downloading])

  if (!entry) return null

  const { business, customer, card, availableRewards, lookups } = entry
  const progress = primaryProgress(entry)
  const status = cafeShortStatus(entry)

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-transparent p-0 backdrop:bg-espresso-950/60 backdrop:backdrop-blur-sm open:animate-pop-in"
    >
      {open && (
        <div className={`${entry.tone} flex flex-col`}>
          {/* Close button */}
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-full bg-white/15 text-cream-50 backdrop-blur-md transition hover:bg-white/25"
              aria-label="Close"
            >
              <X className="size-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Card */}
          <div ref={cardRef}>
            {isFlipped ? (
              <CardBack business={business} card={card} />
            ) : (
              <CardFront business={business} customer={customer} card={card} />
            )}
          </div>

          {/* Progress info */}
          {progress && (
            <div className="wallet-surface mt-4 rounded-2xl p-4 text-cream-50 shadow-lifted ring-1 ring-white/10">
              <StampTrail
                count={progress.count}
                threshold={progress.threshold}
                rewardLabel={rewardTitle(progress.offer, lookups)}
                ruleType={progress.offer.ruleType}
              />
              {availableRewards.length > 0 ? (
                <p className="mt-3 text-[13px] font-medium text-cream-200">
                  🎉 {availableRewards.length} reward{availableRewards.length > 1 ? 's' : ''} ready to claim!
                </p>
              ) : (
                <p className="mt-3 text-[13px] text-cream-200">
                  {remainingLabel(progress.offer, progress.threshold - progress.count, lookups)} until your next reward
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsFlipped((flipped) => !flipped)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-cream-50 text-sm font-semibold text-[#171513] transition hover:-translate-y-0.5 hover:shadow-lifted active:translate-y-0"
            >
              {isFlipped ? <RotateCcw className="size-4" /> : <QrCode className="size-4" />}
              {isFlipped ? 'Back to card' : 'Show my QR'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white/15 text-sm font-semibold text-cream-50 ring-1 ring-white/15 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/25 active:translate-y-0 disabled:opacity-50"
            >
              <Download className="size-4" />
              {downloading ? 'Saving…' : 'Download card'}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}

