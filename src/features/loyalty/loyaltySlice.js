import { createSlice } from '@reduxjs/toolkit'

import { progressKey } from '../offers/offersEngine'

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
})

export const { loyaltyUpdated } = loyaltySlice.actions
export default loyaltySlice.reducer
