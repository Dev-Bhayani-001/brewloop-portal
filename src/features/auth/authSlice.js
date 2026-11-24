import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authApi, clearToken, setToken } from '../../services/apiClient'

export const login = createAsyncThunk(
  'auth/login',
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const res = await authApi.login(identifier, password)
      setToken(res.accessToken)
      const user = res.user
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
      return {
        userId: user.id,
        role: user.role,
        businessId: user.businessId,
        customerId: user.customerId ?? null,
        mustResetPassword: user.mustResetPassword,
        user: { ...user, name },
        accessToken: res.accessToken,
      }
    } catch (err) {
      return rejectWithValue(err.message || 'No account matches that phone or email.')
    }
  },
)

export const setOwnPassword = createAsyncThunk(
  'auth/setOwnPassword',
  async ({ password }, { rejectWithValue }) => {
    try {
      const res = await authApi.firstLogin(password)
      if (res?.accessToken) {
        setToken(res.accessToken)
      }
      return res || true
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to set password')
    }
  },
)

export const changeOwnPassword = createAsyncThunk(
  'auth/changeOwnPassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      await authApi.changePassword(currentPassword, newPassword)
      return true
    } catch (err) {
      return rejectWithValue(err.message || 'Your current password is incorrect.')
    }
  },
)

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getMe()
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
      return {
        userId: user.id,
        role: user.role,
        businessId: user.businessId,
        customerId: user.customerId ?? null,
        mustResetPassword: user.mustResetPassword,
        user: { ...user, name },
      }
    } catch (err) {
      clearToken()
      return rejectWithValue(err.message || 'Session expired')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: { session: null, status: 'idle', error: null },
  reducers: {
    loggedOut(state) {
      clearToken()
      state.session = null
      state.error = null
      state.status = 'idle'
    },
    errorCleared(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle'
        state.session = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle'
        state.error = action.payload ?? 'Something went wrong. Try again.'
      })
      .addCase(setOwnPassword.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(setOwnPassword.fulfilled, (state, action) => {
        state.status = 'idle'
        if (state.session) {
          state.session.mustResetPassword = false
          if (action.payload?.accessToken) {
            state.session.accessToken = action.payload.accessToken
          }
        }
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.session = action.payload
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.session = null
      })
  },
})

export const { loggedOut, errorCleared } = authSlice.actions
export default authSlice.reducer
