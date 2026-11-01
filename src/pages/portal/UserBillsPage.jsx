import { Fragment, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  ChevronDown,
  ReceiptText,
  RotateCcw,
  Store,
} from 'lucide-react'

import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import SegmentedControl from '../../components/SegmentedControl'
import StatTile from '../../components/StatTile'
import { selectAllCustomerBills, selectCustomerMemberships } from '../../app/selectors'
import { formatCurrency, formatDateTime } from '../../utils/format'

const RANGES = { today: 1, week: 7, month: 30, all: Infinity }

export default function UserBillsPage() {
  const allBills = useSelector(selectAllCustomerBills)
  const memberships = useSelector(selectCustomerMemberships)

  const [range, setRange] = useState('all')
  const [selectedShopId, setSelectedShopId] = useState('all')
  const [query, setQuery] = useState('')
  const [expandedBillId, setExpandedBillId] = useState(null)
  const [now] = useState(() => Date.now())

  // Distinct businesses the user has memberships with
  const availableShops = useMemo(() => {
    const map = new Map()
    memberships.forEach(({ business }) => {
      if (business && !map.has(business.id)) {
        map.set(business.id, business)
      }
    })
    return Array.from(map.values())
  }, [memberships])

  // Filter bills by date range, coffee shop, and search query
  const filteredBills = useMemo(() => {
    const cutoff =
      range === 'today'
        ? new Date(new Date(now).toDateString()).getTime()
        : now - RANGES[range] * 86400000
    const text = query.trim().toLowerCase()

    return allBills
      .filter((bill) => new Date(bill.createdAt).getTime() >= cutoff)
      .filter((bill) => selectedShopId === 'all' || bill.businessId === selectedShopId)
      .filter((bill) => {
        if (!text) return true
        if (bill.id.toLowerCase().includes(text)) return true
        if (bill.business?.name.toLowerCase().includes(text)) return true
        return bill.lines.some((line) => line.name.toLowerCase().includes(text))
      })
  }, [allBills, range, selectedShopId, query, now])

  // Active metrics for the filtered view
  const activeBills = filteredBills.filter((bill) => bill.status === 'active')
  const totalSpend = activeBills.reduce((sum, bill) => sum + bill.total, 0)
  const allActiveBills = allBills.filter((bill) => bill.status === 'active')
  const allTotalSpend = allActiveBills.reduce((sum, bill) => sum + bill.total, 0)

  const clearFilters = () => {
    setRange('all')
    setSelectedShopId('all')
    setQuery('')
  }

  const isFiltered = range !== 'all' || selectedShopId !== 'all' || query.trim() !== ''

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Member Access"
        title="My Bills & Receipts"
        description="All your purchase receipts and itemized order histories across coffee shops."
      />

      {/* 2. Summary KPI Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="Total Purchases"
          value={allActiveBills.length}
          detail="Across all registered coffee shops"
          icon={ReceiptText}
        />
        <StatTile
          label="Total Spent"
          value={formatCurrency(allTotalSpend)}
          detail={`Filtered view: ${formatCurrency(totalSpend)}`}
          icon={ReceiptText}
          tone="sand"
        />
        <StatTile
          label="Coffee Shops Visited"
          value={availableShops.length}
          detail={`${availableShops.map((s) => s.name).join(', ')}`}
          icon={Store}
          tone="mist"
        />
      </div>

      {/* 3. Filters Toolbar */}
      <div className="space-y-3">
        {/* Coffee Shop Filter Bar */}
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wider text-espresso-500 uppercase">
            Filter by Coffee Shop
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedShopId('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                selectedShopId === 'all'
                  ? 'bg-espresso-900 text-cream-50 shadow-sm'
                  : 'border border-cream-300 bg-white text-espresso-700 hover:bg-cream-100'
              }`}
            >
              All Coffee Shops ({allBills.length})
            </button>
            {availableShops.map((shop) => {
              const shopCount = allBills.filter((b) => b.businessId === shop.id).length
              const isSelected = selectedShopId === shop.id
              return (
                <button
                  key={shop.id}
                  type="button"
                  onClick={() => setSelectedShopId(shop.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? 'bg-espresso-900 text-cream-50 shadow-sm'
                      : 'border border-cream-300 bg-white text-espresso-700 hover:bg-cream-100'
                  }`}
                >
                  <Store className="size-3" />
                  <span>{shop.name}</span>
                  <span className={`tabular ${isSelected ? 'text-cream-300' : 'text-espresso-400'}`}>
                    ({shopCount})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Date Filter & Search Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
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

          <div className="flex items-center gap-2">
            <SearchInput
              className="sm:w-72"
              placeholder="Search items, café or bill..."
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
      </div>

      {/* 4. Bills Table */}
      <div className="card overflow-hidden">
        {filteredBills.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-cream-200 text-[11px] font-medium tracking-[0.12em] text-espresso-500 uppercase">
                <tr>
                  <th className="w-8 px-3 py-3" />
                  <th className="px-3 py-3 font-medium">Date & Time</th>
                  <th className="px-3 py-3 font-medium">Coffee Shop</th>
                  <th className="px-3 py-3 font-medium">Items Ordered</th>
                  <th className="px-3 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filteredBills.map((bill) => {
                  const expanded = expandedBillId === bill.id
                  const isVoid = bill.status === 'void'
                  const itemCount = bill.lines.reduce((sum, line) => sum + line.quantity, 0)

                  return (
                    <Fragment key={bill.id}>
                      <tr className={isVoid ? 'bg-cream-50/60 text-espresso-400' : 'hover:bg-cream-50/40'}>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => setExpandedBillId(expanded ? null : bill.id)}
                            className="rounded p-1 text-espresso-400 hover:bg-cream-100 hover:text-espresso-700"
                            aria-label={expanded ? 'Hide items' : 'Show items'}
                            aria-expanded={expanded}
                          >
                            <ChevronDown className={`size-4 transition ${expanded ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">{formatDateTime(bill.createdAt)}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="font-medium text-espresso-900">{bill.business?.name ?? 'Café'}</span>
                          <span className="ml-1 text-xs text-espresso-500">· {bill.business?.city}</span>
                        </td>
                        <td className="max-w-[280px] truncate px-3 py-3 text-espresso-700">
                          <span className="font-medium text-espresso-900">{itemCount} items</span>
                          <span className="ml-1 text-xs text-espresso-500">
                            ({bill.lines.map((l) => l.name).join(', ')})
                          </span>
                          {bill.discount > 0 && (
                            <Badge tone="success" className="ml-2">
                              Reward applied
                            </Badge>
                          )}
                        </td>
                        <td className={`tabular px-3 py-3 text-right font-semibold ${isVoid ? 'line-through text-espresso-400' : 'text-espresso-900'}`}>
                          {formatCurrency(bill.total)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge tone={isVoid ? 'danger' : 'success'}>
                            {isVoid ? 'Void' : 'Completed'}
                          </Badge>
                        </td>
                      </tr>

                      {/* Expanded Item Breakdown */}
                      {expanded && (
                        <tr className="bg-cream-50">
                          <td />
                          <td colSpan={5} className="px-3 pt-2 pb-4">
                            <div className="max-w-lg rounded-xl border border-cream-200 bg-white p-4 shadow-card">
                              <div className="mb-2 flex items-center justify-between border-b border-cream-100 pb-2">
                                <p className="text-[11px] font-semibold tracking-wider text-espresso-500 uppercase">
                                  {bill.business?.name} · Receipt {bill.id}
                                </p>
                                <span className="text-xs text-espresso-400">{formatDateTime(bill.createdAt)}</span>
                              </div>
                              <ul className="space-y-1.5 text-[13px]">
                                {bill.lines.map((line) => (
                                  <li key={line.itemId} className="flex justify-between text-espresso-700">
                                    <span>
                                      {line.quantity}× {line.name}
                                    </span>
                                    <span className="tabular font-medium text-espresso-900">
                                      {formatCurrency(line.quantity * line.unitPrice)}
                                    </span>
                                  </li>
                                ))}
                                {bill.discount > 0 && (
                                  <li className="flex justify-between border-t border-cream-100 pt-1 text-roast-600">
                                    <span>Loyalty Reward Discount</span>
                                    <span className="tabular">−{formatCurrency(bill.discount)}</span>
                                  </li>
                                )}
                                <li className="flex justify-between border-t border-cream-200 pt-2 font-semibold text-espresso-900">
                                  <span>Total Paid</span>
                                  <span className="tabular">{formatCurrency(bill.total)}</span>
                                </li>
                              </ul>
                              {isVoid && bill.voidReason && (
                                <p className="mt-2 text-xs text-red-700">Void note: {bill.voidReason}</p>
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
            <EmptyState
              icon={ReceiptText}
              title="No bills found"
              description="No transaction receipts matched your current filter criteria."
              action={
                isFiltered ? (
                  <Button variant="ghost" icon={RotateCcw} onClick={clearFilters}>
                    Clear all filters
                  </Button>
                ) : null
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
