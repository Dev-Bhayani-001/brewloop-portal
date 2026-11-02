import { Fragment, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, ReceiptText, RotateCcw } from 'lucide-react'

import Badge from '../../components/Badge'
import Button from '../../components/Button'
import CafePicker from '../../features/loyalty/CafePicker'
import EmptyState from '../../components/EmptyState'
import SearchInput from '../../components/SearchInput'
import SegmentedControl from '../../components/SegmentedControl'
import { selectAllCustomerBills, selectWallet } from '../../app/selectors'
import { activeCafeSelected } from '../../features/ui/uiSlice'
import { formatCurrency, formatDateTime, formatRelative } from '../../utils/format'

const RANGES = { today: 1, week: 7, month: 30, all: Infinity }

function BillsSummary({ title, subtitle, tone, stats }) {
  return (
    <section className={`${tone} wallet-surface rounded-3xl p-6 text-cream-50 shadow-lifted ring-white/10 sm:p-8 dark:ring-1`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div key={title} className="min-w-0 animate-fade-up">
          <p className="text-[13px] font-medium text-cream-200">My bills</p>
          <h1 className="display-title mt-1 truncate text-[40px] leading-[1.1] text-cream-50 sm:text-[52px]">{title}</h1>
          <p className="mt-1 text-[13px] text-[var(--tone-ink)]">{subtitle}</p>
        </div>
        <dl className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-xs text-cream-200">{stat.label}</dt>
              <dd className="tabular display-title mt-0.5 text-[28px] leading-none whitespace-nowrap text-cream-50">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default function UserBillsPage() {
  const dispatch = useDispatch()
  const allBills = useSelector(selectAllCustomerBills)
  const { cards, activeEntry } = useSelector(selectWallet)

  const [range, setRange] = useState('all')
  const [query, setQuery] = useState('')
  const [expandedBillId, setExpandedBillId] = useState(null)
  const [now] = useState(() => Date.now())
  // Tied to the café it was chosen on, so picking a café in the sidebar leaves "All cafés".
  const [allCafesFromId, setAllCafesFromId] = useState(null)

  const activeCafeId = activeEntry?.business?.id ?? null
  const showAllCafes = !activeEntry || allCafesFromId === activeCafeId

  const cafeOptions = useMemo(() => {
    const countByCafe = {}
    allBills.forEach((bill) => {
      countByCafe[bill.businessId] = (countByCafe[bill.businessId] ?? 0) + 1
    })
    return cards
      .map((entry) => ({ entry, billCount: countByCafe[entry.business?.id] ?? 0 }))
      .sort((a, b) => b.billCount - a.billCount || a.entry.business?.name.localeCompare(b.entry.business?.name))
  }, [allBills, cards])

  // Filter bills by café, date range, and search query
  const filteredBills = useMemo(() => {
    const cutoff =
      range === 'today'
        ? new Date(new Date(now).toDateString()).getTime()
        : now - RANGES[range] * 86400000
    const text = query.trim().toLowerCase()

    return allBills
      .filter((bill) => showAllCafes || bill.businessId === activeCafeId)
      .filter((bill) => new Date(bill.createdAt).getTime() >= cutoff)
      .filter((bill) => {
        if (!text) return true
        if (bill.id.toLowerCase().includes(text)) return true
        if (bill.business?.name.toLowerCase().includes(text)) return true
        return bill.lines.some((line) => line.name.toLowerCase().includes(text))
      })
  }, [allBills, range, showAllCafes, activeCafeId, query, now])

  // The summary follows the filters, so its numbers always describe the list below it.
  const paidBills = filteredBills.filter((bill) => bill.status === 'active')
  const totalSpend = paidBills.reduce((sum, bill) => sum + bill.total, 0)
  const totalSaved = paidBills.reduce((sum, bill) => sum + bill.discount, 0)
  const lastVisit = paidBills[0]?.createdAt
  const cafesVisited = new Set(paidBills.map((bill) => bill.businessId)).size

  const stats = [
    { label: 'Visits', value: paidBills.length },
    { label: 'Spent', value: formatCurrency(totalSpend) },
    { label: 'Saved with rewards', value: formatCurrency(totalSaved) },
    showAllCafes
      ? { label: 'Cafés visited', value: cafesVisited }
      : { label: 'Last visit', value: lastVisit ? formatRelative(lastVisit) : '—' },
  ]

  const handleCafeSelect = (cafeId) => {
    setAllCafesFromId(null)
    dispatch(activeCafeSelected(cafeId))
  }

  const clearFilters = () => {
    setRange('all')
    setQuery('')
  }

  const isFiltered = range !== 'all' || query.trim() !== ''

  return (
    <div className="space-y-5 lg:space-y-6">
      <BillsSummary
        tone={activeEntry?.tone ?? 'tone-roast'}
        title={showAllCafes ? 'All cafés' : activeEntry.business?.name}
        subtitle={showAllCafes ? `${cards.length} ${cards.length === 1 ? 'membership' : 'memberships'}` : activeEntry.business?.city}
        stats={stats}
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {cards.length > 1 && (
            <CafePicker
              cafes={cafeOptions}
              selectedId={showAllCafes ? null : activeCafeId}
              allCount={allBills.length}
              onSelect={handleCafeSelect}
              onSelectAll={() => setAllCafesFromId(activeCafeId)}
            />
          )}
          <SegmentedControl
            value={range}
            onChange={setRange}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: '7 days' },
              { value: 'month', label: '30 days' },
              { value: 'all', label: 'All time' },
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <SearchInput
            className="w-full xl:w-72"
            placeholder={showAllCafes ? 'Search items, café or bill...' : 'Search items or bill...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isFiltered && (
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={clearFilters}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* 4. Bills Table */}
      <div className="card overflow-hidden">
        {filteredBills.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm sm:min-w-[700px]">
              <thead className="border-b border-cream-200 text-[11px] font-medium tracking-[0.12em] text-espresso-500 uppercase dark:border-white/10 dark:text-cream-300/70">
                <tr>
                  <th className="w-8 px-3 py-3" />
                  <th className="px-3 py-3 font-medium">Date & Time</th>
                  {showAllCafes && <th className="px-3 py-3 font-medium">Coffee Shop</th>}
                  <th className="px-3 py-3 font-medium">Items Ordered</th>
                  <th className="px-3 py-3 text-right font-medium">Total</th>
                  <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200 dark:divide-white/10">
                {filteredBills.map((bill) => {
                  const expanded = expandedBillId === bill.id
                  const isVoid = bill.status === 'void'
                  const itemCount = bill.lines.reduce((sum, line) => sum + line.quantity, 0)

                  return (
                    <Fragment key={bill.id}>
                      <tr className={isVoid ? 'bg-cream-50/60 text-espresso-400 dark:bg-white/5 dark:text-espresso-500' : 'hover:bg-cream-50/40 dark:hover:bg-white/5'}>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => setExpandedBillId(expanded ? null : bill.id)}
                            className="rounded p-1 text-espresso-400 hover:bg-cream-100 hover:text-espresso-700 dark:text-cream-300/60 dark:hover:bg-white/10 dark:hover:text-cream-50"
                            aria-label={expanded ? 'Hide items' : 'Show items'}
                            aria-expanded={expanded}
                          >
                            <ChevronDown className={`size-4 transition ${expanded ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-espresso-700 dark:text-cream-200">{formatDateTime(bill.createdAt)}</td>
                        {showAllCafes && (
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="font-medium text-espresso-900 dark:text-cream-50">{bill.business?.name ?? 'Café'}</span>
                            <span className="ml-1 text-xs text-espresso-500 dark:text-cream-300/70">· {bill.business?.city}</span>
                          </td>
                        )}
                        <td className="truncate px-3 py-3 whitespace-nowrap sm:max-w-[280px] text-espresso-700 dark:text-cream-200">
                          <span className="font-medium text-espresso-900 dark:text-cream-50">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                          <span className="ml-1 hidden text-xs text-espresso-500 sm:inline dark:text-cream-300/70">
                            ({bill.lines.map((l) => l.name).join(', ')})
                          </span>
                          {bill.discount > 0 && (
                            <span className="ml-2 hidden sm:inline">
                              <Badge tone="success">Reward applied</Badge>
                            </span>
                          )}
                        </td>
                        <td className={`tabular px-3 py-3 pr-4 text-right font-semibold sm:pr-3 ${isVoid ? 'line-through text-espresso-400 dark:text-espresso-500' : 'text-espresso-900 dark:text-cream-50'}`}>
                          {formatCurrency(bill.total)}
                        </td>
                        <td className="hidden px-4 py-3 text-right sm:table-cell">
                          <Badge tone={isVoid ? 'danger' : 'success'}>
                            {isVoid ? 'Void' : 'Completed'}
                          </Badge>
                        </td>
                      </tr>

                      {/* Expanded Item Breakdown */}
                      {expanded && (
                        <tr className="bg-cream-50 dark:bg-[#141210]">
                          <td className="hidden sm:table-cell" />
                          <td colSpan={showAllCafes ? 5 : 4} className="px-3 pt-2 pb-4">
                            <div className="max-w-lg rounded-xl border border-cream-200 bg-white p-4 shadow-card dark:border-white/10 dark:bg-[#1a1714]">
                              <div className="mb-2 flex items-center justify-between border-b border-cream-100 pb-2 dark:border-white/10">
                                <p className="text-[11px] font-semibold tracking-wider text-espresso-500 uppercase dark:text-cream-300/70">
                                  {bill.business?.name} · Receipt {bill.id}
                                </p>
                                <span className="text-xs text-espresso-400 dark:text-cream-300/60">{formatDateTime(bill.createdAt)}</span>
                              </div>
                              <ul className="space-y-1.5 text-[13px]">
                                {bill.lines.map((line) => (
                                  <li key={line.itemId} className="flex justify-between text-espresso-700 dark:text-cream-200">
                                    <span>
                                      {line.quantity}× {line.name}
                                    </span>
                                    <span className="tabular font-medium text-espresso-900 dark:text-cream-50">
                                      {formatCurrency(line.quantity * line.unitPrice)}
                                    </span>
                                  </li>
                                ))}
                                {bill.discount > 0 && (
                                  <li className="flex justify-between border-t border-cream-100 pt-1 text-roast-600 dark:border-white/10 dark:text-roast-200">
                                    <span>Loyalty Reward Discount</span>
                                    <span className="tabular">−{formatCurrency(bill.discount)}</span>
                                  </li>
                                )}
                                <li className="flex justify-between border-t border-cream-200 pt-2 font-semibold text-espresso-900 dark:border-white/10 dark:text-cream-50">
                                  <span>Total Paid</span>
                                  <span className="tabular">{formatCurrency(bill.total)}</span>
                                </li>
                              </ul>
                              {isVoid && bill.voidReason && (
                                <p className="mt-2 text-xs text-red-700 dark:text-red-400">Void note: {bill.voidReason}</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            {isFiltered ? (
              <EmptyState
                icon={ReceiptText}
                title="No bills found"
                description="No receipts match these filters."
                action={
                  <Button variant="ghost" icon={RotateCcw} onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={ReceiptText}
                title={showAllCafes ? 'No bills yet' : `No bills at ${activeEntry.business?.name} yet`}
                description="Receipts appear here after your first visit."
                action={
                  !showAllCafes && allBills.length > 0 ? (
                    <Button variant="ghost" onClick={() => setAllCafesFromId(activeCafeId)}>
                      See all cafés
                    </Button>
                  ) : null
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
