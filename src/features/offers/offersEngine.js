/**
 * Offers engine — pure functions, no Redux or React.
 * The backend should implement the same rules inside the "create bill" transaction;
 * the portal uses this to drive the demo and to preview progress before saving.
 */
import { formatCurrency, toDateInputValue } from '../../utils/format'

export const RULE_TYPES = {
  bill_count: {
    label: 'Bill count',
    unit: 'visit',
    description: 'Every qualifying bill adds 1 stamp.',
  },
  item_count: {
    label: 'Item count',
    unit: 'item',
    description: 'Every unit of the chosen item or category adds 1 stamp, across bills.',
  },
}

export const REWARD_TYPES = {
  free_bill: { label: 'Free bill', needsValue: false },
  free_item: { label: 'Free item', needsValue: false },
  percent_off: { label: '% off the bill', needsValue: true, suffix: '%' },
  flat_off: { label: 'Flat amount off', needsValue: true, prefix: '₹' },
}

export const SCOPE_TYPES = {
  bill: 'Whole bill',
  category: 'One category',
  item: 'One item',
}

export const progressKey = (customerId, offerId) => `${customerId}:${offerId}`

export function isOfferLive(offer, atIso = new Date().toISOString()) {
  if (!offer.active) return false
  const day = toDateInputValue(atIso)
  if (offer.validFrom && day < offer.validFrom) return false
  if (offer.validTo && day > offer.validTo) return false
  return true
}

function lineMatchesScope(offer, line, itemsById) {
  if (offer.scopeType === 'bill') return true
  if (offer.scopeType === 'item') return line.itemId === offer.scopeId
  return itemsById[line.itemId]?.categoryId === offer.scopeId
}

/** How many stamps a bill earns on one offer. 0 means it does not qualify. */
export function unitsEarned(offer, bill, itemsById) {
  if (!isOfferLive(offer, bill.createdAt)) return 0
  if (offer.minBillValue && bill.subtotal < offer.minBillValue) return 0

  const matchingLines = bill.lines.filter((line) => lineMatchesScope(offer, line, itemsById))
  if (offer.ruleType === 'bill_count') return matchingLines.length > 0 ? 1 : 0
  return matchingLines.reduce((sum, line) => sum + line.quantity, 0)
}

/**
 * Apply a saved bill to every offer of its business.
 * Returns the progress rows to upsert, new rewards to create, and the per-offer
 * contributions to store on the bill (needed to reverse it on void).
 *
 * Threshold changes: the running cycle keeps its `thresholdSnapshot`; the next
 * cycle picks up the offer's current threshold.
 */
export function applyBillToOffers({ bill, offers, itemsById, progressByKey, makeId }) {
  const progressUpdates = []
  const newRewards = []
  const contributions = []

  for (const offer of offers) {
    // The bill that redeems an offer's reward does not count toward that same offer.
    if (bill.redeemedOfferId === offer.id) continue

    const units = unitsEarned(offer, bill, itemsById)
    if (!units) continue

    const key = progressKey(bill.customerId, offer.id)
    const current = progressByKey[key] ?? {
      customerId: bill.customerId,
      offerId: offer.id,
      count: 0,
      thresholdSnapshot: offer.threshold,
      cycleStartedAt: bill.createdAt,
    }

    let count = current.count + units
    let threshold = current.thresholdSnapshot
    let rewardsEarned = 0
    while (count >= threshold) {
      count -= threshold
      rewardsEarned += 1
      threshold = offer.threshold
    }

    for (let index = 0; index < rewardsEarned; index += 1) {
      newRewards.push({
        id: makeId(),
        businessId: bill.businessId,
        customerId: bill.customerId,
        offerId: offer.id,
        status: 'available',
        earnedBillId: bill.id,
        redeemedBillId: null,
        createdAt: bill.createdAt,
      })
    }

    progressUpdates.push({
      ...current,
      count,
      thresholdSnapshot: threshold,
      cycleStartedAt: rewardsEarned ? bill.createdAt : current.cycleStartedAt,
    })
    contributions.push({ offerId: offer.id, units, rewardsEarned })
  }

  return { progressUpdates, newRewards, contributions }
}

