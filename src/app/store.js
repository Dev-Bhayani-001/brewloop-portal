import { configureStore } from '@reduxjs/toolkit'

import adminReducer from '../features/admin/adminSlice'
import authReducer from '../features/auth/authSlice'
import billingReducer from '../features/billing/billingSlice'
import customersReducer from '../features/customers/customersSlice'
import loyaltyReducer from '../features/loyalty/loyaltySlice'
import messagingReducer from '../features/loyalty/messagingSlice'
import menuReducer from '../features/menu/menuSlice'
import offersReducer from '../features/offers/offersSlice'
import uiReducer from '../features/ui/uiSlice'
import { buildInitialState } from '../services/mockDb'

// Bump when the mock data shape changes so stale localStorage is discarded.
const STORAGE_KEY = 'brewloop-demo-v3'

function loadPreloadedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }

  const seed = buildInitialState()
  return {
    admin: { businesses: seed.businesses, users: seed.users },
    menu: { categories: seed.categories, items: seed.items },
    customers: { customers: seed.customers, cards: seed.cards },
    offers: { offers: seed.offers },
    billing: { bills: seed.bills },
    loyalty: { progress: seed.progress, rewards: seed.rewards },
    messaging: { smsLog: seed.smsLog },
  }
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    menu: menuReducer,
    customers: customersReducer,
    offers: offersReducer,
    billing: billingReducer,
    loyalty: loyaltyReducer,
    messaging: messagingReducer,
    ui: uiReducer,
  },
  preloadedState: loadPreloadedState(),
  middleware: (getDefault) => getDefault({ immutableCheck: false, serializableCheck: false }),
})

// Persist the demo so a refresh keeps data & session. Toasts are transient.
function persistNow() {
  clearTimeout(persistTimer)
  persistTimer = null
  const state = store.getState()
  const snapshot = { ...state, ui: undefined, auth: { ...state.auth, status: 'idle', error: null } }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

let persistTimer = null
store.subscribe(() => {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(persistNow, 150)
})
// Flush pending writes if the tab is hidden or closed mid-debounce, so nothing is lost.
window.addEventListener('pagehide', () => persistTimer && persistNow())
document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && persistTimer && persistNow())

/** Wipes the demo back to seed data. */
export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY)
  window.location.assign('/login')
}
