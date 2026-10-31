import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { makeSelectCustomerLoyalty } from '../app/selectors'

/** Card, live offer progress and rewards for one customer (memoised per component). */
export function useCustomerLoyalty(customerId) {
  const selectLoyalty = useMemo(() => makeSelectCustomerLoyalty(), [])
  return useSelector((state) => selectLoyalty(state, customerId))
}
