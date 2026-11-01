import { formatNumber } from './format'

/**
 * Single source of truth for what each subscription plan unlocks.
 * Never scatter `plan === 'gold'` checks — call getPlanFeatures(plan) instead.
 */
export const PLANS = {
  silver: {
    id: 'silver',
    label: 'Silver',
    tagline: 'Loyalty cards & offers',
    features: { loyaltyCards: true, offers: true, analytics: false, sms: false },
    smsAllowance: 0,
  },
  gold: {
    id: 'gold',
    label: 'Gold',
    tagline: 'Adds customer analytics',
    features: { loyaltyCards: true, offers: true, analytics: true, sms: false },
    smsAllowance: 0,
  },
  platinum: {
    id: 'platinum',
    label: 'Platinum',
    tagline: 'Adds 1,000 free SMS / month',
    features: { loyaltyCards: true, offers: true, analytics: true, sms: true },
    smsAllowance: 1000,
  },
}

export const PLAN_ORDER = ['silver', 'gold', 'platinum']

export const getPlanFeatures = (planId) => (PLANS[planId] ?? PLANS.silver).features

export const getPlan = (planId) => PLANS[planId] ?? PLANS.silver

/** Lowest plan that unlocks a given feature — used for "Upgrade to X" prompts. */
export const minimumPlanFor = (featureKey) =>
  PLAN_ORDER.map((id) => PLANS[id]).find((plan) => plan.features[featureKey])

/** Rows for plan comparison tables. */
export const FEATURE_ROWS = [
  { key: 'loyaltyCards', label: 'Loyalty ID cards' },
  { key: 'offers', label: 'Offers engine' },
  { key: 'analytics', label: 'Analytics' },
  {
    key: 'sms',
    label: 'Free SMS',
    render: (plan) => (plan.smsAllowance ? `${formatNumber(plan.smsAllowance)}/mo` : null),
  },
]
