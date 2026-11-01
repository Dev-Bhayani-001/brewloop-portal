/**
 * Business-scoped selectors. Every list is filtered by the signed-in user's
 * businessId — the API must apply the same filter server-side.
 */
import { createSelector } from '@reduxjs/toolkit'

import { getPlan, getPlanFeatures } from '../utils/planFeatures'
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
