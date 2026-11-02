import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HelpCircle, QrCode, RotateCcw, Ticket } from 'lucide-react'

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

/** Only promises stamps when there's a live offer to earn them on. */
function counterHint(progress, availableRewards) {
  if (progress) return 'Your barista scans it, you collect the stamp.'
  if (availableRewards.length) return 'Show it at the counter to claim your reward.'
  return 'Keep it handy for the next offer.'
}

function WalletHero({ cards, activeEntry, isFlipped, onFlip, onSelect, heroRef }) {
  const progress = primaryProgress(activeEntry)
  const { lead, tail } = walletHeadline(activeEntry)
  const { business, customer, availableRewards, lookups } = activeEntry
  const firstName = customer?.name?.split(' ')[0]
  const FlipIcon = isFlipped ? RotateCcw : QrCode
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
              <p className="mt-3 text-[13px] text-cream-200">
                {progress.count} of {progress.threshold} stamps on {progress.offer.name} at {business?.name}
                {availableRewards.length > 0 &&
                  ` · ${remainingLabel(progress.offer, progress.threshold - progress.count, lookups)} until your next one`}
              </p>
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
            <p className="text-[13px] text-cream-200">{counterHint(progress, availableRewards)}</p>
          </div>
        </div>

        <div ref={stackRef} className="scroll-mt-6 scroll-mb-28">
          <WalletStack cards={cards} activeEntry={activeEntry} isFlipped={isFlipped} onFlip={onFlip} onSelect={onSelect} />
        </div>
      </div>
    </section>
  )
}

function RewardsPanel({ entry }) {
  const { availableRewards, offers, lookups } = entry
  const progress = primaryProgress(entry)

  return (
    <div className="space-y-3">
      <h2 className="display-title text-[26px]">Ready to redeem</h2>
      {availableRewards.length > 0 ? (
        availableRewards.map((reward) => (
          <RewardTicket
            key={reward.id}
            reward={reward}
            offer={offers.find((offer) => offer.id === reward.offerId)}
            lookups={lookups}
          />
        ))
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border-[1.5px] border-dashed border-cream-300 p-5 dark:border-white/15">
          <Ticket className="size-7 shrink-0 text-espresso-400 dark:text-cream-300/60" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-semibold text-espresso-900 dark:text-cream-50">
              {progress ? 'Your next reward lands here' : 'No offers running right now'}
            </p>
            <p className="mt-0.5 text-[13px] text-espresso-500 dark:text-cream-300/80">
              {progress ? (
                <>
                  {remainingLabel(progress.offer, progress.threshold - progress.count, lookups)} to go for{' '}
                  {rewardWithArticle(progress.offer, lookups)}.
                </>
              ) : (
                `${entry.business?.name ?? 'This café'} has no stamp offers at the moment. Your card stays active for the next one.`
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function AlsoEarningPanel({ entry }) {
  const featured = primaryProgress(entry)
  const others = entry.offerProgress.filter((progress) => progress !== featured)
  if (!others.length) return null

  return (
    <div className="space-y-3">
      <h2 className="display-title text-[26px]">Also earning</h2>
      {others.map((progress) => (
        <div key={progress.offer.id} className="card flex items-center gap-3.5 p-3.5">
          <ProgressRing count={progress.count} threshold={progress.threshold} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-espresso-900 dark:text-cream-50">{progress.offer.name}</p>
            <p className="truncate text-[13px] text-espresso-500 dark:text-cream-300/80">
              {remainingLabel(progress.offer, progress.threshold - progress.count, entry.lookups)} to{' '}
              {rewardWithArticle(progress.offer, entry.lookups)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function StampMenu({ businessName, items }) {
  return (
    <section className="card p-6 sm:p-8">
      <p className="eyebrow">{businessName}</p>
      <h2 className="display-title mt-1 text-[32px] leading-tight">Every one of these earns a stamp</h2>
      <ul className="mt-5 grid gap-x-10 gap-y-3 sm:grid-cols-2">
        {items.slice(0, MENU_PREVIEW_LIMIT).map((item) => (
          <li key={item.id} className="flex items-baseline gap-2 text-espresso-800 dark:text-cream-100">
            <span className="truncate font-display text-[19px]">{item.name}</span>
            <span aria-hidden="true" className="menu-leader" />
            <span className="tabular text-sm font-medium">{formatCurrency(item.price)}</span>
          </li>
        ))}
      </ul>
    </section>
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
  const stampItems = itemsEarningStamps(primaryProgress(activeEntry)?.offer, activeEntry.items)

  const handleSelect = (businessId) => {
    dispatch(activeCafeSelected(businessId))
    setFlippedCafeId(null)
    // A tile far down a long list would otherwise change a hero that's off screen.
    revealElement(heroRef.current)
  }

  return (
    <div className={`${activeEntry.tone} space-y-5 lg:space-y-6`}>
      <WalletHero
        heroRef={heroRef}
        cards={cards}
        activeEntry={activeEntry}
        isFlipped={isFlipped}
        onFlip={() => setFlippedCafeId(isFlipped ? null : activeCafeId)}
        onSelect={handleSelect}
      />

      {cards.length > 1 && <CafeDirectory cards={cards} activeEntry={activeEntry} onSelect={handleSelect} />}

      <div className="grid items-start gap-8 pt-3 lg:grid-cols-12">
        <div className={`space-y-8 ${stampItems.length ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          <RewardsPanel entry={activeEntry} />
          <AlsoEarningPanel entry={activeEntry} />
        </div>
        {stampItems.length > 0 && (
          <div className="lg:col-span-7">
            <StampMenu businessName={activeEntry.business?.name} items={stampItems} />
          </div>
        )}
      </div>
    </div>
  )
}
