/**
 * Business-scoped selectors. Every list is filtered by the signed-in user's
 * businessId — the API must apply the same filter server-side.
 */
import { createSelector } from '@reduxjs/toolkit'

import { getPlan, getPlanFeatures } from '../utils/planFeatures'
import { rankCafes, toneForIndex } from '../features/loyalty/loyaltyPresentation'
import { isOfferLive, progressKey } from '../features/offers/offersEngine'

export const selectSession = (state) => state.auth.session
const selectUsers = (state) => state.admin.users
const selectBusinesses = (state) => state.admin.businesses

export const selectCurrentUser = createSelector([selectSession, selectUsers], (session, users) =>
  session ? users.find((user) => user.id === session.userId) ?? null : null,
)

export const selectCurrentBusiness = createSelector(
  [selectSession, selectBusinesses],
  (session, businesses) => businesses.find((business) => business.id === session?.businessId) ?? null,
)

export const selectPlan = createSelector([selectCurrentBusiness], (business) => getPlan(business?.plan))
export const selectFeatures = createSelector([selectCurrentBusiness], (business) =>
  getPlanFeatures(business?.plan),
)

const byBusiness = (selectList) =>
  createSelector([selectList, selectSession], (list, session) =>
    list.filter((entry) => entry.businessId === session?.businessId),
  )

export const selectCategories = byBusiness((state) => state.menu.categories)
export const selectItems = byBusiness((state) => state.menu.items)
export const selectCustomers = byBusiness((state) => state.customers.customers)
export const selectCards = byBusiness((state) => state.customers.cards)
export const selectOffers = byBusiness((state) => state.offers.offers)
export const selectBills = byBusiness((state) => state.billing.bills)
export const selectRewards = byBusiness((state) => state.loyalty.rewards)
export const selectSmsLog = byBusiness((state) => state.messaging.smsLog)

export const selectLookups = createSelector([selectCategories, selectItems], (categories, items) => ({
  categoriesById: Object.fromEntries(categories.map((category) => [category.id, category])),
  itemsById: Object.fromEntries(items.map((item) => [item.id, item])),
}))

export const selectCardsByCustomer = createSelector([selectCards], (cards) =>
  Object.fromEntries(cards.map((card) => [card.customerId, card])),
)

export const selectCurrentCustomer = createSelector(
  [selectCurrentUser, selectCustomers, selectSession],
  (user, customers, session) => {
    if (!user && !session) return null
    const customerId = user?.customerId ?? session?.customerId
    if (customerId) {
      const match = customers.find((c) => c.id === customerId)
      if (match) return match
    }
    const cleanPhone = (p) => p?.replace(/\D/g, '').slice(-10)
    return (
      customers.find(
        (c) =>
          (user?.email && c.email?.toLowerCase() === user.email.toLowerCase()) ||
          (user?.phone && cleanPhone(c.phone) === cleanPhone(user.phone)),
      ) ?? null
    )
  },
)

/** All customer memberships for the signed-in user across all coffee shops */
export const selectCustomerMemberships = createSelector(
  [selectCurrentUser, selectSession, (state) => state.customers.customers, (state) => state.admin.businesses],
  (user, session, allCustomers, businesses) => {
    if (!user && !session) return []
    const cleanPhone = (p) => p?.replace(/\D/g, '').slice(-10)
    const userPhone = cleanPhone(user?.phone)
    const userEmail = user?.email?.toLowerCase()

    return allCustomers
      .filter(
        (c) =>
          c.id === user?.customerId ||
          (userEmail && c.email?.toLowerCase() === userEmail) ||
          (userPhone && cleanPhone(c.phone) === userPhone),
      )
      .map((customer) => ({
        customer,
        business: businesses.find((b) => b.id === customer.businessId) ?? null,
      }))
  },
)

