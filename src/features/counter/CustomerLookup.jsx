import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, UserPlus } from 'lucide-react'

import Avatar from '../../components/Avatar'
import Button from '../../components/Button'
import SearchInput from '../../components/SearchInput'
import AddCustomerModal from '../customers/AddCustomerModal'
import ScanCardModal from './ScanCardModal'
import { useCustomerSearch } from '../../hooks/useCustomerSearch'

/**
 * The counter's primary action: find a customer by phone, name or card (typed or scanned).
 * Press "/" anywhere to focus it. Enter opens the top match.
 */
export default function CustomerLookup({ onSelect, autoFocus = true, size = 'lg' }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [adding, setAdding] = useState(false)
  const [scanning, setScanning] = useState(false)
  const results = useCustomerSearch(query)

  const select = onSelect ?? ((customer) => navigate(`/customers/${customer.id}`))
  const looksLikePhone = query.replace(/\D/g, '').length >= 10 && !/[a-z]/i.test(query)

  useEffect(() => {
    const focusOnSlash = (event) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    // Close the results when clicking anywhere outside the lookup.
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    window.addEventListener('keydown', focusOnSlash)
    window.addEventListener('pointerdown', closeOnOutsideClick)
    return () => {
      window.removeEventListener('keydown', focusOnSlash)
      window.removeEventListener('pointerdown', closeOnOutsideClick)
    }
  }, [])

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (results[activeIndex]) select(results[activeIndex].customer)
      else if (query.trim()) setAdding(true)
    }
    if (event.key === 'Escape') setOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-2">
        <SearchInput
          ref={inputRef}
          size={size}
          className="flex-1"
          placeholder="Phone number, name or card no."
          value={query}
          autoFocus={autoFocus}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Find customer"
        />
        <Button
          variant="secondary"
          size={size === 'lg' ? 'lg' : 'md'}
          icon={QrCode}
          onClick={() => setScanning(true)}
          className={size === 'lg' ? 'h-16 rounded-2xl border-espresso-900 shadow-soft' : 'h-11'}
        >
          <span className="hidden sm:inline">Scan card</span>
        </Button>
      </div>

      {open && query.trim() && (
        <div className="absolute inset-x-0 top-full z-20 mt-3 animate-pop-in overflow-hidden rounded-3xl bg-white p-1.5 shadow-lifted">
          {results.map(({ customer, card }, index) => (
            <button
              key={customer.id}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => select(customer)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${index === activeIndex ? 'bg-cream-100' : ''}`}
            >
              <Avatar name={customer.name} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{customer.name}</span>
                <span className="block text-[13px] text-espresso-500">{customer.phone}</span>
              </span>
              <span className="font-mono text-xs text-espresso-500">{card?.cardNumber}</span>
            </button>
          ))}
          {!results.length && (
            <div className="px-4 py-4 text-sm text-espresso-500">No customer matches “{query}”.</div>
          )}
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-1 flex w-full items-center gap-2 rounded-2xl bg-cream-100 px-4 py-3 text-sm font-semibold text-espresso-900 hover:bg-roast-100"
          >
            <UserPlus className="size-4" />
            {looksLikePhone ? `Add ${query.trim()} as a new customer` : 'Add a new customer'}
            <kbd className="kbd ml-auto text-espresso-500">↵</kbd>
          </button>
        </div>
      )}

      {adding && (
        <AddCustomerModal
          open
          initialPhone={looksLikePhone ? query.replace(/\D/g, '').slice(-10) : ''}
          onClose={() => {
            setAdding(false)
            setQuery('')
          }}
        />
      )}
      {scanning && (
        <ScanCardModal
          onClose={() => setScanning(false)}
          onFound={(customer) => {
            setScanning(false)
            select(customer)
          }}
        />
      )}
    </div>
  )
}
