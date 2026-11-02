import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, Gift, Search } from 'lucide-react'

import ProgressRing from './ProgressRing'
import { CAFE_PREVIEW_COUNT, cafeMatchesQuery, cafeShortStatus, cafeStatusLine, primaryProgress } from './loyaltyPresentation'
import { selectWallet } from '../../app/selectors'
import { activeCafeSelected } from '../ui/uiSlice'

const MAX_STAMP_SEGMENTS = 12

/** Stamp meter sized for the sidebar. Long programmes become one continuous bar. */
function StampMeter({ count, threshold }) {
  if (threshold > MAX_STAMP_SEGMENTS) {
    return (
      <span className="block h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
        <span
          className="block h-full rounded-full bg-[var(--tone-ink)] transition-[width] duration-500"
          style={{ width: `${Math.min(100, (count / threshold) * 100)}%` }}
        />
      </span>
    )
  }

  return (
    <span className="flex flex-1 gap-1">
      {Array.from({ length: threshold }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${index < count ? 'bg-[var(--tone-ink)]' : 'bg-white/15'}`}
          style={{ transitionDelay: `${index * 50}ms` }}
        />
      ))}
    </span>
  )
}

function CafeOption({ entry, onSelect }) {
  const { business, availableRewards } = entry
  const progress = primaryProgress(entry)
  const hasReward = availableRewards.length > 0

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${entry.tone} flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/8`}
    >
      {/* Same badge on every row, with an empty track when there's nothing to earn, so names line up. */}
      <ProgressRing count={progress?.count ?? 0} threshold={progress?.threshold ?? 0} className="size-10" inverted>
        <span className="flex size-6 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--tone-glow)_28%,transparent)] text-[9px] font-semibold tracking-wide text-[var(--tone-ink)]">
          {business?.cardPrefix}
        </span>
      </ProgressRing>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-cream-50">{business?.name}</span>
        <span className={`block truncate text-[11px] ${hasReward ? 'font-medium text-[var(--tone-ink)]' : 'text-cream-300/80'}`}>
          {cafeShortStatus(entry)}
        </span>
      </span>
      {hasReward && (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--tone-ink)] text-espresso-950">
          <Gift className="size-3.5" aria-hidden="true" />
        </span>
      )}
      {!hasReward && progress && (
        <span className="tabular shrink-0 text-[11px] font-medium text-cream-300/80">
          {progress.count}/{progress.threshold}
        </span>
      )}
    </button>
  )
}

/**
 * Sidebar card for the customer's selected café: live stamp progress in the café's
 * colourway, opening into a switcher for their other cards. Sets the café for every portal page.
 */
export default function SidebarCafeCard({ onNavigate }) {
  const dispatch = useDispatch()
  const { cards, activeEntry } = useSelector(selectWallet)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  if (!activeEntry) return null

  const progress = primaryProgress(activeEntry)
  const otherCards = cards.filter((entry) => entry !== activeEntry)
  const matchingCards = otherCards.filter((entry) => cafeMatchesQuery(entry, query))
  const rewardsElsewhere = otherCards.reduce((sum, entry) => sum + entry.availableRewards.length, 0)
  const canSwitch = otherCards.length > 0

  const handleSelect = (businessId) => {
    dispatch(activeCafeSelected(businessId))
    setIsOpen(false)
    setQuery('')
    onNavigate?.()
  }

  return (
    <div
      className={`${activeEntry.tone} wallet-surface mx-1 rounded-2xl ring-1 ring-white/15`}
      onKeyDown={(event) => event.key === 'Escape' && setIsOpen(false)}
    >
      <button
        type="button"
        disabled={!canSwitch}
        aria-expanded={canSwitch ? isOpen : undefined}
        aria-label={canSwitch ? `${activeEntry.business?.name}: ${cafeStatusLine(activeEntry)}. Switch café` : undefined}
        onClick={() => setIsOpen((open) => !open)}
        className="group block w-full cursor-pointer rounded-2xl p-3.5 text-left disabled:cursor-default"
      >
        <span className="flex items-start gap-2">
          <span key={activeEntry.business?.id} className="display-title block min-w-0 flex-1 animate-fade-up truncate text-[22px] leading-[1.2] text-cream-50">
            {activeEntry.business?.name}
          </span>
          {canSwitch && (
            <span className="flex shrink-0 items-center gap-1.5">
              {rewardsElsewhere > 0 && !isOpen && (
                <span className="flex items-center gap-0.5 rounded-full bg-white/10 py-0.5 pr-1.5 pl-1 text-[11px] font-semibold text-cream-50" title={`${rewardsElsewhere} waiting at your other cafés`}>
                  <Gift className="size-3" />
                  {rewardsElsewhere}
                </span>
              )}
              <ChevronDown className={`size-4 text-cream-200 transition-transform duration-300 group-hover:text-cream-50 ${isOpen ? 'rotate-180' : ''}`} />
            </span>
          )}
        </span>
        <span key={`${activeEntry.business?.id}-status`} className="mt-0.5 block animate-fade-up truncate text-xs font-medium text-[var(--tone-ink)]">
          {cafeStatusLine(activeEntry)}
        </span>
        {progress && (
          <span className="mt-3 flex items-center gap-2.5">
            <StampMeter count={progress.count} threshold={progress.threshold} />
            <span className="tabular text-[11px] font-medium text-cream-200">
              {progress.count}/{progress.threshold}
            </span>
          </span>
        )}
      </button>

      {canSwitch && (
        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div inert={!isOpen} className="min-h-0 overflow-hidden">
            <div className="border-t border-white/10 bg-black/30">
              <p className="px-3.5 pt-2.5 pb-1 text-[10px] font-medium tracking-[0.14em] text-cream-300/70 uppercase">
                Switch café · best first
              </p>
              {cards.length > CAFE_PREVIEW_COUNT && (
                <label className="mx-2 mb-1.5 flex items-center gap-2 rounded-lg bg-white/8 px-2.5 py-1.5 ring-1 ring-white/10 focus-within:ring-white/30">
                  <Search className="size-3.5 shrink-0 text-cream-300" aria-hidden="true" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={`Search ${otherCards.length} cafés`}
                    aria-label="Search your cafés"
                    className="w-full min-w-0 bg-transparent text-xs text-cream-50 outline-none placeholder:text-cream-300/70"
                  />
                </label>
              )}
              <div className="max-h-64 space-y-0.5 overflow-y-auto px-1.5 pb-1.5 [scrollbar-color:rgb(255_255_255/0.2)_transparent] [scrollbar-width:thin]">
                {matchingCards.map((entry) => (
                  <CafeOption key={entry.business?.id} entry={entry} onSelect={() => handleSelect(entry.business?.id)} />
                ))}
                {matchingCards.length === 0 && <p className="px-2 py-3 text-center text-xs text-cream-300">No cafés match “{query.trim()}”</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
