import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Gift, MessageSquare, Minus, Plus, ShoppingBag, Sparkles, Trash2, X } from 'lucide-react'

import Avatar from '../../components/Avatar'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import StampProgress from '../../components/StampProgress'
import CustomerLookup from '../../features/counter/CustomerLookup'
import { recordBill } from '../../features/billing/billingThunks'
import {
  computeRewardDiscount,
  describeReward,
  isOfferLive,
  unitsEarned,
} from '../../features/offers/offersEngine'
import { toastShown } from '../../features/ui/uiSlice'
import {
  selectCategories,
  selectItems,
  selectLookups,
  selectOffers,
} from '../../app/selectors'
import { useCustomerLoyalty } from '../../hooks/useCustomerLoyalty'
import { categoryIcon } from '../../utils/categoryIcon'
import { formatCurrency } from '../../utils/format'

const MAX_QUANTITY = 99

/** Cart state & derived totals for the bill being built. */
function useCart() {
  const [lines, setLines] = useState([])

  const add = (item) =>
    setLines((current) => {
      const existing = current.find((line) => line.itemId === item.id)
      if (existing) {
        return current.map((line) =>
          line === existing ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + 1) } : line,
        )
      }
      return [...current, { itemId: item.id, name: item.name, quantity: 1, unitPrice: item.price }]
    })

  const changeQuantity = (itemId, delta) =>
    setLines((current) =>
      current
        .map((line) =>
          line.itemId === itemId ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + delta) } : line,
        )
        .filter((line) => line.quantity > 0),
    )

  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
  return { lines, add, changeQuantity, clear: () => setLines([]), subtotal, itemCount }
}

