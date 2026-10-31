import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Gift, IndianRupee, Plus, ReceiptText, UserPlus } from 'lucide-react'

import Avatar from '../../components/Avatar'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import StatTile from '../../components/StatTile'
import CustomerLookup from '../../features/counter/CustomerLookup'
import {
  selectBills,
  selectCurrentUser,
  selectCustomers,
  selectLookups,
  selectOffers,
  selectRewards,
} from '../../app/selectors'
import { describeReward } from '../../features/offers/offersEngine'
import { formatCurrency, formatRelative } from '../../utils/format'

const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function useTodayStats() {
  const bills = useSelector(selectBills)
  const customers = useSelector(selectCustomers)
  const rewards = useSelector(selectRewards)

  return useMemo(() => {
    const today = new Date().toDateString()
    const isToday = (iso) => new Date(iso).toDateString() === today
    const todaysBills = bills.filter((bill) => bill.status === 'active' && isToday(bill.createdAt))
    const todaysBillIds = new Set(todaysBills.map((bill) => bill.id))
    return {
      billCount: todaysBills.length,
      revenue: todaysBills.reduce((sum, bill) => sum + bill.total, 0),
      newCustomers: customers.filter((customer) => isToday(customer.createdAt)).length,
      rewardsRedeemed: rewards.filter(
        (reward) => reward.status === 'redeemed' && todaysBillIds.has(reward.redeemedBillId),
      ).length,
    }
  }, [bills, customers, rewards])
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <section className="card min-w-0 overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <h2 className="display-title text-[22px] leading-tight">{title}</h2>
          {subtitle && <p className="text-[13px] text-espresso-500">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

export default function CounterPage() {
  const user = useSelector(selectCurrentUser)
  const customers = useSelector(selectCustomers)
  const bills = useSelector(selectBills)
  const rewards = useSelector(selectRewards)
  const offers = useSelector(selectOffers)
  const lookups = useSelector(selectLookups)
  const stats = useTodayStats()
  const hello = greeting()

  const customersById = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers])
  const offersById = useMemo(() => Object.fromEntries(offers.map((o) => [o.id, o])), [offers])

  const availableRewards = rewards.filter((reward) => reward.status === 'available')
  const readyRewards = [...availableRewards].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)
  const recentBills = [...bills].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)

  return (
    <div className="space-y-5">
      <section className="relative animate-fade-up rounded-3xl bg-espresso-900 px-6 py-8 text-cream-50 shadow-lifted sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -top-40 -right-24 size-[440px] rounded-full bg-roast-500/30 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.04)_1px,transparent_1px)] [background-size:22px_22px]" />
        </div>
        <div className="relative">
          <p className="eyebrow text-cream-300">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="display-title mt-3 text-[44px] leading-none text-cream-50 sm:text-[60px]">
            {hello}, {user?.name.split(' ')[0]}
          </h1>
          <p className="mt-2 text-cream-300">Who&apos;s at the counter?</p>
          <div className="mt-6 max-w-2xl text-espresso-900">
            <CustomerLookup />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="accent" size="sm" icon={Plus} to="/bills/new">
              New bill
            </Button>
            <Button
              size="sm"
              icon={UserPlus}
              to="/customers?add=1"
              className="bg-white/10 text-cream-50 ring-1 ring-white/15 hover:bg-white/15"
            >
              Add customer
            </Button>
            <span className="ml-auto hidden items-center gap-1.5 self-center text-xs text-cream-300 sm:inline-flex">
              <kbd className="kbd">/</kbd> search here · <kbd className="kbd">⌘</kbd>
              <kbd className="kbd">K</kbd> anywhere
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile label="Bills today" value={stats.billCount} icon={ReceiptText} />
        <StatTile label="Sales today" value={formatCurrency(stats.revenue)} icon={IndianRupee} />
        <StatTile label="New members" value={stats.newCustomers} icon={UserPlus} />
        <StatTile tone="blush" label="Rewards redeemed" value={stats.rewardsRedeemed} icon={Gift} />
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-2">
          <SectionCard
            title="Rewards waiting"
            subtitle="Give them a shout when they're in."
            action={
              <span className="tabular rounded-full bg-roast-50 px-2.5 py-0.5 text-sm font-medium text-roast-700">
                {availableRewards.length}
              </span>
            }
          >
            {readyRewards.length ? (
              <ul className="px-2 pb-2">
                {readyRewards.map((reward) => {
                  const customer = customersById[reward.customerId]
                  if (!customer) return null
                  return (
                    <li key={reward.id}>
                      <Link
                        to={`/customers/${customer.id}`}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-cream-100"
                      >
                        <Avatar name={customer.name} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{customer.name}</span>
                          <span className="block truncate text-[13px] font-medium text-roast-600">
                            {describeReward(offersById[reward.offerId], lookups)}
                          </span>
                        </span>
                        <span className="text-xs text-espresso-400 group-hover:hidden">{formatRelative(reward.createdAt)}</span>
                        <ArrowUpRight className="hidden size-4 group-hover:block" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <EmptyState icon={Gift} title="No rewards waiting" description="Unlocked rewards appear here." />
            )}
          </SectionCard>
        </div>

        <div className="min-w-0 lg:col-span-3">
          <SectionCard
            title="Recent bills"
            action={
              <Link
                to="/bills"
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold hover:bg-cream-100"
              >
                See all <ArrowUpRight className="size-4" />
              </Link>
            }
          >
            {recentBills.length ? (
              <ul className="px-2 pb-2">
                {recentBills.map((bill) => {
                  const customer = customersById[bill.customerId]
                  return (
                    <li key={bill.id} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-cream-100">
                      <Avatar name={customer?.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <Link to={`/customers/${customer?.id}`} className="block truncate text-sm font-semibold hover:underline">
                          {customer?.name}
                        </Link>
                        <p className="truncate text-[13px] text-espresso-500">
                          {bill.lines.map((line) => `${line.quantity}× ${line.name}`).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`tabular text-sm font-medium ${bill.status === 'void' ? 'text-espresso-400 line-through' : ''}`}
                        >
                          {formatCurrency(bill.total)}
                        </p>
                        <p className="text-xs text-espresso-400">{formatRelative(bill.createdAt)}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <EmptyState
                icon={ReceiptText}
                title="No bills yet"
                description="Your first sale of the day shows up here."
                action={
                  <Button variant="accent" icon={Plus} to="/bills/new">
                    New bill
                  </Button>
                }
              />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
