/**
 * Pure helpers that turn a customer's card data into wallet copy and styling.
 */
import { describeReward, describeScope } from '../offers/offersEngine'
import { formatCurrency } from '../../utils/format'

const CARD_TONES = ['tone-roast', 'tone-moss', 'tone-brass']

/** Stable colourway for a card, based on its position in the wallet. */
export const toneForIndex = (index) => CARD_TONES[index % CARD_TONES.length]

export function greetingFor(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/** The offer featured on a card: item stamps first, since those move fastest. */
export function primaryProgress(entry) {
  return entry.offerProgress.find((progress) => progress.offer.ruleType === 'item_count') ?? entry.offerProgress[0] ?? null
}

/** Reward name without its cap, e.g. "Free coffee" or "20% off". */
export function rewardTitle(offer, lookups) {
  if (!offer) return 'Reward'
  return describeReward({ ...offer, rewardCap: 0 }, lookups)
}

/** Small print for a reward, e.g. "Up to ₹400". Flat rewards are already an exact amount. */
export function rewardCapNote(offer) {
  if (!offer?.rewardCap || offer.rewardType === 'flat_off') return null
  return `Up to ${formatCurrency(offer.rewardCap)}`
}

/** "3 coffees" or "1 visit": what's left to earn, in the customer's words. */
export function remainingLabel(offer, remaining, lookups) {
  if (offer.ruleType !== 'item_count') return `${remaining} ${remaining === 1 ? 'visit' : 'visits'}`
  const unit = (describeScope(offer, lookups) ?? 'item').toLowerCase()
  const plural = remaining === 1 || unit.endsWith('s') ? unit : `${unit}s`
  return `${remaining} ${plural}`
}

/** Reward phrased mid-sentence, e.g. "a free coffee" or "20% off". */
export function rewardWithArticle(offer, lookups) {
  const title = rewardTitle(offer, lookups)
  const lowered = `${title.charAt(0).toLowerCase()}${title.slice(1)}`
  return offer.rewardType.startsWith('free') ? `a ${lowered}` : lowered
}

/**
 * Headline for the wallet hero. An unclaimed reward always leads, because it's
 * the best reason to visit; otherwise it's the distance to the next one.
 */
export function walletHeadline(entry) {
  const { availableRewards, offers, lookups, business } = entry
  const progress = primaryProgress(entry)

  if (availableRewards.length > 1) {
    return { lead: `${availableRewards.length} rewards`, tail: 'are ready to claim.' }
  }
  if (availableRewards.length === 1) {
    const offer = offers.find((candidate) => candidate.id === availableRewards[0].offerId)
    const title = rewardTitle(offer, lookups)
    return { lead: `Your ${title.charAt(0).toLowerCase()}${title.slice(1)}`, tail: 'is ready to claim.' }
  }
  if (!progress) return { lead: 'Welcome back', tail: `to ${business?.name ?? 'your café'}.` }

  const remaining = Math.max(0, progress.threshold - progress.count)
  return {
    lead: `${remainingLabel(progress.offer, remaining, lookups)} away`,
    tail: `from ${rewardWithArticle(progress.offer, lookups)}.`,
  }
}

function rewardStatus({ availableRewards, offers, lookups }) {
  if (availableRewards.length > 1) return `${availableRewards.length} rewards ready`
  if (availableRewards.length === 1) {
    const offer = offers.find((candidate) => candidate.id === availableRewards[0].offerId)
    return `${rewardTitle(offer, lookups)} ready`
  }
  return null
}

const NO_OFFERS_STATUS = 'No offers right now'

/** One-line status for a café: a waiting reward first, otherwise the distance to the next. */
export function cafeStatusLine(entry) {
  const progress = primaryProgress(entry)
  const rewards = rewardStatus(entry)
  if (rewards) return rewards
  if (!progress) return NO_OFFERS_STATUS
  const remaining = Math.max(0, progress.threshold - progress.count)
  return `${remainingLabel(progress.offer, remaining, entry.lookups)} to ${rewardWithArticle(progress.offer, entry.lookups)}`
}

/** Shorter status for tight rows, e.g. "3 coffees to go". */
export function cafeShortStatus(entry) {
  const progress = primaryProgress(entry)
  const rewards = rewardStatus(entry)
  if (rewards) return rewards
  if (!progress) return NO_OFFERS_STATUS
  return `${remainingLabel(progress.offer, Math.max(0, progress.threshold - progress.count), entry.lookups)} to go`
}

/** Wallets larger than this get search, filters and a collapsed list. */
export const CAFE_PREVIEW_COUNT = 6

const ALMOST_THERE_RATIO = 2 / 3

// Most useful to the customer first; rankCafes sorts by this order.
const CAFE_STAGES = ['ready', 'close', 'earning', 'new', 'none']

const progressRatio = (entry) => {
  const progress = primaryProgress(entry)
  return progress?.threshold ? progress.count / progress.threshold : 0
}

/** Where a customer stands at a café: drives the sort order and the filters. */
export function cafeStage(entry) {
  if (entry.availableRewards.length > 0) return 'ready'
  if (!primaryProgress(entry)) return 'none'
  const ratio = progressRatio(entry)
  if (ratio >= ALMOST_THERE_RATIO) return 'close'
  return ratio > 0 ? 'earning' : 'new'
}

/**
 * Orders a wallet by the best reason to visit: rewards waiting, then closest to the
 * next one, then most recently visited. Name last, so the order is always stable.
 */
export function rankCafes(entries) {
  return [...entries].sort(
    (a, b) =>
      CAFE_STAGES.indexOf(cafeStage(a)) - CAFE_STAGES.indexOf(cafeStage(b)) ||
      b.availableRewards.length - a.availableRewards.length ||
      progressRatio(b) - progressRatio(a) ||
      (b.lastVisitAt ?? '').localeCompare(a.lastVisitAt ?? '') ||
      (a.business?.name ?? '').localeCompare(b.business?.name ?? ''),
  )
}

/** Case-insensitive match on café name or city. An empty query matches everything. */
export function cafeMatchesQuery(entry, query) {
  const text = query.trim().toLowerCase()
  if (!text) return true
  return [entry.business?.name, entry.business?.city].some((value) => value?.toLowerCase().includes(text))
}

/** Menu items that earn a stamp on this offer. Bill-wide offers aren't tied to items. */
export function itemsEarningStamps(offer, items) {
  if (!offer || offer.scopeType === 'bill') return []
  return items.filter((item) => {
    if (!item.active) return false
    return offer.scopeType === 'item' ? item.id === offer.scopeId : item.categoryId === offer.scopeId
  })
}
