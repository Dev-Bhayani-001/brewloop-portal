import { createSlice } from '@reduxjs/toolkit'

const billingSlice = createSlice({
  name: 'billing',
  initialState: { bills: [] },
  reducers: {
    billAdded(state, action) {
      state.bills.push(action.payload)
    },
    // Bills are never deleted, only voided.
    billVoided(state, action) {
      const bill = state.bills.find((entry) => entry.id === action.payload.billId)
      if (!bill) return
      bill.status = 'void'
      bill.voidedAt = new Date().toISOString()
      bill.voidedBy = action.payload.userId
      bill.voidReason = action.payload.reason
    },
  },
})

export const { billAdded, billVoided } = billingSlice.actions
export default billingSlice.reducer