function MenuGrid({ onAdd, lines }) {
  const allCategories = useSelector(selectCategories)
  const allItems = useSelector(selectItems)
  const items = allItems.filter((item) => item.active)
  // Hide categories with nothing on sale so staff never tap into an empty tab.
  const categories = allCategories.filter(
    (category) => category.active && items.some((item) => item.categoryId === category.id),
  )
  const categoriesById = Object.fromEntries(allCategories.map((category) => [category.id, category]))
  const [categoryId, setCategoryId] = useState('all')
  const [query, setQuery] = useState('')

  const quantities = Object.fromEntries(lines.map((line) => [line.itemId, line.quantity]))
  const visible = items.filter(
    (item) =>
      (categoryId === 'all' || item.categoryId === categoryId) &&
      item.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="display-title text-[22px] leading-tight">Tap to add</h2>
        <SearchInput
          className="sm:w-56"
          placeholder="Find item"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Find menu item"
        />
      </div>
      <div className="-mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {[{ id: 'all', name: 'All' }, ...categories].map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategoryId(category.id)}
            aria-pressed={categoryId === category.id}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition ${
              categoryId === category.id
                ? 'bg-espresso-900 text-cream-50'
                : 'bg-cream-100 text-espresso-600 hover:bg-cream-200 hover:text-espresso-900'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
        {visible.map((item) => {
          const Icon = categoryIcon(categoriesById[item.categoryId]?.name)
          const quantity = quantities[item.id]
          return (
          <button
            key={item.id}
            type="button"
            onClick={() => onAdd(item)}
            aria-label={`Add ${item.name}, ${formatCurrency(item.price)}${quantity ? `, ${quantity} in bill` : ''}`}
            className={`relative flex min-h-[104px] flex-col justify-between rounded-2xl p-4 text-left transition active:scale-[0.98] ${
              quantity
                ? 'bg-white ring-2 ring-espresso-900'
                : 'bg-cream-50 ring-1 ring-espresso-900/6 hover:bg-white hover:shadow-soft'
            }`}
          >
            <Icon className="size-4 text-espresso-400" strokeWidth={1.75} aria-hidden="true" />
            <span className="mt-3 pr-6 text-sm leading-snug font-medium">{item.name}</span>
            <span className="tabular mt-0.5 text-[13px] text-espresso-500">{formatCurrency(item.price)}</span>
            {quantity && (
              <span className="absolute top-3 right-3 flex size-6 animate-pop-in items-center justify-center rounded-full bg-espresso-900 text-[11px] font-medium text-cream-50">
                {quantity}
              </span>
            )}
          </button>
          )
        })}
      </div>
      {!visible.length && (
        <p className="py-10 text-center text-sm text-espresso-500">
          {items.length ? 'No items match your search.' : 'The menu is empty — ask a manager to add items.'}
        </p>
      )}
    </section>
  )
}

function BillSaved({ result, customerId, onNext }) {
  const navigate = useNavigate()
  const loyalty = useCustomerLoyalty(customerId)
  const offers = useSelector(selectOffers)
  const lookups = useSelector(selectLookups)
  const offersById = Object.fromEntries(offers.map((offer) => [offer.id, offer]))

  return (
    <div className="relative mx-auto max-w-xl">
      <div className="animate-pop-in overflow-hidden rounded-3xl bg-white shadow-lifted">
        <div className="bg-espresso-900 px-6 py-8 text-center text-cream-50">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-cream-50/10 ring-1 ring-white/15">
            <Check className="size-5 text-cream-50" strokeWidth={2} />
          </span>
          <p className="mt-3 text-sm text-cream-300">Bill saved for {loyalty.customer.name}</p>
          <p className="tabular display-title mt-1 text-[56px] leading-none text-cream-50">{formatCurrency(result.bill.total)}</p>
          {result.bill.discount > 0 && (
            <p className="mt-1 text-sm text-roast-200">Reward applied · saved {formatCurrency(result.bill.discount)}</p>
          )}
        </div>

        {result.newRewards.length > 0 && (
          <div className="flex items-start gap-3 border-b border-roast-100 bg-roast-50 px-6 py-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-roast-500 text-white">
              <Gift className="size-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="display-title text-xl">Reward unlocked</p>
              <p className="text-sm text-espresso-700">
                {result.newRewards.map((reward) => describeReward(offersById[reward.offerId], lookups)).join(' · ')} —
                ready on the next visit.
              </p>
              {result.smsDelivered && (
                <p className="mt-1 flex items-center gap-1 text-xs text-espresso-500">
                  <MessageSquare className="size-3" /> SMS sent to {loyalty.customer.phone}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4 px-6 py-5">
          <p className="eyebrow">Offer progress</p>
          {loyalty.offerProgress.map(({ offer, count, threshold }) => (
            <div key={offer.id} className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">{offer.name}</p>
              <StampProgress count={count} threshold={threshold} size="sm" />
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-t border-cream-200 bg-cream-50 px-6 py-4">
          <Button variant="secondary" className="flex-1" onClick={() => navigate(`/customers/${customerId}`)}>
            View customer
          </Button>
          <Button variant="accent" className="flex-1" icon={Plus} onClick={onNext}>
            Next bill
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function NewBillPage() {
  const dispatch = useDispatch()
  const [params, setParams] = useSearchParams()
  const customerId = params.get('customer')
  const loyalty = useCustomerLoyalty(customerId)
  const offers = useSelector(selectOffers)
  const { itemsById, categoriesById } = useSelector(selectLookups)
  const cart = useCart()
  const [rewardId, setRewardId] = useState(params.get('reward'))
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  const offersById = Object.fromEntries(offers.map((offer) => [offer.id, offer]))
  const lookups = { itemsById, categoriesById }
  const selectedReward = loyalty?.availableRewards.find((reward) => reward.id === rewardId)
  const discount = selectedReward
    ? computeRewardDiscount({
        offer: offersById[selectedReward.offerId],
        lines: cart.lines,
        subtotal: cart.subtotal,
        itemsById,
      })
    : 0

  // Live preview of the stamps this bill will earn before it's saved.
  const draftBill = { lines: cart.lines, subtotal: cart.subtotal, createdAt: new Date().toISOString() }
  const earnings = offers
    .filter((offer) => isOfferLive(offer) && offer.id !== selectedReward?.offerId)
    .map((offer) => ({ offer, units: unitsEarned(offer, draftBill, itemsById) }))
    .filter((entry) => entry.units > 0)

  const setCustomer = (id) => {
    const next = new URLSearchParams(params)
    if (id) next.set('customer', id)
    else next.delete('customer')
    next.delete('reward')
    setRewardId(null)
    setParams(next, { replace: true })
  }

  const save = async () => {
    setSaving(true)
    const action = await dispatch(recordBill({ customerId, lines: cart.lines, rewardId: selectedReward?.id }))
    setSaving(false)
    if (recordBill.fulfilled.match(action)) {
      setResult(action.payload)
    } else {
      dispatch(toastShown({ tone: 'error', title: 'Could not save the bill', description: 'Please try again.' }))
    }
  }

  const startNext = () => {
    setResult(null)
    cart.clear()
    setCustomer(null)
  }

  if (result) return <BillSaved result={result} customerId={customerId} onNext={startNext} />

  return (
    <>
      <PageHeader eyebrow="Counter" title="New bill" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          {!loyalty && (
            <section className="relative z-10 rounded-3xl bg-tint-sand p-5 shadow-soft">
              <h2 className="mb-3 display-title text-[22px] leading-tight">Who&apos;s paying?</h2>
              <CustomerLookup size="md" onSelect={(customer) => setCustomer(customer.id)} />
            </section>
          )}
          <MenuGrid onAdd={cart.add} lines={cart.lines} />
        </div>

        <aside id="cart" className="scroll-mt-20 lg:sticky lg:top-8 lg:self-start">
          <section className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft">
            <header className="border-b border-cream-200 p-5">
              {loyalty ? (
                <div className="flex items-center gap-3">
                  <Avatar name={loyalty.customer.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{loyalty.customer.name}</p>
                    <p className="font-mono text-xs text-espresso-500">{loyalty.card.cardNumber}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setCustomer(null)} aria-label="Change customer">
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-espresso-500">No customer selected yet.</p>
              )}
            </header>

            {cart.lines.length ? (
              <ul className="max-h-[320px] divide-y divide-cream-200 overflow-y-auto">
                {cart.lines.map((line) => (
                  <li key={line.itemId} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{line.name}</p>
                      <p className="tabular text-xs text-espresso-500">{formatCurrency(line.unitPrice)} each</p>
                    </div>
                    <div className="flex items-center rounded-lg border border-cream-300">
                      <button
                        type="button"
                        onClick={() => cart.changeQuantity(line.itemId, -1)}
                        className="p-1.5 text-espresso-600 hover:text-espresso-900"
                        aria-label={`Remove one ${line.name}`}
                      >
                        {line.quantity === 1 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
                      </button>
                      <span className="tabular w-6 text-center text-sm font-medium">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => cart.changeQuantity(line.itemId, 1)}
                        className="p-1.5 text-espresso-600 hover:text-espresso-900"
                        aria-label={`Add one ${line.name}`}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <p className="tabular w-16 text-right text-sm font-medium">
                      {formatCurrency(line.quantity * line.unitPrice)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={ShoppingBag} title="Bill is empty" description="Tap menu items to add them." />
            )}

            {loyalty?.availableRewards.length > 0 && (
              <div className="border-t border-cream-200 px-5 py-4">
                <p className="eyebrow mb-2 flex items-center gap-1.5 text-roast-600">
                  <Gift className="size-3" /> Apply a reward
                </p>
                <div className="space-y-1.5">
                  {loyalty.availableRewards.map((reward) => {
                    const offer = offersById[reward.offerId]
                    const checked = reward.id === rewardId
                    return (
                      <label
                        key={reward.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                          checked ? 'border-roast-400 bg-roast-50' : 'border-cream-200 hover:bg-cream-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-roast-500"
                          checked={checked}
                          onChange={() => setRewardId(checked ? null : reward.id)}
                        />
                        <span className="flex-1">{describeReward(offer, lookups)}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {earnings.length > 0 && loyalty && (
              <div className="border-t border-cream-200 px-5 py-3">
                <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-espresso-600">
                  <Sparkles className="size-3.5 text-roast-500" />
                  Earns{' '}
                  {earnings.map(({ offer, units }, index) => (
                    <span key={offer.id}>
                      <span className="font-medium text-espresso-800">+{units}</span> {offer.name}
                      {index < earnings.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </p>
              </div>
            )}

            <div className="space-y-1.5 border-t border-cream-200 bg-cream-50 px-5 py-4 text-sm">
              <div className="flex justify-between text-espresso-600">
                <span>Subtotal</span>
                <span className="tabular">{formatCurrency(cart.subtotal)}</span>
              </div>
              {selectedReward && (
                <div className="flex justify-between text-roast-600">
                  <span>Reward</span>
                  <span className="tabular">−{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between pt-1">
                <span className="font-semibold">Total</span>
                <span className="tabular display-title text-2xl">
                  {formatCurrency(Math.max(0, cart.subtotal - discount))}
                </span>
              </div>
              {selectedReward && discount === 0 && cart.lines.length > 0 && (
                <p className="text-xs text-amber-700">This reward doesn't apply to anything on this bill yet.</p>
              )}
              <Button
                size="lg"
                variant="accent"
                className="mt-3 w-full"
                disabled={!loyalty || !cart.lines.length || (selectedReward && discount === 0)}
                loading={saving}
                onClick={save}
              >
                {!loyalty ? 'Select a customer first' : cart.lines.length ? 'Save bill' : 'Add items to continue'}
              </Button>
            </div>
          </section>
        </aside>
      </div>

      {/* Phone/tablet: floating checkout bar so the total is always visible while browsing the menu */}
      {cart.itemCount > 0 && (
        <a
          href="#cart"
          className="fixed inset-x-4 bottom-24 z-10 flex animate-pop-in items-center justify-between rounded-full bg-espresso-900 py-2 pr-2 pl-5 text-cream-50 shadow-soft lg:hidden"
        >
          <span className="text-sm font-semibold">
            {cart.itemCount} item{cart.itemCount === 1 ? '' : 's'} ·{' '}
            <span className="tabular">{formatCurrency(Math.max(0, cart.subtotal - discount))}</span>
          </span>
          <span className="rounded-full bg-cream-50 px-4 py-2 text-sm font-medium text-espresso-900">Review →</span>
        </a>
      )}
    </>
  )
}
