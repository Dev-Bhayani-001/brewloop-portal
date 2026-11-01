import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Coffee,
  CreditCard,
  Gift,
  HelpCircle,
  MapPin,
  Store,
} from 'lucide-react'

import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'
import LoyaltyCard from '../../components/LoyaltyCard'
import PageHeader from '../../components/PageHeader'
import StampProgress from '../../components/StampProgress'
import StatTile from '../../components/StatTile'
import { selectCustomerCards, selectItems } from '../../app/selectors'
import { formatCurrency, formatDate } from '../../utils/format'

export default function UserLoyaltyPage() {
  const cards = useSelector(selectCustomerCards)
  const menuItems = useSelector(selectItems)
  const [selectedShopId, setSelectedShopId] = useState(null)

  // Default to the first card if not selected
  const activeCardEntry = useMemo(() => {
    if (!cards.length) return null
    if (selectedShopId) {
      return cards.find((c) => c.business?.id === selectedShopId) ?? cards[0]
    }
    return cards[0]
  }, [cards, selectedShopId])

  // Total rewards across all cards
  const totalRewardsCount = useMemo(
    () => cards.reduce((sum, c) => sum + (c.availableRewards?.length ?? 0), 0),
    [cards],
  )

  // Active coffee stamp offer for current active card
  const coffeeProgress = activeCardEntry?.offerProgress.find(
    (p) => p.offer.ruleType === 'item_count' || p.offer.name.toLowerCase().includes('coffee'),
  ) ?? activeCardEntry?.offerProgress[0]

  const coffeeRemaining = coffeeProgress
    ? Math.max(0, coffeeProgress.threshold - coffeeProgress.count)
    : 0

  // Qualifying coffee items for the active shop
  const qualifyingCoffeeItems = useMemo(() => {
    if (!activeCardEntry?.business?.id) return []
    return menuItems.filter(
      (item) =>
        item.businessId === activeCardEntry.business.id &&
        item.active &&
        (item.categoryId?.includes('cat_0') ||
          item.name.toLowerCase().includes('coffee') ||
          ['espresso', 'cappuccino', 'flat white', 'cold brew', 'latte', 'chai'].some((c) =>
            item.name.toLowerCase().includes(c),
          )),
    )
  }, [menuItems, activeCardEntry])

  if (!cards.length) {
    return (
      <EmptyState
        icon={HelpCircle}
        title="No loyalty cards found"
        description="You do not have any active café loyalty cards linked to this account yet."
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Member Access"
        title="My Loyalty Cards"
        description="View your digital loyalty cards across coffee shops, track coffee stamps, and redeem rewards."
      />

      {/* 2. Top Summary KPI Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="My Loyalty Cards"
          value={cards.length}
          detail={`${cards.length} café membership${cards.length === 1 ? '' : 's'}`}
          icon={CreditCard}
        />
        <StatTile
          label="Current Coffee Stamps"
          value={coffeeProgress ? `${coffeeProgress.count} / ${coffeeProgress.threshold}` : '0'}
          detail={
            coffeeRemaining > 0
              ? `${coffeeRemaining} more coffee${coffeeRemaining === 1 ? '' : 's'} to free reward`
              : 'Free reward ready!'
          }
          icon={Coffee}
          tone="sand"
        />
        <StatTile
          label="Available Rewards"
          value={totalRewardsCount}
          detail={
            totalRewardsCount > 0
              ? `${totalRewardsCount} reward${totalRewardsCount === 1 ? '' : 's'} ready across cafés`
              : 'Add coffees to earn stamps'
          }
          icon={Gift}
          tone={totalRewardsCount > 0 ? 'blush' : 'default'}
        />
      </div>

      {/* 3. Coffee Shop Card Switcher (if multiple cards) */}
      {cards.length > 1 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wider text-espresso-500 uppercase dark:text-cream-300/70">
            Select Coffee Shop Card
          </p>
          <div className="flex flex-wrap gap-2">
            {cards.map(({ business, card, availableRewards }) => {
              const isSelected = (activeCardEntry?.business?.id ?? cards[0].business?.id) === business?.id
              return (
                <button
                  key={business?.id ?? card?.id}
                  type="button"
                  onClick={() => setSelectedShopId(business?.id)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                    isSelected
                      ? 'bg-espresso-900 text-cream-50 shadow-soft dark:bg-[#2c2823] dark:text-cream-50 dark:ring-1 dark:ring-white/15'
                      : 'border border-cream-300 bg-white text-espresso-700 hover:bg-cream-100 hover:text-espresso-900 dark:border-white/10 dark:bg-[#1a1714] dark:text-cream-200 dark:hover:bg-white/10 dark:hover:text-cream-50'
                  }`}
                >
                  <Store className="size-4" />
                  <span>{business?.name}</span>
                  <span className={`text-xs ${isSelected ? 'text-cream-300' : 'text-espresso-400 dark:text-cream-300/70'}`}>
                    ({business?.city})
                  </span>
                  {availableRewards.length > 0 && (
                    <span className="flex size-2 rounded-full bg-roast-400" title="Reward available" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 4. Active Card Detail & Stamp Progress (2 Columns) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Loyalty Card */}
        <div className="space-y-3 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="display-title text-[22px]">Digital Pass</h2>
            <Badge tone="accent" icon={CreditCard}>
              {activeCardEntry?.business?.city ?? 'Active'}
            </Badge>
          </div>

          <LoyaltyCard
            businessName={activeCardEntry?.business?.name ?? 'Brewloop'}
            customerName={activeCardEntry?.customer?.name ?? 'Member'}
            cardNumber={activeCardEntry?.card?.cardNumber ?? 'KC-10001'}
            memberSince={formatDate(activeCardEntry?.customer?.createdAt)}
          />

          <p className="rounded-xl border border-cream-200 bg-white p-3 text-xs text-espresso-600 shadow-card dark:border-white/10 dark:bg-[#1a1714] dark:text-cream-200">
            💡 <strong className="font-medium text-espresso-900 dark:text-cream-50">Barista Scan:</strong> Show this card or QR code to the cashier at{' '}
            <strong>{activeCardEntry?.business?.name}</strong> when ordering to collect stamps.
          </p>
        </div>

        {/* Right Column: Coffee Progress & Rewards */}
        <div className="space-y-4 lg:col-span-7">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="display-title text-[22px]">Coffee Reward Progress</h2>
                <p className="mt-1 text-sm text-espresso-600 dark:text-cream-200/80">
                  Track how many coffee items you have added at {activeCardEntry?.business?.name}.
                </p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-roast-50 text-roast-600 dark:bg-roast-950/50 dark:text-roast-300">
                <Coffee className="size-5" />
              </span>
            </div>

            {/* Live Progress Bar / Stamp Dots */}
            {coffeeProgress && (
              <div className="mt-5 rounded-2xl bg-cream-50 p-4 ring-1 ring-cream-200 dark:bg-[#141210] dark:ring-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-espresso-900 dark:text-cream-50">{coffeeProgress.offer.name}</p>
                  <span className="text-xs font-medium text-espresso-500 dark:text-cream-300/70">
                    {coffeeProgress.count} of {coffeeProgress.threshold} stamps
                  </span>
                </div>

                <div className="mt-3">
                  <StampProgress count={coffeeProgress.count} threshold={coffeeProgress.threshold} size="md" />
                </div>

                <div className="mt-3 rounded-lg border border-cream-200 bg-white p-2.5 text-xs text-espresso-700 dark:border-white/10 dark:bg-[#1a1714] dark:text-cream-200">
                  {coffeeRemaining > 0 ? (
                    <span>
                      ☕ You have added <strong className="font-semibold text-espresso-900 dark:text-cream-50">{coffeeProgress.count}</strong> coffee items. Add{' '}
                      <strong className="font-semibold text-roast-600 dark:text-roast-400">{coffeeRemaining} more</strong> to unlock your free coffee reward!
                    </span>
                  ) : (
                    <span className="font-semibold text-leaf-700 dark:text-leaf-600">
                      🎉 Stamp goal reached! Your free coffee reward is unlocked.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Other active offers at this café */}
            {activeCardEntry?.offerProgress.length > 1 && (
              <div className="mt-4 space-y-2">
                {activeCardEntry.offerProgress
                  .filter((p) => p !== coffeeProgress)
                  .map((p) => (
                    <div key={p.offer.id} className="flex items-center justify-between rounded-xl border border-cream-200 bg-cream-50/50 p-3 text-xs dark:border-white/10 dark:bg-[#141210]">
                      <span className="font-medium text-espresso-800 dark:text-cream-100">{p.offer.name}</span>
                      <div className="flex items-center gap-3">
                        <StampProgress count={p.count} threshold={p.threshold} size="sm" />
                        <span className="text-espresso-500 dark:text-cream-300/70">{p.count}/{p.threshold}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Unlocked / Available Rewards */}
            {activeCardEntry?.availableRewards.length > 0 && (
              <div className="mt-4 rounded-2xl border border-leaf-600/20 bg-leaf-50 p-3.5 dark:border-leaf-700/30 dark:bg-[#142318]">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-leaf-700 dark:text-emerald-300">
                  <Gift className="size-4" /> Ready to Redeem ({activeCardEntry.availableRewards.length})
                </p>
                <div className="mt-2 space-y-1">
                  {activeCardEntry.availableRewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2 text-xs dark:bg-[#1a1714]/80">
                      <span className="font-medium text-espresso-900 dark:text-cream-50">{reward.name ?? 'Free Reward Voucher'}</span>
                      <Badge tone="success">Ready at checkout</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Qualifying Coffee Menu Items List */}
            {qualifyingCoffeeItems.length > 0 && (
              <div className="mt-5 border-t border-cream-200 pt-4 dark:border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-espresso-500 dark:text-cream-300/70">
                  Coffee Items You Can Add Towards Stamps
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {qualifyingCoffeeItems.slice(0, 8).map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cream-200 bg-white px-2.5 py-1 text-xs text-espresso-800 dark:border-white/10 dark:bg-[#141210] dark:text-cream-200"
                    >
                      <span>{item.name}</span>
                      <span className="tabular font-medium text-espresso-500 dark:text-cream-300/70">{formatCurrency(item.price)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. All My Cards Overview Section */}
      <div className="space-y-3">
        <h2 className="display-title text-[22px]">All My Membership Cards</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ business, card, customer, availableRewards }) => (
            <div
              key={business?.id ?? card?.id}
              onClick={() => setSelectedShopId(business?.id)}
              className="group cursor-pointer rounded-2xl border border-cream-200 bg-white p-4 shadow-card transition hover:border-espresso-900/30 hover:shadow-soft dark:border-white/10 dark:bg-[#1a1714] dark:hover:border-roast-400/40"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-espresso-900 dark:text-cream-50">{business?.name}</p>
                <Badge tone="neutral" icon={MapPin}>{business?.city}</Badge>
              </div>
              <p className="tabular mt-3 font-mono text-sm tracking-wider text-espresso-600 dark:text-cream-200">
                {card?.cardNumber}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-cream-100 pt-2 text-xs text-espresso-500 dark:border-white/10 dark:text-cream-300/70">
                <span>Member: {customer.name}</span>
                {availableRewards.length > 0 ? (
                  <Badge tone="accent">{availableRewards.length} reward</Badge>
                ) : (
                  <span className="text-espresso-400 dark:text-cream-300/60">Card Active</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
