import { useState } from 'react'
import { Gift, Search } from 'lucide-react'

import ProgressRing from './ProgressRing'
import { CAFE_PREVIEW_COUNT, cafeMatchesQuery, cafeShortStatus, cafeStage, primaryProgress } from './loyaltyPresentation'

const COLLAPSED_COUNT = 3

const FILTERS = [
  { id: 'all', label: 'All', matches: () => true },
  { id: 'ready', label: 'Rewards ready', matches: (entry) => cafeStage(entry) === 'ready' },
  { id: 'close', label: 'Almost there', matches: (entry) => cafeStage(entry) === 'close' },
  { id: 'none', label: 'No offers', matches: (entry) => cafeStage(entry) === 'none' },
]

function CafeTile({ entry, isActive, onSelect }) {
  const { business, availableRewards, tone } = entry
  const progress = primaryProgress(entry)
  const rewardCount = availableRewards.length

  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      className={`${tone} flex min-w-0 items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-soft dark:bg-[#1a1816] ${
        isActive ? 'ring-2 ring-[var(--tone-glow)] dark:ring-[var(--tone-glow)]' : 'dark:ring-1 dark:ring-white/10'
      }`}
    >
      <ProgressRing count={progress?.count ?? 0} threshold={progress?.threshold ?? 0}>
        {progress ? undefined : business?.cardPrefix}
      </ProgressRing>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-espresso-900 dark:text-cream-50">{business?.name}</span>
        <span className="block truncate text-xs text-espresso-500 dark:text-cream-300/80">
          {cafeShortStatus(entry)}
        </span>
      </span>
      {rewardCount > 0 && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--tone-from)] px-2.5 py-1 text-xs font-semibold text-[var(--tone-ink)] dark:bg-white/10">
          <Gift className="size-3.5" aria-hidden="true" />
          {rewardCount}
          <span className="sr-only">{rewardCount === 1 ? 'reward ready' : 'rewards ready'}</span>
        </span>
      )}
    </button>
  )
}

function FilterChip({ filter, count, isActive, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors ${
        isActive
          ? 'bg-espresso-900 text-cream-50 dark:bg-cream-50 dark:text-[#171513]'
          : 'text-espresso-600 ring-1 ring-espresso-900/10 hover:text-espresso-900 dark:text-cream-200 dark:ring-white/15 dark:hover:text-cream-50'
      }`}
    >
      {filter.label}
      <span className={`tabular text-xs ${isActive ? 'opacity-70' : 'text-espresso-400 dark:text-cream-300/60'}`}>{count}</span>
    </button>
  )
}

/**
 * The customer's other cafés, best reason to visit first. Shows a single quiet row;
 * "Show all" opens the full list, with search and filters once it's long enough to need them.
 */
export default function CafeDirectory({ cards, activeEntry, onSelect }) {
  const [query, setQuery] = useState('')
  const [filterId, setFilterId] = useState('all')
  const [isExpanded, setIsExpanded] = useState(false)

  const canExpand = cards.length > COLLAPSED_COUNT
  const hasControls = isExpanded && cards.length > CAFE_PREVIEW_COUNT
  const activeFilter = FILTERS.find((filter) => filter.id === filterId)
  const visibleFilters = FILTERS.filter((filter) => filter.id === filterId || cards.some(filter.matches))
  const matches = cards.filter((entry) => activeFilter.matches(entry) && cafeMatchesQuery(entry, query))

  const shown = canExpand && !isExpanded ? matches.slice(0, COLLAPSED_COUNT) : matches
  // A café picked from elsewhere (sidebar, stack) stays visible, without reshuffling the rest.
  if (canExpand && !isExpanded && !shown.includes(activeEntry)) shown[shown.length - 1] = activeEntry

  const clearSearch = () => {
    setQuery('')
    setFilterId('all')
  }

  const toggleExpanded = () => {
    clearSearch()
    setIsExpanded((expanded) => !expanded)
  }

  return (
    <section aria-label="Your cafés" className="space-y-3 pt-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-espresso-800 dark:text-cream-100">
          Your cafés <span className="tabular font-normal text-espresso-500 dark:text-cream-300/80">{cards.length}</span>
        </h2>
        {canExpand && (
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={toggleExpanded}
            className="text-sm font-medium text-espresso-600 underline-offset-4 hover:text-espresso-900 hover:underline dark:text-cream-200 dark:hover:text-cream-50"
          >
            {isExpanded ? 'Show less' : 'Show all'}
          </button>
        )}
      </div>

      {hasControls && (
        <div className="flex animate-fade-up flex-wrap items-center justify-between gap-3">
          <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 py-0.5 [scrollbar-width:none]">
            {visibleFilters.map((filter) => (
              <FilterChip
                key={filter.id}
                filter={filter}
                count={cards.filter(filter.matches).length}
                isActive={filter.id === filterId}
                onSelect={() => setFilterId(filter.id)}
              />
            ))}
          </div>
          <label className="flex h-10 w-full items-center gap-2 rounded-xl bg-white px-3 shadow-card focus-within:ring-2 focus-within:ring-[var(--tone-glow)] sm:w-64 dark:bg-[#1a1816] dark:shadow-none dark:ring-1 dark:ring-white/10">
            <Search className="size-4 shrink-0 text-espresso-400 dark:text-cream-300/60" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by café or city"
              aria-label="Search your cafés"
              className="w-full min-w-0 bg-transparent text-sm text-espresso-900 outline-none placeholder:text-espresso-400 dark:text-cream-50 dark:placeholder:text-cream-300/60"
            />
          </label>
        </div>
      )}

      {shown.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((entry) => (
            <CafeTile
              key={entry.business?.id ?? entry.card?.id}
              entry={entry}
              isActive={entry === activeEntry}
              onSelect={() => onSelect(entry.business?.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-[1.5px] border-dashed border-cream-300 p-6 text-center text-sm text-espresso-600 dark:border-white/15 dark:text-cream-200">
          No cafés match your search.{' '}
          <button type="button" onClick={clearSearch} className="font-semibold text-espresso-900 underline underline-offset-2 dark:text-cream-50">
            Clear it
          </button>
        </div>
      )}
    </section>
  )
}
