const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/api/v1'

const TOKEN_KEY = 'brewloop_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const config = {
    ...options,
    headers,
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, config)

  if (response.status === 204) {
    return null
  }

  let data
  const text = await response.text()
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { message: text }
  }

  if (!response.ok) {
    const errorMsg =
      data?.error?.message ||
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`
    const error = new Error(errorMsg)
    error.status = response.status
    error.code = data?.error?.code || data?.code
    error.data = data
    throw error
  }

  return data
}

// ---------------------------------------------------------------------------
// 1. Auth API (Phase 1)
// ---------------------------------------------------------------------------
export const authApi = {
  login: (identifier, password) =>
    apiClient('/auth/login', {
      method: 'POST',
      body: { identifier, password },
    }),

  firstLogin: (newPassword) =>
    apiClient('/auth/first-login', {
      method: 'POST',
      body: { newPassword },
    }),

  changePassword: (currentPassword, newPassword) =>
    apiClient('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),

  getMe: () => apiClient('/auth/me'),
}

// ---------------------------------------------------------------------------
// 2. Admin API (Phase 2)
// ---------------------------------------------------------------------------
export const adminApi = {
  getBusinesses: () => apiClient('/admin/businesses'),
  createBusiness: (data) =>
    apiClient('/admin/businesses', { method: 'POST', body: data }),
  getBusinessStats: (id) => apiClient(`/admin/businesses/${id}`),
  updateBusinessStatus: (id, status) =>
    apiClient(`/admin/businesses/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),
  updateBusinessPlan: (id, plan) =>
    apiClient(`/admin/businesses/${id}/plan`, {
      method: 'PATCH',
      body: { plan },
    }),
  getMembers: (businessId) =>
    apiClient(`/admin/members${businessId ? `?businessId=${businessId}` : ''}`),
  inviteMember: (data) =>
    apiClient('/admin/members', { method: 'POST', body: data }),
  updateMember: (id, data) =>
    apiClient(`/admin/members/${id}`, { method: 'PATCH', body: data }),
}

// ---------------------------------------------------------------------------
// 3. Menu, Customers & Counter API (Phase 3)
// ---------------------------------------------------------------------------
export const menuApi = {
  getCategories: () => apiClient('/menu/categories'),
  createCategory: (data) =>
    apiClient('/menu/categories', { method: 'POST', body: data }),
  updateCategory: (id, data) =>
    apiClient(`/menu/categories/${id}`, { method: 'PATCH', body: data }),
  getItems: (query) =>
    apiClient(
      `/menu/items${query?.active !== undefined ? `?active=${query.active}` : ''}`
    ),
  createItem: (data) =>
    apiClient('/menu/items', { method: 'POST', body: data }),
  updateItem: (id, data) =>
    apiClient(`/menu/items/${id}`, { method: 'PATCH', body: data }),
  deleteItem: (id) => apiClient(`/menu/items/${id}`, { method: 'DELETE' }),
}

export const customersApi = {
  getCustomers: (query) => {
    const params = new URLSearchParams()
    if (query?.search) params.append('search', query.search)
    if (query?.page) params.append('page', query.page)
    const qs = params.toString()
    return apiClient(`/customers${qs ? `?${qs}` : ''}`)
  },
  createCustomer: (data) =>
    apiClient('/customers', { method: 'POST', body: data }),
  getCustomer: (id) => apiClient(`/customers/${id}`),
  updateCustomer: (id, data) =>
    apiClient(`/customers/${id}`, { method: 'PATCH', body: data }),
  lookupCardByQr: (qrToken) => apiClient(`/cards/qr/${qrToken}`),
  replaceCard: (id) => apiClient(`/cards/${id}/replace`, { method: 'POST' }),
}

export const counterApi = {
  lookup: (q) => apiClient(`/counter/lookup?q=${encodeURIComponent(q)}`),
  getTodayStats: () => apiClient('/counter/today-stats'),
}

// ---------------------------------------------------------------------------
// 4. Offers & POS Billing API (Phase 4)
// ---------------------------------------------------------------------------
export const offersApi = {
  getOffers: () => apiClient('/offers'),
  createOffer: (data) =>
    apiClient('/offers', { method: 'POST', body: data }),
  getOffer: (id) => apiClient(`/offers/${id}`),
  updateOffer: (id, data) =>
    apiClient(`/offers/${id}`, { method: 'PATCH', body: data }),
  toggleOffer: (id) => apiClient(`/offers/${id}/toggle`, { method: 'PATCH' }),
}

export const billingApi = {
  getBills: (query) => {
    const params = new URLSearchParams()
    if (query?.filter) params.append('filter', query.filter)
    if (query?.search) params.append('search', query.search)
    if (query?.page) params.append('page', query.page)
    const qs = params.toString()
    return apiClient(`/bills${qs ? `?${qs}` : ''}`)
  },
  recordBill: (data) =>
    apiClient('/bills', { method: 'POST', body: data }),
  getBill: (id) => apiClient(`/bills/${id}`),
  voidBill: (id, reason) =>
    apiClient(`/bills/${id}/void`, { method: 'POST', body: { reason } }),
}

// ---------------------------------------------------------------------------
// 5. Analytics, Settings & Customer Portal API (Phase 5)
// ---------------------------------------------------------------------------
export const analyticsApi = {
  getSummary: (filter = '30days') =>
    apiClient(`/analytics/summary?filter=${filter}`),
  getTrend: (filter = '30days') =>
    apiClient(`/analytics/trend?filter=${filter}`),
  getItems: (filter = '30days') =>
    apiClient(`/analytics/items?filter=${filter}`),
  getCustomers: (filter = '30days', limit = 10) =>
    apiClient(`/analytics/customers?filter=${filter}&limit=${limit}`),
}

export const settingsApi = {
  getBusiness: () => apiClient('/settings/business'),
  updateBusiness: (data) =>
    apiClient('/settings/business', { method: 'PATCH', body: data }),
  getSmsUsage: () => apiClient('/settings/sms-usage'),
}

export const portalApi = {
  getWallet: () => apiClient('/portal/wallet'),
  getBills: () => apiClient('/portal/bills'),
  getCafeMenu: (cafeId) => apiClient(`/portal/cafes/${cafeId}/menu`),
}
