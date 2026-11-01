import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Cake,
  CreditCard,
  Gift,
  Mail,
  Pencil,
  Phone,
  Printer,
  ReceiptText,
  Sparkles,
  Users,
} from 'lucide-react'

import Avatar from '../../components/Avatar'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import LoyaltyCard from '../../components/LoyaltyCard'
import Modal from '../../components/Modal'
import StampProgress from '../../components/StampProgress'
import {
  selectBills,
  selectCurrentBusiness,
  selectLookups,
  selectOffers,
} from '../../app/selectors'
import { EditCustomerModal } from '../../features/customers/AddCustomerModal'
import { describeReward, describeRule } from '../../features/offers/offersEngine'
import { useCustomerLoyalty } from '../../hooks/useCustomerLoyalty'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format'

const REWARD_STATUS_TONE = { available: 'accent', redeemed: 'success', cancelled: 'neutral' }

function useCustomerBills(customerId) {
  const bills = useSelector(selectBills)
  return useMemo(
    () =>
      bills
        .filter((bill) => bill.customerId === customerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [bills, customerId],
  )
}

function favouriteItem(bills) {
  const counts = {}
  bills
    .filter((bill) => bill.status === 'active')
    .forEach((bill) =>
      bill.lines.forEach((line) => {
        counts[line.name] = (counts[line.name] ?? 0) + line.quantity
      }),
    )
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
}

export default function CustomerDetailPage() {
  const { customerId } = useParams()
  const loyalty = useCustomerLoyalty(customerId)
  const business = useSelector(selectCurrentBusiness)
  const offers = useSelector(selectOffers)
  const lookups = useSelector(selectLookups)
  const bills = useCustomerBills(customerId)
  const [showCard, setShowCard] = useState(false)
  const [editing, setEditing] = useState(false)

  if (!loyalty) {
    return (
      <EmptyState
        icon={Users}
        title="Customer not found"
        description="They may have been removed or belong to another business."
        action={<Button to="/customers">Back to customers</Button>}
      />
    )
  }

  const { customer, card, offerProgress, availableRewards, rewardHistory } = loyalty
  const offersById = Object.fromEntries(offers.map((offer) => [offer.id, offer]))
  const activeBills = bills.filter((bill) => bill.status === 'active')
  const spend = activeBills.reduce((sum, bill) => sum + bill.total, 0)
  const favourite = favouriteItem(bills)

  return (
    <>
      <Link to="/customers" className="mb-4 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold text-espresso-500 hover:bg-white hover:text-espresso-900">
        <ArrowLeft className="size-4" /> Customers
      </Link>

      <header className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={customer.name} size="lg" />
          <div>
            <h1 className="display-title text-[40px] leading-none sm:text-[44px]">{customer.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-espresso-500">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5" /> {customer.phone}
              </span>
              {customer.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5" /> {customer.email}
                </span>
              )}
              {customer.birthday && (
                <span className="inline-flex items-center gap-1.5">
                  <Cake className="size-3.5" />
                  {new Date(customer.birthday).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" icon={Pencil} onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button variant="secondary" icon={CreditCard} onClick={() => setShowCard(true)}>
            Card
          </Button>
          <Button variant="accent" icon={ReceiptText} to={`/bills/new?customer=${customer.id}`}>
            New bill
          </Button>
        </div>
      </header>

      {availableRewards.length > 0 && (
        <section className="mb-6 overflow-hidden rounded-3xl bg-tint-blush shadow-soft">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-roast-500">
              <Gift className="size-6" />
            </span>
            <div className="flex-1">
              <p className="display-title text-[22px] leading-tight">
                {availableRewards.length === 1 ? 'Reward ready to redeem' : `${availableRewards.length} rewards ready`}
              </p>
              <p className="text-sm text-espresso-700">
                {availableRewards.map((reward) => describeReward(offersById[reward.offerId], lookups)).join(' · ')}
              </p>
            </div>
            <Button variant="primary" to={`/bills/new?customer=${customer.id}&reward=${availableRewards[0].id}`}>
              Redeem on a bill
            </Button>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Visits', activeBills.length],
              ['Total spend', formatCurrency(spend)],
              ['Avg. bill', formatCurrency(activeBills.length ? spend / activeBills.length : 0)],
              ['Usual order', favourite ? favourite[0] : '—'],
            ].map(([label, value]) => (
              <div key={label} className="card p-4">
                <p className="text-[13px] font-medium text-espresso-500">{label}</p>
                <p className="tabular display-title mt-1 truncate text-[30px] leading-none">{value}</p>
              </div>
            ))}
          </section>

          <section className="card">
            <header className="flex items-center gap-2 border-b border-cream-200 px-5 py-4">
              <Sparkles className="size-4 text-roast-500" />
              <h2 className="display-title text-[22px] leading-tight">Offer progress</h2>
            </header>
            {offerProgress.length ? (
              <ul className="divide-y divide-cream-200">
                {offerProgress.map(({ offer, count, threshold }) => (
                  <li key={offer.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{offer.name}</p>
                      <p className="text-[13px] text-espresso-500">{describeRule({ ...offer, threshold }, lookups)}</p>
                    </div>
                    <div className="flex flex-col items-start gap-1.5 sm:items-end">
                      <StampProgress count={count} threshold={threshold} size="sm" />
                      <p className="text-xs text-espresso-500">
                        {threshold - count} more {offer.ruleType === 'bill_count' ? 'visit' : 'item'}
                        {threshold - count === 1 ? '' : 's'} to unlock
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Sparkles} title="No live offers" description="A manager can set offers up under Offers." />
            )}
          </section>

          <section className="card">
            <header className="border-b border-cream-200 px-5 py-4">
              <h2 className="display-title text-[22px] leading-tight">Visit history</h2>
            </header>
            {bills.length ? (
              <ul className="divide-y divide-cream-200">
                {bills.slice(0, 15).map((bill) => (
                  <li key={bill.id} className="flex items-start justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{formatDateTime(bill.createdAt)}</p>
                      <p className="truncate text-[13px] text-espresso-500">
                        {bill.lines.map((line) => `${line.quantity}× ${line.name}`).join(', ')}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`tabular text-sm font-semibold ${bill.status === 'void' ? 'text-espresso-400 line-through' : ''}`}>
                        {formatCurrency(bill.total)}
                      </p>
                      {bill.status === 'void' && <Badge tone="danger">Void</Badge>}
                      {bill.discount > 0 && bill.status === 'active' && <Badge tone="success">Reward used</Badge>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={ReceiptText} title="No visits yet" description="Their first bill will show up here." />
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <LoyaltyCard
            businessName={business.name}
            customerName={customer.name}
            cardNumber={card.cardNumber}
            memberSince={formatDate(customer.createdAt)}
            compact
          />

          <section className="card">
            <header className="border-b border-cream-200 px-5 py-4">
              <h2 className="display-title text-[22px] leading-tight">Reward history</h2>
            </header>
            {rewardHistory.length ? (
              <ul className="divide-y divide-cream-200">
                {rewardHistory.slice(0, 8).map((reward) => (
                  <li key={reward.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{offersById[reward.offerId]?.name}</p>
                      <p className="text-xs text-espresso-500">Earned {formatDate(reward.createdAt)}</p>
                    </div>
                    <Badge tone={REWARD_STATUS_TONE[reward.status]}>{reward.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-sm text-espresso-500">Nothing earned yet.</p>
            )}
          </section>
        </aside>
      </div>

      {editing && <EditCustomerModal customer={customer} onClose={() => setEditing(false)} />}
      <Modal
        open={showCard}
        onClose={() => setShowCard(false)}
        title="Loyalty card"
        description="Customers can screenshot this, or you can print it."
        footer={
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
            Print
          </Button>
        }
      >
        <LoyaltyCard
          businessName={business.name}
          customerName={customer.name}
          cardNumber={card.cardNumber}
          memberSince={formatDate(customer.createdAt)}
        />
      </Modal>
    </>
  )
}
