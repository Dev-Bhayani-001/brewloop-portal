import { createSlice, nanoid } from '@reduxjs/toolkit'

import { generateCardNumber } from '../../utils/random'

const customersSlice = createSlice({
  name: 'customers',
  initialState: { customers: [], cards: [] },
  reducers: {
    /** Adding a customer always issues their loyalty card in the same step. */
    customerAdded: {
      reducer(state, action) {
        const { customer, cardPrefix } = action.payload
        const sequence = state.cards.filter((card) => card.businessId === customer.businessId).length + 1
        state.customers.push(customer)
        state.cards.push({
          id: `${customer.id}_card`,
          businessId: customer.businessId,
          customerId: customer.id,
          cardNumber: generateCardNumber(cardPrefix, sequence),
          qrToken: `blq_${nanoid(12)}`,
          status: 'active',
          issuedAt: customer.createdAt,
        })
      },
      prepare({ customer, cardPrefix }) {
        return {
          payload: {
            cardPrefix,
            customer: { id: `cus_${nanoid(8)}`, createdAt: new Date().toISOString(), ...customer },
          },
        }
      },
    },
    customerUpdated(state, action) {
      const customer = state.customers.find((entry) => entry.id === action.payload.id)
      if (customer) Object.assign(customer, action.payload)
    },
  },
})

export const { customerAdded, customerUpdated } = customersSlice.actions
export default customersSlice.reducer
