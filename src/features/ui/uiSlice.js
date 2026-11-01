import { createSlice, nanoid } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: { toasts: [] },
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
  },
})

export const { toastShown, toastDismissed } = uiSlice.actions
export default uiSlice.reducer
