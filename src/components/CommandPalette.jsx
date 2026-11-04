import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, Search } from 'lucide-react'

import Avatar from './Avatar'

/**
 * ⌘K / Ctrl+K palette. `commands` are static actions; `searchPeople(query)` can
 * return extra rows (e.g. customers) as { id, label, sublabel, to }.
 */
export default function CommandPalette({ open, onClose, commands, searchPeople, peopleLabel = 'Customers' }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const dialogRef = useRef(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  const rows = useMemo(() => {
    const text = query.trim().toLowerCase()
    const matchingCommands = commands
      .filter((command) => !text || `${command.label} ${command.keywords ?? ''}`.toLowerCase().includes(text))
      .map((command) => ({ ...command, group: 'Go to' }))
    const people = text && searchPeople ? searchPeople(text).map((row) => ({ ...row, group: peopleLabel, person: true })) : []
    return [...people, ...matchingCommands]
  }, [query, commands, searchPeople, peopleLabel])

  const run = (row) => {
    onClose()
    navigate(row.to)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, rows.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && rows[activeIndex]) {
      event.preventDefault()
      run(rows[activeIndex])
    }
  }

  let lastGroup = null
  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      aria-label="Command palette"
      className="mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-3xl bg-white p-0 shadow-lifted backdrop:bg-espresso-950/40 backdrop:backdrop-blur-sm open:animate-pop-in dark:border dark:border-white/10 dark:bg-[#1a1714] dark:text-cream-50 dark:shadow-none"
    >
      <div className="flex items-center gap-3 border-b border-cream-200 px-5 dark:border-white/10">
        <Search className="size-5 text-espresso-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search customers, pages, actions…"
          className="h-14 flex-1 bg-transparent text-[16px] outline-none placeholder:text-espresso-400 dark:text-cream-50"
          aria-label="Search"
        />
        <kbd className="kbd text-espresso-500">esc</kbd>
      </div>
      <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
        {rows.map((row, index) => {
          const showGroup = row.group !== lastGroup
          lastGroup = row.group
          const active = index === activeIndex
          return (
            <li key={`${row.group}-${row.id ?? row.to}`}>
              {showGroup && <p className="eyebrow px-3 pt-3 pb-1.5">{row.group}</p>}
              <button
                type="button"
                role="option"
                aria-selected={active}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => run(row)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                  active ? 'bg-cream-100 dark:bg-white/10' : ''
                }`}
              >
                {row.person ? (
                  <Avatar name={row.label} size="sm" />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 dark:bg-white/10">
                    {row.icon && <row.icon className="size-4" />}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{row.label}</span>
                  {row.sublabel && <span className="block truncate text-xs text-espresso-500">{row.sublabel}</span>}
                </span>
                {active && <CornerDownLeft className="size-4 text-espresso-600" />}
              </button>
            </li>
          )
        })}
        {!rows.length && <li className="px-4 py-8 text-center text-sm text-espresso-500">No results for “{query}”</li>}
      </ul>
    </dialog>
  )
}
