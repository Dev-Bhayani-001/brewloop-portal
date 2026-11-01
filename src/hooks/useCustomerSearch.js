import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { selectCardsByCustomer, selectCustomers } from '../app/selectors'

const digitsOnly = (value) => value.replace(/\D/g, '')
const compact = (value) => value.toLowerCase().replace(/[\s-]/g, '')

/** True when a customer matches a phone (3+ digits), name, or card number (typed or scanned). */
export function matchesCustomer(customer, card, query) {
  const text = query.trim().toLowerCase()
  if (!text) return false
  if (card && compact(card.cardNumber).includes(compact(text))) return true
  const digits = digitsOnly(text)
  if (digits.length >= 3 && digits.length === text.replace(/[\s+-]/g, '').length) {
    return digitsOnly(customer.phone).includes(digits)
  }
  return customer.name.toLowerCase().includes(text)
}

/** Search customers in the current business. */
export function useCustomerSearch(query, limit = 8) {
  const customers = useSelector(selectCustomers)
  const cardsByCustomer = useSelector(selectCardsByCustomer)

  return useMemo(() => {
    if (!query.trim()) return []
    return customers
      .filter((customer) => matchesCustomer(customer, cardsByCustomer[customer.id], query))
      .slice(0, limit)
      .map((customer) => ({ customer, card: cardsByCustomer[customer.id] }))
  }, [query, customers, cardsByCustomer, limit])
}
