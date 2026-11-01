import { createSlice, nanoid } from '@reduxjs/toolkit'

const offersSlice = createSlice({
  name: 'offers',
  initialState: { offers: [] },
  reducers: {
    /**
     * Create or edit. Threshold edits are safe mid-cycle: each customer's running
     * cycle keeps its threshold snapshot; the new value applies from the next cycle.
     */
    offerSaved: {
      reducer(state, action) {
        const existing = state.offers.find((entry) => entry.id === action.payload.id)
        if (existing) Object.assign(existing, action.payload)
        else state.offers.unshift(action.payload)
      },
      prepare(offer) {
        return {
          payload: {
            createdAt: new Date().toISOString(),
            ...offer,
            id: offer.id ?? `offer_${nanoid(8)}`,
          },
        }
      },
    },
    offerToggled(state, action) {
      const offer = state.offers.find((entry) => entry.id === action.payload)
      if (offer) offer.active = !offer.active
    },
  },
})

export const { offerSaved, offerToggled } = offersSlice.actions
export default offersSlice.reducer
