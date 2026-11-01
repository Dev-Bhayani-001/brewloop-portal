import { createSlice, nanoid } from '@reduxjs/toolkit'

/** sms_log — every SMS counts against the business's monthly allowance (Platinum). */
const messagingSlice = createSlice({
  name: 'messaging',
  initialState: { smsLog: [] },
  reducers: {
    smsSent: {
      reducer(state, action) {
        state.smsLog.push(action.payload)
      },
      prepare({ businessId, customerId, purpose }) {
        return {
          payload: { id: `sms_${nanoid(8)}`, businessId, customerId, purpose, sentAt: new Date().toISOString() },
        }
      },
    },
  },
})

export const { smsSent } = messagingSlice.actions
export default messagingSlice.reducer
