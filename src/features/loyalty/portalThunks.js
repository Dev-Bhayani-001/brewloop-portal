import { createAsyncThunk } from '@reduxjs/toolkit'
import { portalApi } from '../../services/apiClient'

export const fetchPortalData = createAsyncThunk(
  'portal/fetchPortalData',
  async (_, { rejectWithValue }) => {
    try {
      const [wallet, bills] = await Promise.all([
        portalApi.getWallet(),
        portalApi.getBills(),
      ])
      return { wallet, bills }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)
