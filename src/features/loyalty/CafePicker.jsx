import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, LayoutGrid, Search } from 'lucide-react'

import { CAFE_PREVIEW_COUNT, cafeMatchesQuery } from './loyaltyPresentation'

const ALL_OPTION_ID = 'all'

const billLabel = (count) => `${count} ${count === 1 ? 'bill' : 'bills'}`

/** Small round mark for a café, in its colour. Falls back to a grid for "All cafés". */
function CafeMark({ entry }) {
  if (!entry) {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cream-200 text-espresso-700 dark:bg-white/10 dark:text-cream-100">
        <LayoutGrid className="size-3.5" aria-hidden="true" />
      </span>
    )
  }
  return (
    <span className={`${entry.tone} wallet-surface flex size-7 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold tracking-wide text-[var(--tone-ink)]`}>
      {entry.business?.cardPrefix}
    </span>
  )
}

/**
 * Searchable café dropdown. `cafes` is a list of `{ entry, billCount }`.
 * Follows the ARIA combobox pattern: focus stays on the search box (or the list, when
 * there's no search) while the arrow keys move the highlighted option.
 */
export default function CafePicker({ cafes, selectedId, allCount, onSelect, onSelectAll }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(0)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const searchRef = useRef(null)
  const listRef = useRef(null)
  const baseId = useId()

  const hasSearch = cafes.length > CAFE_PREVIEW_COUNT
  const selected = cafes.find(({ entry }) => entry.business?.id === selectedId)
  const hasQuery = query.trim() !== ''

  const toOption = ({ entry, billCount }) => ({ id: entry.business?.id, entry, billCount })
  // Without a search, "All cafés" and the current café stay at the top, so it opens unscrolled.
  const options = hasQuery
    ? cafes.filter(({ entry }) => cafeMatchesQuery(entry, query)).map(toOption)
    : [
        { id: ALL_OPTION_ID, entry: null, billCount: allCount },
        ...(selected ? [toOption(selected)] : []),
        ...cafes.filter((cafe) => cafe !== selected).map(toOption),
      ]
  const optionDomId = (index) => `${baseId}-option-${index}`

  useEffect(() => {
    if (!isOpen) return undefined
    // A touch device shouldn't get its keyboard pushed up just for opening a list.
    const canTypeFreely = window.matchMedia('(hover: hover)').matches
    ;(hasSearch && canTypeFreely ? searchRef.current : listRef.current)?.focus()

    const closeOnOutsidePress = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePress)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress)
  }, [isOpen, hasSearch])

  useEffect(() => {
    if (isOpen) document.getElementById(`${baseId}-option-${highlightIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, highlightIndex, baseId])

  const open = () => {
    setQuery('')
    setHighlightIndex(selected ? 1 : 0)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  const choose = (option) => {
    if (option.id === ALL_OPTION_ID) onSelectAll()
    else onSelect(option.id)
    close()
  }

  const handleTriggerKeyDown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    if (!isOpen) open()
  }

  const handlePanelKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      setIsOpen(false)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!options.length) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setHighlightIndex((index) => (index + step + options.length) % options.length)
    } else if (event.key === 'Enter' && options[highlightIndex]) {
      event.preventDefault()
      choose(options[highlightIndex])
    }
  }

  return (
    <div ref={rootRef} className="relative w-full sm:w-72">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Choose café. Showing ${selected?.entry.business?.name ?? 'all cafés'}`}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        onKeyDown={handleTriggerKeyDown}
        className={`flex h-11 w-full items-center gap-2.5 rounded-full bg-white pr-3.5 pl-2 text-left shadow-card transition-shadow hover:shadow-soft dark:bg-[#1a1816] dark:shadow-none dark:ring-1 dark:ring-white/15 dark:hover:ring-white/30 ${
          isOpen ? 'shadow-soft dark:ring-white/30' : ''
        }`}
      >
        <CafeMark entry={selected?.entry} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-espresso-900 dark:text-cream-50">
          {selected?.entry.business?.name ?? 'All cafés'}
        </span>
        <span className="tabular shrink-0 text-xs text-espresso-500 dark:text-cream-300/80">{billLabel(selected?.billCount ?? allCount)}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-espresso-500 transition-transform duration-200 dark:text-cream-300/80 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          onKeyDown={handlePanelKeyDown}
          className="absolute inset-x-0 top-full z-30 mt-2 animate-pop-in overflow-hidden rounded-2xl bg-white shadow-pop ring-1 ring-espresso-900/5 sm:right-auto sm:w-80 dark:bg-[#1f1c19] dark:ring-white/10"
        >
          {hasSearch && (
            <label className="flex items-center gap-2 border-b border-cream-200 px-3.5 py-2.5 dark:border-white/10">
              <Search className="size-4 shrink-0 text-espresso-400 dark:text-cream-300/60" aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                role="combobox"
                aria-expanded="true"
                aria-controls={`${baseId}-list`}
                aria-activedescendant={options.length ? optionDomId(highlightIndex) : undefined}
                aria-label="Search cafés"
                placeholder="Search by café or city"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setHighlightIndex(0)
                }}
                className="w-full min-w-0 bg-transparent text-sm text-espresso-900 outline-none placeholder:text-espresso-400 dark:text-cream-50 dark:placeholder:text-cream-300/60"
              />
            </label>
          )}

          <ul
            ref={listRef}
            id={`${baseId}-list`}
            role="listbox"
            tabIndex={-1}
            aria-label="Cafés"
            aria-activedescendant={options.length ? optionDomId(highlightIndex) : undefined}
            className="max-h-[min(20rem,42vh)] overflow-y-auto p-1.5 outline-none [scrollbar-width:thin]"
          >
            {options.map((option, index) => {
              const isSelected = (option.id === ALL_OPTION_ID && !selected) || option.id === selectedId
              return (
                <li
                  key={option.id}
                  id={optionDomId(index)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => choose(option)}
                  onPointerMove={() => setHighlightIndex(index)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 ${index === highlightIndex ? 'bg-cream-100 dark:bg-white/8' : ''}`}
                >
                  <CafeMark entry={option.entry} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-espresso-900 dark:text-cream-50">
                      {option.entry?.business?.name ?? 'All cafés'}
                    </span>
                    <span className="block truncate text-xs text-espresso-500 dark:text-cream-300/80">
                      {option.entry?.business?.city ?? `${cafes.length} memberships`}
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-xs text-espresso-500 dark:text-cream-300/80">
                    {billLabel(option.billCount)}
                  </span>
                  <Check className={`size-4 shrink-0 text-espresso-900 dark:text-cream-50 ${isSelected ? '' : 'invisible'}`} aria-hidden="true" />
                </li>
              )
            })}
            {options.length === 0 && (
              <li className="px-2 py-6 text-center text-sm text-espresso-500 dark:text-cream-300/80">No cafés match “{query.trim()}”</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
