/**
 * Analytics metrics from the PRD, computed from bills + bill lines.
 * Pure function — the API's SQL aggregates should return the same shapes.
 */
import { toDateInputValue as localDayKey } from '../../utils/format'

const DAY = 86400000

export function computeAnalytics({ bills, customers, offers, rewards, from, to }) {
  const fromTime = new Date(`${from}T00:00:00`).getTime()
  const toTime = new Date(`${to}T23:59:59`).getTime()
  const activeBills = bills.filter((bill) => bill.status === 'active')
  const inRange = activeBills.filter((bill) => {
    const time = new Date(bill.createdAt).getTime()
    return time >= fromTime && time <= toTime
  })

  // Per-customer visits & spend in the period
  const perCustomer = {}
  inRange.forEach((bill) => {
    const entry = (perCustomer[bill.customerId] ??= { visits: 0, spend: 0 })
    entry.visits += 1
    entry.spend += bill.total
  })
  const billedCustomerIds = Object.keys(perCustomer)
  const repeatCount = billedCustomerIds.filter((id) => perCustomer[id].visits >= 2).length

  // New vs returning: first-ever bill inside the period vs earlier.
  const firstBillAt = {}
  activeBills.forEach((bill) => {
    const time = new Date(bill.createdAt).getTime()
    if (!firstBillAt[bill.customerId] || time < firstBillAt[bill.customerId]) firstBillAt[bill.customerId] = time
  })
  const newCount = billedCustomerIds.filter((id) => firstBillAt[id] >= fromTime).length

  // Items: quantity, revenue, and how many customers re-ordered on 2+ separate bills.
  const itemStats = {}
  const itemBillsByCustomer = {}
  inRange.forEach((bill) => {
    bill.lines.forEach((line) => {
      const entry = (itemStats[line.itemId] ??= { itemId: line.itemId, name: line.name, quantity: 0, revenue: 0 })
      entry.quantity += line.quantity
      entry.revenue += line.quantity * line.unitPrice
      const key = `${line.itemId}|${bill.customerId}`
      itemBillsByCustomer[key] = (itemBillsByCustomer[key] ?? 0) + 1
    })
  })
  const repeatBuyers = {}
  Object.entries(itemBillsByCustomer).forEach(([key, billCount]) => {
    if (billCount < 2) return
    const itemId = key.split('|')[0]
    repeatBuyers[itemId] = (repeatBuyers[itemId] ?? 0) + 1
  })
  const items = Object.values(itemStats).map((item) => ({ ...item, repeatCustomers: repeatBuyers[item.itemId] ?? 0 }))

  // Daily bill counts for the trend chart.
  const days = Math.max(1, Math.round((toTime - fromTime) / DAY))
  const daily = Array.from({ length: days }, (_, index) => ({
    date: localDayKey(fromTime + index * DAY + DAY / 2),
    bills: 0,
    revenue: 0,
  }))
  const dailyIndex = Object.fromEntries(daily.map((day, index) => [day.date, index]))
  inRange.forEach((bill) => {
    const key = localDayKey(bill.createdAt)
    const index = dailyIndex[key]
    if (index === undefined) return
    daily[index].bills += 1
    daily[index].revenue += bill.total
  })

  const customersById = Object.fromEntries(customers.map((customer) => [customer.id, customer]))
  const topCustomers = billedCustomerIds.map((id) => ({ customer: customersById[id], ...perCustomer[id] }))

  // Offer performance: rewards earned vs redeemed in the period.
  const offerPerformance = offers.map((offer) => {
    const offerRewards = rewards.filter((reward) => {
      const time = new Date(reward.createdAt).getTime()
      return reward.offerId === offer.id && reward.status !== 'cancelled' && time >= fromTime && time <= toTime
    })
    return {
      offer,
      earned: offerRewards.length,
      redeemed: offerRewards.filter((reward) => reward.status === 'redeemed').length,
    }
  })

  const revenue = inRange.reduce((sum, bill) => sum + bill.total, 0)

  return {
    billCount: inRange.length,
    revenue,
    averageBill: inRange.length ? revenue / inRange.length : 0,
    customersBilled: billedCustomerIds.length,
    repeatCount,
    repeatShare: billedCustomerIds.length ? repeatCount / billedCustomerIds.length : 0,
    newCount,
    returningCount: billedCustomerIds.length - newCount,
    items,
    topCustomers,
    offerPerformance,
    daily,
  }
}
