import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import { customersApi } from '../../services/apiClient'
import { generateCardNumber } from '../../utils/random'
import { fetchPortalData } from '../loyalty/portalThunks'

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (query, { rejectWithValue }) => {
    try {
      const res = await customersApi.getCustomers(query)
      return res.items || res
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const createCustomerThunk = createAsyncThunk(
  'customers/createCustomer',
  async (data, { rejectWithValue }) => {
    try {
      return await customersApi.createCustomer(data)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateCustomerThunk = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await customersApi.updateCustomer(id, data)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const customersSlice = createSlice({
  name: 'customers',
  initialState: { customers: [], cards: [], loading: false, error: null },
  reducers: {
    customerAdded: {
      reducer(state, action) {
        const { customer, cardPrefix } = action.payload
        const sequence = state.cards.filter((card) => card.businessId === customer.businessId).length + 1
        state.customers.push(customer)
        state.cards.push({
          id: `${customer.id}_card`,
          businessId: customer.businessId,
          customerId: customer.id,
          cardNumber: generateCardNumber(cardPrefix, sequence),
          qrToken: `blq_${nanoid(12)}`,
          status: 'active',
          issuedAt: customer.createdAt,
        })
      },
      prepare({ customer, cardPrefix }) {
        return {
          payload: {
            cardPrefix,
            customer: { id: `cus_${nanoid(8)}`, createdAt: new Date().toISOString(), ...customer },
          },
        }
      },
    },
    customerUpdated(state, action) {
      const customer = state.customers.find((entry) => entry.id === action.payload.id)
      if (customer) Object.assign(customer, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload
        // Extract cards from customers if embedded
        for (const cust of action.payload) {
          if (cust.card && !state.cards.some((c) => c.id === cust.card.id)) {
            state.cards.push(cust.card)
          }
        }
      })
      .addCase(createCustomerThunk.fulfilled, (state, action) => {
        state.customers.unshift(action.payload)
        if (action.payload.card) {
          state.cards.unshift(action.payload.card)
        }
      })
      .addCase(updateCustomerThunk.fulfilled, (state, action) => {
        const cust = state.customers.find((c) => c.id === action.payload.id)
        if (cust) Object.assign(cust, action.payload)
      })
      .addCase(fetchPortalData.fulfilled, (state, action) => {
        if (!action.payload?.wallet) return
        for (const w of action.payload.wallet) {
          if (w.card && !state.cards.some((c) => c.id === w.card.id)) {
            state.cards.push({ ...w.card, businessId: w.business?.id })
          }
        }
      })
  },
})

export const { customerAdded, customerUpdated } = customersSlice.actions
export default customersSlice.reducer