/**
 * Reverse a bill's effect when it is voided:
 * - subtract its stamps,
 * - cancel rewards it earned that are still unused (and give those stamps back),
 * - put back any reward the bill had redeemed.
 */
export function reverseBillFromOffers({ bill, progressByKey, rewards }) {
  const progressUpdates = []
  const rewardChanges = []

  for (const contribution of bill.contributions ?? []) {
    const key = progressKey(bill.customerId, contribution.offerId)
    const current = progressByKey[key]
    if (!current) continue

    let count = current.count - contribution.units
    const earnedHere = rewards.filter(
      (reward) => reward.earnedBillId === bill.id && reward.offerId === contribution.offerId,
    )
    for (const reward of earnedHere) {
      if (reward.status !== 'available') continue
      rewardChanges.push({ id: reward.id, status: 'cancelled' })
      count += current.thresholdSnapshot
    }
    progressUpdates.push({ ...current, count: Math.max(0, count) })
  }

  if (bill.redeemedRewardId) {
    rewardChanges.push({ id: bill.redeemedRewardId, status: 'available', redeemedBillId: null })
  }

  return { progressUpdates, rewardChanges }
}

/** Money value of applying a reward to a bill in progress. */
export function computeRewardDiscount({ offer, lines, subtotal, itemsById }) {
  if (!offer || !lines.length) return 0
  const cap = offer.rewardCap || Infinity

  switch (offer.rewardType) {
    case 'free_bill':
      return Math.min(subtotal, cap)
    case 'free_item': {
      const eligiblePrices = lines
        .filter((line) => lineMatchesScope(offer, line, itemsById))
        .map((line) => line.unitPrice)
      if (!eligiblePrices.length) return 0
      return Math.min(Math.min(...eligiblePrices), cap)
    }
    case 'percent_off':
      return Math.min((subtotal * offer.rewardValue) / 100, cap)
    case 'flat_off':
      return Math.min(offer.rewardValue, subtotal)
    default:
      return 0
  }
}

export function describeScope(offer, { categoriesById, itemsById }) {
  if (offer.scopeType === 'item') return itemsById[offer.scopeId]?.name ?? 'item'
  if (offer.scopeType === 'category') return categoriesById[offer.scopeId]?.name ?? 'category'
  return null
}

export function describeReward(offer, lookups) {
  const cap = offer.rewardCap ? ` (up to ${formatCurrency(offer.rewardCap)})` : ''
  switch (offer.rewardType) {
    case 'free_bill':
      return `Free bill${cap}`
    case 'free_item':
      return `Free ${describeScope(offer, lookups)?.toLowerCase() ?? 'item'}${cap}`
    case 'percent_off':
      return `${offer.rewardValue}% off${cap}`
    case 'flat_off':
      return `${formatCurrency(offer.rewardValue)} off`
    default:
      return 'Reward'
  }
}

/** One-line plain-English summary, e.g. "Buy 6 Coffee → free coffee". */
export function describeRule(offer, lookups) {
  const scopeName = describeScope(offer, lookups)
  if (offer.ruleType === 'item_count') {
    return `Buy ${offer.threshold} ${scopeName ?? 'items'} → ${describeReward(offer, lookups).toLowerCase()}`
  }
  const withScope = scopeName ? ` with ${scopeName}` : ''
  const minimum = offer.minBillValue ? ` over ${formatCurrency(offer.minBillValue)}` : ''
  return `${offer.threshold} bills${withScope}${minimum} → ${describeReward(offer, lookups).toLowerCase()}`
}

/** Display status for the offers list. */
export function offerStatus(offer) {
  const today = toDateInputValue(new Date())
  if (offer.validTo && today > offer.validTo) return { label: 'Ended', tone: 'neutral' }
  if (!offer.active) return { label: 'Paused', tone: 'warning' }
  if (offer.validFrom && today < offer.validFrom) return { label: 'Scheduled', tone: 'neutral' }
  if (isOfferLive(offer)) return { label: 'Live', tone: 'success' }
  return { label: 'Inactive', tone: 'neutral' }
}
