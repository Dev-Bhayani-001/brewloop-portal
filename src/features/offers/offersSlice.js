import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import { offersApi } from '../../services/apiClient'
import { fetchPortalData } from '../loyalty/portalThunks'

export const fetchOffers = createAsyncThunk(
  'offers/fetchOffers',
  async (_, { rejectWithValue }) => {
    try {
      return await offersApi.getOffers()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const saveOfferThunk = createAsyncThunk(
  'offers/saveOffer',
  async (offer, { rejectWithValue }) => {
    try {
      if (offer.id && !offer.id.startsWith('offer_')) {
        return await offersApi.updateOffer(offer.id, offer)
      }
      return await offersApi.createOffer(offer)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const toggleOfferThunk = createAsyncThunk(
  'offers/toggleOffer',
  async (id, { rejectWithValue }) => {
    try {
      return await offersApi.toggleOffer(id)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const offersSlice = createSlice({
  name: 'offers',
  initialState: { offers: [], loading: false, error: null },
  reducers: {
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.offers = action.payload
      })
      .addCase(saveOfferThunk.fulfilled, (state, action) => {
        const index = state.offers.findIndex((o) => o.id === action.payload.id)
        if (index >= 0) state.offers[index] = action.payload
        else state.offers.unshift(action.payload)
      })
      .addCase(toggleOfferThunk.fulfilled, (state, action) => {
        const offer = state.offers.find((o) => o.id === action.payload.id)
        if (offer) offer.active = action.payload.active
      })
      .addCase(fetchPortalData.fulfilled, (state, action) => {
        if (!action.payload?.wallet) return
        for (const w of action.payload.wallet) {
          for (const o of w.offers || []) {
            if (!state.offers.some((existing) => existing.id === o.id)) {
              state.offers.push({ ...o, businessId: w.business?.id, active: true })
            }
          }
        }
      })
  },
})

export const { offerSaved, offerToggled } = offersSlice.actions
export default offersSlice.reducer
