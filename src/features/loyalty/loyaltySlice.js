import { createSlice } from '@reduxjs/toolkit'
import { progressKey } from '../offers/offersEngine'
import { fetchPortalData } from './portalThunks'

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState: { progress: {}, rewards: [] },
  reducers: {
    loyaltyUpdated(state, action) {
      const { progressUpdates = [], newRewards = [], rewardChanges = [] } = action.payload
      progressUpdates.forEach((row) => {
        state.progress[progressKey(row.customerId, row.offerId)] = row
      })
      state.rewards.push(...newRewards)
      rewardChanges.forEach((change) => {
        const reward = state.rewards.find((entry) => entry.id === change.id)
        if (reward) Object.assign(reward, change)
      })
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPortalData.fulfilled, (state, action) => {
      if (!action.payload?.wallet) return
      for (const w of action.payload.wallet) {
        for (const o of w.offers || []) {
          if (w.card?.customerId) {
            state.progress[progressKey(w.card.customerId, o.id)] = {
              customerId: w.card.customerId,
              offerId: o.id,
              count: o.currentStamps || 0,
              thresholdSnapshot: o.threshold,
            }
          }
        }
        for (const r of w.availableRewards || []) {
          if (!state.rewards.some((existing) => existing.id === r.id)) {
            state.rewards.push({
              id: r.id,
              businessId: w.business.id,
              customerId: w.card?.customerId,
              offerId: r.offerId,
              status: 'available',
              createdAt: r.earnedAt,
            })
          }
        }
      }
    })
  },
})

export const { loyaltyUpdated } = loyaltySlice.actions
export default loyaltySlice.reducer
