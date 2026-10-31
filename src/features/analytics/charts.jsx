/**
 * Lightweight HTML/CSS charts (no chart library).
 * Single-series charts use one hue (roast); the two-series split uses a
 * validated CVD-safe pair (roast #cf5f22 / blue #2a78d6) with a legend + direct labels.
 */
import { useState } from 'react'

import { formatCurrency, formatNumber } from '../../utils/format'

export const SERIES_NEW = 'bg-[#cf5f22]'
export const SERIES_RETURNING = 'bg-[#2a78d6]'

/** Daily bills as thin vertical bars with a hover tooltip. */
export function DailyBarChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const max = Math.max(1, ...data.map((day) => day.bills))
  const hovered = hoverIndex !== null ? data[hoverIndex] : null
  const tickEvery = Math.ceil(data.length / 6)
  const label = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  return (
    <div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {[max, Math.round(max / 2), 0].map((tick) => (
            <div key={tick} className="flex items-center gap-2">
              <span className="tabular w-6 text-right text-[11px] text-espresso-400">{tick}</span>
              <span className="h-px flex-1 bg-cream-200" />
            </div>
          ))}
        </div>
        <div className="relative ml-8 flex h-48 items-end gap-[2px]" onMouseLeave={() => setHoverIndex(null)}>
          {data.map((day, index) => (
            <div
              key={day.date}
              className="flex h-full flex-1 cursor-default items-end"
              onMouseEnter={() => setHoverIndex(index)}
            >
              <div
                className={`w-full rounded-t-[4px] transition ${
                  hoverIndex === null || hoverIndex === index ? 'bg-[#cf5f22]' : 'bg-[#cf5f22]/40'
                }`}
                style={{ height: `${(day.bills / max) * 100}%`, minHeight: day.bills ? 2 : 0 }}
              />
            </div>
          ))}
          {hovered && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-espresso-900 px-3 py-2 text-xs whitespace-nowrap text-cream-50 shadow-pop"
              style={{ left: `${((hoverIndex + 0.5) / data.length) * 100}%` }}
            >
              <p className="font-medium">{label(hovered.date)}</p>
              <p className="text-cream-300">
                {hovered.bills} bills · {formatCurrency(hovered.revenue)}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 ml-8 flex">
        {data.map((day, index) => (
          <span key={day.date} className="flex-1 text-center text-[11px] whitespace-nowrap text-espresso-400">
            {index % tickEvery === 0 ? label(day.date) : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Ranked horizontal bars; value text stays in ink colours, the bar carries magnitude. */
export function RankedBars({ rows, valueKey, format = formatNumber, emptyText = 'No data in this period.' }) {
  const max = Math.max(1, ...rows.map((row) => row[valueKey]))
  if (!rows.length) return <p className="py-6 text-center text-sm text-espresso-500">{emptyText}</p>
  return (
    <ol className="space-y-3">
      {rows.map((row, index) => (
        <li key={row.id} className="group" title={`${row.label}: ${format(row[valueKey])}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">
              <span className="tabular mr-2 text-espresso-400">{index + 1}</span>
              {row.label}
            </span>
            <span className="tabular font-medium">{format(row[valueKey])}</span>
          </div>
          <div className="h-2 rounded-full bg-cream-100">
            <div
              className="h-full rounded-full bg-[#cf5f22] transition-[width] group-hover:bg-roast-600"
              style={{ width: `${(row[valueKey] / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Two-part proportion bar (new vs returning) with legend and direct labels. */
export function SplitBar({ first, second }) {
  const total = first.value + second.value || 1
  const parts = [
    { ...first, color: SERIES_NEW },
    { ...second, color: SERIES_RETURNING },
  ]
  return (
    <div>
      <div className="flex h-4 gap-[2px] overflow-hidden rounded-full">
        {parts.map((part) =>
          part.value ? (
            <div
              key={part.label}
              className={`${part.color} first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${(part.value / total) * 100}%` }}
              title={`${part.label}: ${part.value}`}
            />
          ) : null,
        )}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        {parts.map((part) => (
          <div key={part.label}>
            <dt className="flex items-center gap-2 text-[13px] text-espresso-600">
              <span className={`size-2.5 rounded-full ${part.color}`} /> {part.label}
            </dt>
            <dd className="tabular mt-1 text-2xl font-semibold">
              {part.value}
              <span className="ml-1.5 text-sm font-normal text-espresso-500">
                {Math.round((part.value / total) * 100)}%
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