/** All loyalty cards & per-café progress for the signed-in user across all coffee shops */
export const selectCustomerCards = createSelector(
  [
    selectCustomerMemberships,
    (state) => state.customers.cards,
    (state) => state.offers.offers,
    (state) => state.loyalty.progress,
    (state) => state.loyalty.rewards,
    (state) => state.menu.categories,
    (state) => state.menu.items,
    (state) => state.billing.bills,
  ],
  (memberships, allCards, allOffers, progress, allRewards, allCategories, allItems, allBills) => {
    const lastVisitByCustomer = {}
    for (const bill of allBills) {
      if (bill.status !== 'active') continue
      if (bill.createdAt > (lastVisitByCustomer[bill.customerId] ?? '')) lastVisitByCustomer[bill.customerId] = bill.createdAt
    }

    return memberships.map(({ customer, business }) => {
      const card = allCards.find((c) => c.customerId === customer.id)
      const offers = allOffers.filter((o) => o.businessId === business?.id && isOfferLive(o))
      const offerProgress = offers.map((offer) => {
        const row = progress[progressKey(customer.id, offer.id)]
        return {
          offer,
          count: row?.count ?? 0,
          threshold: row?.thresholdSnapshot ?? offer.threshold,
        }
      })
      const customerRewards = allRewards
        .filter((r) => r.customerId === customer.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      // A customer's cards span cafés, so menu data can't come from the session-scoped selectors.
      const items = allItems.filter((item) => item.businessId === business?.id)
      const categories = allCategories.filter((category) => category.businessId === business?.id)

      return {
        customer,
        business,
        card,
        lastVisitAt: lastVisitByCustomer[customer.id] ?? null,
        items,
        offers: allOffers.filter((o) => o.businessId === business?.id),
        lookups: {
          categoriesById: Object.fromEntries(categories.map((category) => [category.id, category])),
          itemsById: Object.fromEntries(items.map((item) => [item.id, item])),
        },
        offerProgress,
        availableRewards: customerRewards.filter((r) => r.status === 'available'),
        rewardHistory: customerRewards,
      }
    })
  },
)

/**
 * The customer's wallet, best café first. Tone comes from membership order so a café
 * keeps its colour when the ranking changes. With nothing selected, opens on the top card.
 */
export const selectWallet = createSelector(
  [selectCustomerCards, (state) => state.ui.activeCafeId],
  (cards, activeCafeId) => {
    const ranked = rankCafes(cards.map((entry, index) => ({ ...entry, tone: toneForIndex(index) })))
    return {
      cards: ranked,
      activeEntry: ranked.find((entry) => entry.business?.id === activeCafeId) ?? ranked[0] ?? null,
    }
  },
)

/** All bills for the signed-in user across all coffee shops with business metadata */
export const selectAllCustomerBills = createSelector(
  [selectCustomerMemberships, (state) => state.billing.bills, (state) => state.admin.businesses],
  (memberships, allBills, businesses) => {
    const customerIds = new Set(memberships.map((m) => m.customer.id))
    const bizById = Object.fromEntries(businesses.map((b) => [b.id, b]))

    return allBills
      .filter((bill) => customerIds.has(bill.customerId))
      .map((bill) => ({
        ...bill,
        business: bizById[bill.businessId] ?? null,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
)

/** Visit count, spend and last visit per customer, from active bills. */
export const selectCustomerStats = createSelector([selectBills], (bills) => {
  const stats = {}
  bills.forEach((bill) => {
    if (bill.status !== 'active') return
    const entry = (stats[bill.customerId] ??= { visits: 0, spend: 0, lastVisit: null })
    entry.visits += 1
    entry.spend += bill.total
    if (!entry.lastVisit || bill.createdAt > entry.lastVisit) entry.lastVisit = bill.createdAt
  })
  return stats
})

export const selectAvailableRewardCounts = createSelector([selectRewards], (rewards) => {
  const counts = {}
  rewards.forEach((reward) => {
    if (reward.status === 'available') counts[reward.customerId] = (counts[reward.customerId] ?? 0) + 1
  })
  return counts
})

/** Everything the counter needs for one customer: card, live offer progress, rewards. */
export const makeSelectCustomerLoyalty = () =>
  createSelector(
    [
      (state, customerId) => customerId,
      selectCustomers,
      selectCardsByCustomer,
      selectOffers,
      (state) => state.loyalty.progress,
      selectRewards,
    ],
    (customerId, customers, cardsByCustomer, offers, progress, rewards) => {
      const customer = customers.find((entry) => entry.id === customerId)
      if (!customer) return null
      const offerProgress = offers
        .filter((offer) => isOfferLive(offer))
        .map((offer) => {
          const row = progress[progressKey(customerId, offer.id)]
          return {
            offer,
            count: row?.count ?? 0,
            threshold: row?.thresholdSnapshot ?? offer.threshold,
          }
        })
      const customerRewards = rewards
        .filter((reward) => reward.customerId === customerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      return {
        customer,
        card: cardsByCustomer[customerId],
        offerProgress,
        availableRewards: customerRewards.filter((reward) => reward.status === 'available'),
        rewardHistory: customerRewards,
      }
    },
  )

export const selectSmsUsageThisMonth = createSelector([selectSmsLog], (log) => {
  // Allowance resets on the 1st (local time).
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  return log.filter((entry) => entry.sentAt >= monthStart).length
})
