import { createAsyncThunk, nanoid } from '@reduxjs/toolkit'

import { selectOffers, selectLookups, selectCurrentBusiness, selectSmsUsageThisMonth } from '../../app/selectors'
import { getPlan } from '../../utils/planFeatures'
import { loyaltyUpdated } from '../loyalty/loyaltySlice'
import { smsSent } from '../loyalty/messagingSlice'
import { applyBillToOffers, computeRewardDiscount, reverseBillFromOffers } from '../offers/offersEngine'
import { billAdded, billVoided } from './billingSlice'

/**
 * Mock of POST /bills. On the server this whole thunk is one DB transaction:
 * insert bill + lines, redeem the chosen reward, run the offers engine.
 */
export const recordBill = createAsyncThunk(
  'billing/recordBill',
  async ({ customerId, lines, rewardId }, { getState, dispatch }) => {
    await new Promise((resolve) => setTimeout(resolve, 350))
    const state = getState()
    const { session } = state.auth
    const offers = selectOffers(state)
    const { itemsById } = selectLookups(state)
    const business = selectCurrentBusiness(state)

    const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
    const reward = rewardId ? state.loyalty.rewards.find((entry) => entry.id === rewardId) : null
    const rewardOffer = reward ? offers.find((offer) => offer.id === reward.offerId) : null
    const discount = rewardOffer ? computeRewardDiscount({ offer: rewardOffer, lines, subtotal, itemsById }) : 0

    const bill = {
      id: `bill_${nanoid(10)}`,
      businessId: session.businessId,
      customerId,
      createdBy: session.userId,
      lines,
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount),
      status: 'active',
      redeemedRewardId: reward?.id ?? null,
      redeemedOfferId: reward?.offerId ?? null,
      createdAt: new Date().toISOString(),
    }

    const result = applyBillToOffers({
      bill,
      offers,
      itemsById,
      progressByKey: state.loyalty.progress,
      makeId: () => `rwd_${nanoid(10)}`,
    })

    dispatch(billAdded({ ...bill, contributions: result.contributions }))
    dispatch(
      loyaltyUpdated({
        progressUpdates: result.progressUpdates,
        newRewards: result.newRewards,
        rewardChanges: reward ? [{ id: reward.id, status: 'redeemed', redeemedBillId: bill.id }] : [],
      }),
    )

    // Platinum: text the customer when they unlock a reward, within the monthly allowance.
    const plan = getPlan(business.plan)
    let smsDelivered = false
    if (plan.features.sms && result.newRewards.length) {
      const used = selectSmsUsageThisMonth(getState())
      if (used < plan.smsAllowance) {
        dispatch(smsSent({ businessId: business.id, customerId, purpose: 'reward_alert' }))
        smsDelivered = true
      }
    }

    return { bill, newRewards: result.newRewards, smsDelivered }
  },
)

/** Mock of POST /bills/:id/void — reverses offer progress and unused rewards. */
export const voidBill = createAsyncThunk('billing/voidBill', async ({ billId, reason }, { getState, dispatch }) => {
  const state = getState()
  const bill = state.billing.bills.find((entry) => entry.id === billId)
  if (!bill || bill.status === 'void') return null
  const reversal = reverseBillFromOffers({
    bill,
    progressByKey: state.loyalty.progress,
    rewards: state.loyalty.rewards,
  })
  dispatch(billVoided({ billId, reason, userId: state.auth.session.userId }))
  dispatch(loyaltyUpdated(reversal))
  return reversal
})
