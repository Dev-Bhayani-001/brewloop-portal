import { createSlice, nanoid } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: { toasts: [], activeCafeId: null },
  reducers: {
    toastShown: {
      reducer(state, action) {
        state.toasts.push(action.payload)
      },
      prepare(toast) {
        const normalised = typeof toast === 'string' ? { title: toast } : toast
        return { payload: { id: nanoid(6), tone: 'success', ...normalised } }
      },
    },
    toastDismissed(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    /** The café a customer is viewing, shared by the sidebar card and the wallet. */
    activeCafeSelected(state, action) {
      state.activeCafeId = action.payload
    },
  },
})

export const { toastShown, toastDismissed, activeCafeSelected } = uiSlice.actions
export default uiSlice.reducer
