import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { billingApi } from '../../services/apiClient'
import { fetchPortalData } from '../loyalty/portalThunks'

export const fetchBills = createAsyncThunk(
  'billing/fetchBills',
  async (query, { rejectWithValue }) => {
    try {
      const res = await billingApi.getBills(query)
      return res.items || res
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const billingSlice = createSlice({
  name: 'billing',
  initialState: { bills: [], loading: false, error: null },
  reducers: {
    billAdded(state, action) {
      state.bills.unshift(action.payload)
    },
    billVoided(state, action) {
      const bill = state.bills.find((entry) => entry.id === action.payload.billId)
      if (!bill) return
      bill.status = 'void'
      bill.voidedAt = new Date().toISOString()
      bill.voidedBy = action.payload.userId
      bill.voidReason = action.payload.reason
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.bills = action.payload
      })
      .addCase(fetchPortalData.fulfilled, (state, action) => {
        if (!action.payload?.bills) return
        state.bills = action.payload.bills.map((b) => ({
          ...b,
          businessId: b.business?.id,
        }))
      })
  },
})

export const { billAdded, billVoided } = billingSlice.actions
export default billingSlice.reducer
