import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import { adminApi } from '../../services/apiClient'
import { fetchPortalData } from '../loyalty/portalThunks'

export const MAX_FAILED_LOGINS = 5

const generateTemporaryPassword = () => `TEMP-${Math.floor(1000 + Math.random() * 9000)}`

export const fetchBusinesses = createAsyncThunk(
  'admin/fetchBusinesses',
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.getBusinesses()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const createBusinessThunk = createAsyncThunk(
  'admin/createBusinessThunk',
  async (data, { rejectWithValue }) => {
    try {
      return await adminApi.createBusiness(data)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateBusinessPlanThunk = createAsyncThunk(
  'admin/updateBusinessPlanThunk',
  async ({ id, plan }, { rejectWithValue }) => {
    try {
      return await adminApi.updateBusinessPlan(id, plan)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateBusinessStatusThunk = createAsyncThunk(
  'admin/updateBusinessStatusThunk',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await adminApi.updateBusinessStatus(id, status)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchMembers = createAsyncThunk(
  'admin/fetchMembers',
  async (businessId, { rejectWithValue }) => {
    try {
      return await adminApi.getMembers(businessId)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const inviteMemberThunk = createAsyncThunk(
  'admin/inviteMemberThunk',
  async (data, { rejectWithValue }) => {
    try {
      const parts = data.name.trim().split(' ')
      const firstName = parts[0]
      const lastName = parts.slice(1).join(' ') || ''
      const res = await adminApi.inviteMember({
        businessId: data.businessId,
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
      })
      return {
        ...res,
        name: `${res.firstName} ${res.lastName || ''}`.trim(),
        demoPassword: res.temporaryPassword,
      }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateMemberThunk = createAsyncThunk(
  'admin/updateMemberThunk',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await adminApi.updateMember(id, data)
      return {
        ...res,
        name: `${res.firstName} ${res.lastName || ''}`.trim(),
        demoPassword: res.temporaryPassword,
      }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState: { businesses: [], users: [], loading: false, error: null },
  reducers: {
    businessCreated: {
      reducer(state, action) {
        const taken = new Set(state.businesses.map((business) => business.cardPrefix))
        let prefix = action.payload.cardPrefix
        for (let suffix = 2; taken.has(prefix); suffix += 1) prefix = `${action.payload.cardPrefix}${suffix}`
        state.businesses.push({ ...action.payload, cardPrefix: prefix })
      },
      prepare({ name, city, plan, phone, email, address, logo = null }) {
        const prefix = name
          .replace(/[^A-Za-z ]/g, '')
          .split(' ')
          .filter(Boolean)
          .map((word) => word[0])
          .join('')
          .slice(0, 3)
          .toUpperCase()
        return {
          payload: {
            id: `biz_${nanoid(8)}`,
            name,
            city,
            plan,
            phone,
            email,
            address,
            logo,
            status: 'active',
            cardPrefix: prefix || 'BL',
            createdAt: new Date().toISOString(),
          },
        }
      },
    },
    businessUpdated(state, action) {
      const business = state.businesses.find((entry) => entry.id === action.payload.id)
      if (business) Object.assign(business, action.payload)
    },
    memberCreated: {
      reducer(state, action) {
        state.users.push(action.payload)
      },
      prepare(member) {
        return {
          payload: {
            id: `usr_${nanoid(8)}`,
            ...member,
            demoPassword: generateTemporaryPassword(),
            mustResetPassword: true,
            status: 'invited',
            failedLogins: 0,
            createdAt: new Date().toISOString(),
          },
        }
      },
    },
    memberUpdated(state, action) {
      const user = state.users.find((entry) => entry.id === action.payload.id)
      if (user) Object.assign(user, action.payload)
    },
    memberPasswordReset(state, action) {
      const user = state.users.find((entry) => entry.id === action.payload)
      if (!user) return
      user.demoPassword = generateTemporaryPassword()
      user.mustResetPassword = true
      user.failedLogins = 0
      if (user.status === 'locked') user.status = 'invited'
    },
    loginFailed(state, action) {
      const user = state.users.find((entry) => entry.id === action.payload)
      if (!user) return
      user.failedLogins += 1
      if (user.failedLogins >= MAX_FAILED_LOGINS) user.status = 'locked'
    },
    loginSucceeded(state, action) {
      const user = state.users.find((entry) => entry.id === action.payload)
      if (user) user.failedLogins = 0
    },
    passwordSet(state, action) {
      const user = state.users.find((entry) => entry.id === action.payload.userId)
      if (!user) return
      user.demoPassword = action.payload.password
      user.mustResetPassword = false
      user.status = 'active'
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch businesses
      .addCase(fetchBusinesses.fulfilled, (state, action) => {
        state.businesses = action.payload
      })
      // Create business
      .addCase(createBusinessThunk.fulfilled, (state, action) => {
        const exists = state.businesses.some((b) => b.id === action.payload.id)
        if (!exists) {
          state.businesses.unshift(action.payload)
        }
      })
      // Update plan & status
      .addCase(updateBusinessPlanThunk.fulfilled, (state, action) => {
        const business = state.businesses.find((b) => b.id === action.payload.id)
        if (business) Object.assign(business, action.payload)
      })
      .addCase(updateBusinessStatusThunk.fulfilled, (state, action) => {
        const business = state.businesses.find((b) => b.id === action.payload.id)
        if (business) Object.assign(business, action.payload)
      })
      // Fetch members
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.users = action.payload.map((u) => ({
          ...u,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        }))
      })
      // Invite member
      .addCase(inviteMemberThunk.fulfilled, (state, action) => {
        state.users.unshift(action.payload)
      })
      // Update member
      .addCase(updateMemberThunk.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload.id)
        if (user) Object.assign(user, action.payload)
      })
      .addCase(fetchPortalData.fulfilled, (state, action) => {
        if (!action.payload?.wallet) return
        for (const w of action.payload.wallet) {
          if (w.business && !state.businesses.some((b) => b.id === w.business.id)) {
            state.businesses.push(w.business)
          }
        }
      })
  },
})

export const {
  businessCreated,
  businessUpdated,
  memberCreated,
  memberUpdated,
  memberPasswordReset,
  loginFailed,
  loginSucceeded,
  passwordSet,
} = adminSlice.actions

export default adminSlice.reducer
