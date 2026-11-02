import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, HelpCircle, QrCode, RotateCcw } from 'lucide-react'

import EmptyState from '../../components/EmptyState'
import CafeDirectory from '../../features/loyalty/CafeDirectory'
import ProgressRing from '../../features/loyalty/ProgressRing'
import RewardTicket from '../../features/loyalty/RewardTicket'
import StampTrail from '../../features/loyalty/StampTrail'
import WalletStack from '../../features/loyalty/WalletStack'
import {
  greetingFor,
  itemsEarningStamps,
  primaryProgress,
  remainingLabel,
  rewardTitle,
  rewardWithArticle,
  walletHeadline,
} from '../../features/loyalty/loyaltyPresentation'
import { selectWallet } from '../../app/selectors'
import { activeCafeSelected } from '../../features/ui/uiSlice'
import { formatCurrency } from '../../utils/format'

const MENU_PREVIEW_LIMIT = 8

/** Brings an element on screen, without moving the page if it's already visible. */
function revealElement(element) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  element?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion ? 'auto' : 'smooth' })
}

/** A note beside the QR button, only when there's something the customer needs to know. */
function counterHint(progress, availableRewards) {
  if (availableRewards.length) return 'Show it at the counter to claim.'
  return progress ? null : 'No offers running right now.'
}

