import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { MAX_FAILED_LOGINS, loginFailed, loginSucceeded, passwordSet } from '../admin/adminSlice'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const normalise = (value) => value.trim().toLowerCase().replace(/[\s-]/g, '')
const lastTenDigits = (value) => value.replace(/\D/g, '').slice(-10)

/** Email matches exactly; phone matches on the full 10-digit number (with or without +91). */
function findUser(users, identifier) {
  const key = normalise(identifier)
  if (key.includes('@')) return users.find((entry) => normalise(entry.email) === key)
  const digits = lastTenDigits(identifier)
  if (digits.length !== 10) return null
  return users.find((entry) => lastTenDigits(entry.phone) === digits)
}

/**
 * Mock of POST /auth/login. The real API returns access + refresh tokens
 * carrying { user_id, role, business_id }.
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ identifier, password }, { getState, dispatch, rejectWithValue }) => {
    await wait(450)
    const { users, businesses } = getState().admin
    const user = findUser(users, identifier)

    if (!user) return rejectWithValue('No account matches that phone or email.')
    if (user.status === 'locked') {
      return rejectWithValue('This account is locked after too many attempts. Ask your Brewloop admin to reset it.')
    }
    if (user.status === 'deactivated') return rejectWithValue('This account has been deactivated.')

    const business = businesses.find((entry) => entry.id === user.businessId)
    if (business && business.status !== 'active') {
      return rejectWithValue(`${business.name} is currently paused. Contact Brewloop support.`)
    }

    if (user.demoPassword !== password) {
      dispatch(loginFailed(user.id))
      const remaining = Math.max(0, MAX_FAILED_LOGINS - (user.failedLogins + 1))
      return rejectWithValue(
        remaining > 0
          ? `Incorrect password. ${remaining} attempt${remaining === 1 ? '' : 's'} left before the account locks.`
          : 'Incorrect password. The account is now locked.',
      )
    }

    dispatch(loginSucceeded(user.id))
    return {
      userId: user.id,
      role: user.role,
      businessId: user.businessId,
      mustResetPassword: user.mustResetPassword,
    }
  },
)

/** Mock of POST /auth/first-login — sets a permanent password and clears must_reset_password. */
export const setOwnPassword = createAsyncThunk(
  'auth/setOwnPassword',
  async ({ password }, { getState, dispatch }) => {
    await wait(400)
    const { userId } = getState().auth.session
    dispatch(passwordSet({ userId, password }))
    return true
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: { session: null, status: 'idle', error: null },
  reducers: {
    loggedOut(state) {
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
      .addCase(setOwnPassword.fulfilled, (state) => {
        state.status = 'idle'
        state.session.mustResetPassword = false
      })
  },
})

export const { loggedOut, errorCleared } = authSlice.actions
export default authSlice.reducer
