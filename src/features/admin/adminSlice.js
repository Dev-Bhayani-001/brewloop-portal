import { createSlice, nanoid } from '@reduxjs/toolkit'

export const MAX_FAILED_LOGINS = 5

/** Readable one-time password, e.g. "TEMP-4821". Real API generates & emails/SMSes it. */
const generateTemporaryPassword = () => `TEMP-${Math.floor(1000 + Math.random() * 9000)}`

const adminSlice = createSlice({
  name: 'admin',
  initialState: { businesses: [], users: [] },
  reducers: {
    businessCreated: {
      reducer(state, action) {
        // Card numbers must be globally unique, so the prefix must be too.
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
    /** Admin-driven "forgot password": issue a new temp password and force a reset. */
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