function WalletHero({ cards, activeEntry, isFlipped, onFlip, onSelect, heroRef }) {
  const progress = primaryProgress(activeEntry)
  const { lead, tail } = walletHeadline(activeEntry)
  const { business, customer, availableRewards, lookups } = activeEntry
  const firstName = customer?.name?.split(' ')[0]
  const FlipIcon = isFlipped ? RotateCcw : QrCode
  const hint = counterHint(progress, availableRewards)
  const stackRef = useRef(null)

  // On phones the card can sit below the fold, and the barista needs to see the QR.
  const handleFlipButton = () => {
    if (!isFlipped) revealElement(stackRef.current)
    onFlip()
  }

  return (
    <section ref={heroRef} className={`${activeEntry.tone} scroll-mt-20 wallet-surface rounded-4xl p-6 text-cream-50 shadow-lifted ring-white/10 sm:p-9 lg:p-11 dark:shadow-[0_24px_90px_-40px_var(--tone-glow)] dark:ring-1`}>
      <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-cream-200">
            {greetingFor()}
            {firstName && `, ${firstName}`}
          </p>
          <div aria-live="polite">
            <h1 key={business?.id} className="display-title mt-3 animate-fade-up text-[44px] leading-[1.02] text-cream-50 sm:text-[60px]">
              <em className="text-[var(--tone-ink)]">{lead}</em>
              <br />
              {tail}
            </h1>
          </div>

          {progress && (
            <div key={`${business?.id}-stamps`} className="mt-7">
              <StampTrail
                count={progress.count}
                threshold={progress.threshold}
                rewardLabel={rewardTitle(progress.offer, lookups)}
                ruleType={progress.offer.ruleType}
              />
              {availableRewards.length > 0 && (
                <p className="mt-3 text-[13px] text-cream-200">
                  {remainingLabel(progress.offer, progress.threshold - progress.count, lookups)} until your next reward
                </p>
              )}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={handleFlipButton}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-cream-50 px-5 text-sm font-semibold text-[#171513] transition hover:-translate-y-0.5 hover:shadow-lifted active:translate-y-0"
            >
              <FlipIcon className="size-4" />
              {isFlipped ? 'Back to card' : 'Show my QR'}
            </button>
            {hint && <p className="text-[13px] text-cream-200">{hint}</p>}
          </div>
        </div>

        <div ref={stackRef} className="scroll-mt-6 scroll-mb-28">
          <WalletStack cards={cards} activeEntry={activeEntry} isFlipped={isFlipped} onFlip={onFlip} onSelect={onSelect} />
        </div>
      </div>
    </section>
  )
}

/** Rewards earned here. Nothing at all when there are none: the hero already says what's next. */
function RewardTickets({ entry }) {
  const { availableRewards, offers, lookups } = entry
  if (!availableRewards.length) return null

  return (
    <div key={entry.business?.id} className="grid gap-3 sm:grid-cols-2">
      {availableRewards.map((reward) => (
        <RewardTicket
          key={reward.id}
          reward={reward}
          offer={offers.find((offer) => offer.id === reward.offerId)}
          lookups={lookups}
        />
      ))}
    </div>
  )
}

/** The small print, folded away: which items earn stamps, and any other offers running. */
function HowToEarn({ entry }) {
  const featured = primaryProgress(entry)
  const stampItems = itemsEarningStamps(featured?.offer, entry.items)
  const otherOffers = entry.offerProgress.filter((progress) => progress !== featured)
  if (!stampItems.length && !otherOffers.length) return null

  return (
    <details key={entry.business?.id} className="card group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 text-sm font-medium text-espresso-800 dark:text-cream-100 [&::-webkit-details-marker]:hidden">
        How to earn at {entry.business?.name}
        <ChevronDown className="size-4 shrink-0 text-espresso-500 transition-transform duration-200 group-open:rotate-180 dark:text-cream-300/80" aria-hidden="true" />
      </summary>
      <div className="grid gap-8 px-5 pt-1 pb-6 lg:grid-cols-2">
        {stampItems.length > 0 && (
          <div>
            <p className="eyebrow">Each of these earns a stamp</p>
            <ul className="mt-3 space-y-2.5">
              {stampItems.slice(0, MENU_PREVIEW_LIMIT).map((item) => (
                <li key={item.id} className="flex items-baseline gap-2 text-espresso-800 dark:text-cream-100">
                  <span className="truncate font-display text-[19px]">{item.name}</span>
                  <span aria-hidden="true" className="menu-leader" />
                  <span className="tabular text-sm font-medium">{formatCurrency(item.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {otherOffers.length > 0 && (
          <div>
            <p className="eyebrow">Also earning</p>
            <ul className="mt-3 space-y-3">
              {otherOffers.map((progress) => (
                <li key={progress.offer.id} className="flex items-center gap-3">
                  <ProgressRing count={progress.count} threshold={progress.threshold} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-espresso-900 dark:text-cream-50">{progress.offer.name}</span>
                    <span className="block truncate text-[13px] text-espresso-500 dark:text-cream-300/80">
                      {remainingLabel(progress.offer, progress.threshold - progress.count, entry.lookups)} to{' '}
                      {rewardWithArticle(progress.offer, entry.lookups)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  )
}

export default function UserLoyaltyPage() {
  const dispatch = useDispatch()
  const { cards, activeEntry } = useSelector(selectWallet)
  // Tracked per café so switching from the sidebar also returns to the card front.
  const [flippedCafeId, setFlippedCafeId] = useState(null)
  const heroRef = useRef(null)

  if (!activeEntry) {
    return (
      <EmptyState
        icon={HelpCircle}
        title="No loyalty cards found"
        description="You do not have any active café loyalty cards linked to this account yet."
      />
    )
  }

  const activeCafeId = activeEntry.business?.id
  const isFlipped = flippedCafeId === activeCafeId
  const handleSelect = (businessId) => {
    dispatch(activeCafeSelected(businessId))
    setFlippedCafeId(null)
    // A tile far down a long list would otherwise change a hero that's off screen.
    revealElement(heroRef.current)
  }

  return (
    <div className={`${activeEntry.tone} space-y-5`}>
      <WalletHero
        heroRef={heroRef}
        cards={cards}
        activeEntry={activeEntry}
        isFlipped={isFlipped}
        onFlip={() => setFlippedCafeId(isFlipped ? null : activeCafeId)}
        onSelect={handleSelect}
      />

      <RewardTickets entry={activeEntry} />

      {cards.length > 1 && <CafeDirectory cards={cards} activeEntry={activeEntry} onSelect={handleSelect} />}

      <HowToEarn entry={activeEntry} />
    </div>
  )
}
