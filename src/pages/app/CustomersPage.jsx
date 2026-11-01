import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, Gift, Search, UserPlus, Users } from 'lucide-react'

import Avatar from '../../components/Avatar'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import SegmentedControl from '../../components/SegmentedControl'
import AddCustomerModal from '../../features/customers/AddCustomerModal'
import { matchesCustomer } from '../../hooks/useCustomerSearch'
import {
  selectAvailableRewardCounts,
  selectCardsByCustomer,
  selectCustomers,
  selectCustomerStats,
} from '../../app/selectors'
import { formatCurrency, formatRelative } from '../../utils/format'

const LAPSED_DAYS = 30
const REGULAR_VISITS = 5
const PAGE_SIZE = 30

const SEGMENTS = {
  all: () => true,
  rewards: (row) => row.rewards > 0,
  regulars: (row) => row.visits >= REGULAR_VISITS,
  lapsed: (row, now) => row.lastVisit && (now - new Date(row.lastVisit).getTime()) / 86400000 > LAPSED_DAYS,
}

export default function CustomersPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const customers = useSelector(selectCustomers)
  const cards = useSelector(selectCardsByCustomer)
  const stats = useSelector(selectCustomerStats)
  const rewardCounts = useSelector(selectAvailableRewardCounts)
  const [query, setQuery] = useState('')
  const [segment, setSegment] = useState(params.get('filter') ?? 'all')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [now] = useState(() => Date.now())
  const adding = params.get('add') === '1'

  const setAdding = (open) => {
    const next = new URLSearchParams(params)
    if (open) next.set('add', '1')
    else next.delete('add')
    setParams(next, { replace: true })
  }

  const rows = useMemo(
    () =>
      customers
        .map((customer) => ({
          customer,
          card: cards[customer.id],
          visits: stats[customer.id]?.visits ?? 0,
          spend: stats[customer.id]?.spend ?? 0,
          lastVisit: stats[customer.id]?.lastVisit ?? null,
          rewards: rewardCounts[customer.id] ?? 0,
        }))
        // Most recent activity first; brand-new customers (no visits) by join date.
        .sort((a, b) => (b.lastVisit ?? b.customer.createdAt).localeCompare(a.lastVisit ?? a.customer.createdAt)),
    [customers, cards, stats, rewardCounts],
  )

  const filtered = rows.filter(
    (row) =>
      (SEGMENTS[segment] ?? SEGMENTS.all)(row, now) && (!query.trim() || matchesCustomer(row.customer, row.card, query)),
  )
  const counts = Object.fromEntries(
    Object.entries(SEGMENTS).map(([key, test]) => [key, rows.filter((row) => test(row, now)).length]),
  )

  return (
    <>
      <PageHeader
        eyebrow="Members"
        title="Customers"
        description="Everyone holding a loyalty card here."
        actions={
          <Button variant="accent" icon={UserPlus} onClick={() => setAdding(true)}>
            Add customer
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SegmentedControl
          label="Filter customers"
          value={segment}
          onChange={(value) => {
            setSegment(value)
            setVisible(PAGE_SIZE)
          }}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'rewards', label: 'Reward ready', count: counts.rewards },
            { value: 'regulars', label: 'Regulars', count: counts.regulars },
            { value: 'lapsed', label: 'Lapsed', count: counts.lapsed },
          ]}
        />
        <SearchInput
          className="md:w-80"
          placeholder="Search name, phone or card"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setVisible(PAGE_SIZE)
          }}
          aria-label="Search customers"
        />
      </div>

      <div className="card overflow-hidden">
        {filtered.length ? (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-cream-200 text-[11px] font-medium tracking-[0.12em] text-espresso-500 uppercase">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Customer</th>
                  <th className="px-5 py-3.5 font-medium">Card</th>
                  <th className="px-5 py-3.5 text-right font-medium">Visits</th>
                  <th className="px-5 py-3.5 text-right font-medium">Spend</th>
                  <th className="px-5 py-3.5 font-medium">Last visit</th>
                  <th className="px-5 py-3.5 font-medium">Rewards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filtered.slice(0, visible).map((row) => (
                  <tr
                    key={row.customer.id}
                    onClick={() => navigate(`/customers/${row.customer.id}`)}
                    className="group cursor-pointer transition hover:bg-cream-100"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={row.customer.name} size="sm" />
                        <div>
                          <Link
                            to={`/customers/${row.customer.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="font-semibold group-hover:underline"
                          >
                            {row.customer.name}
                          </Link>
                          <p className="text-[13px] text-espresso-500">{row.customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-[13px] text-espresso-600">{row.card?.cardNumber}</td>
                    <td className="tabular px-5 py-3 text-right font-semibold">
                      {row.visits}
                    </td>
                    <td className="tabular px-5 py-3 text-right">{formatCurrency(row.spend)}</td>
                    <td className="px-5 py-3 text-espresso-600">
                      {row.lastVisit ? formatRelative(row.lastVisit) : <Badge tone="new">New</Badge>}
                    </td>
                    <td className="px-5 py-3">
                      {row.rewards > 0 && (
                        <Badge tone="accent" icon={Gift}>
                          {row.rewards} ready
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="divide-y divide-cream-200 md:hidden">
              {filtered.slice(0, visible).map((row) => (
                <li key={row.customer.id}>
                  <Link to={`/customers/${row.customer.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-cream-100">
                    <Avatar name={row.customer.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{row.customer.name}</p>
                      <p className="truncate text-[13px] text-espresso-500">
                        {row.visits} visits · {row.lastVisit ? formatRelative(row.lastVisit) : 'new'}
                      </p>
                    </div>
                    {row.rewards > 0 && <Badge tone="accent" icon={Gift}>{row.rewards}</Badge>}
                    <ChevronRight className="size-4 text-espresso-400" />
                  </Link>
                </li>
              ))}
            </ul>

            {filtered.length > visible && (
              <div className="border-t border-cream-200 p-3 text-center">
                <Button variant="secondary" size="sm" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                  Show more ({filtered.length - visible} left)
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={query ? Search : Users}
            title={query ? 'No matches' : 'Nobody here yet'}
            description={query ? 'Try a different name, phone or card number.' : 'Add your first customer to issue a card.'}
            action={
              !query && (
                <Button variant="accent" icon={UserPlus} onClick={() => setAdding(true)}>
                  Add customer
                </Button>
              )
            }
          />
        )}
      </div>

      {adding && <AddCustomerModal open onClose={() => setAdding(false)} />}
    </>
  )
}
