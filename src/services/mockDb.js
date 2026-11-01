/**
 * In-browser mock database used until the brewloop-server API is wired up.
 * Shapes mirror the tables in the PRD (camelCased). Everything is deterministic.
 *
 * NOTE: `demoPassword` exists only for the mock login. The real API stores a
 * bcrypt/argon2 hash and never returns it to the client.
 */
import { applyBillToOffers, progressKey } from '../features/offers/offersEngine'
import { toDateInputValue } from '../utils/format'
import { createRandom, generateCardNumber } from '../utils/random'

const DAY = 24 * 60 * 60 * 1000
const daysAgo = (days, hour = 10, minute = 0) => {
  const date = new Date(Date.now() - days * DAY)
  date.setHours(hour, minute, 0, 0)
  // Keep "today" seed data in the past so nothing shows up as happening later today.
  const latest = Date.now() - 5 * 60 * 1000
  return new Date(Math.min(date.getTime(), latest)).toISOString()
}
const isoDay = (days) => toDateInputValue(Date.now() - days * DAY)

const businesses = [
  {
    id: 'biz_kettle',
    name: 'Kettle & Crumb',
    city: 'Ahmedabad',
    plan: 'platinum',
    status: 'active',
    cardPrefix: 'KC',
    createdAt: daysAgo(120),
  },
  {
    id: 'biz_roast',
    name: 'Roast & Ritual',
    city: 'Pune',
    plan: 'gold',
    status: 'active',
    cardPrefix: 'RR',
    createdAt: daysAgo(64),
  },
  {
    id: 'biz_grind',
    name: 'Morning Grind',
    city: 'Surat',
    plan: 'silver',
    status: 'active',
    cardPrefix: 'MG',
    createdAt: daysAgo(18),
  },
]

const users = [
  {
    id: 'usr_admin',
    businessId: null,
    role: 'platform_admin',
    name: 'Dev Bhayani',
    phone: '+91 98250 00001',
    email: 'admin@brewloop.app',
    demoPassword: 'admin123',
    mustResetPassword: false,
    status: 'active',
    failedLogins: 0,
    createdAt: daysAgo(200),
  },
  {
    id: 'usr_meera',
    businessId: 'biz_kettle',
    role: 'manager',
    name: 'Meera Shah',
    phone: '+91 98250 11111',
    email: 'meera@kettlecrumb.in',
    demoPassword: 'manager123',
    mustResetPassword: false,
    status: 'active',
    failedLogins: 0,
    createdAt: daysAgo(119),
  },
  {
    id: 'usr_arjun',
    businessId: 'biz_kettle',
    role: 'staff',
    name: 'Arjun Patel',
    phone: '+91 98250 22222',
    email: 'arjun@kettlecrumb.in',
    demoPassword: 'staff123',
    mustResetPassword: false,
    status: 'active',
    failedLogins: 0,
    createdAt: daysAgo(110),
  },
  {
    id: 'usr_kavya',
    businessId: 'biz_kettle',
    role: 'staff',
    name: 'Kavya Iyer',
    phone: '+91 98250 33333',
    email: 'kavya@kettlecrumb.in',
    demoPassword: 'TEMP-4821',
    mustResetPassword: true,
    status: 'invited',
    failedLogins: 0,
    createdAt: daysAgo(1),
  },
  {
    id: 'usr_rohan',
    businessId: 'biz_roast',
    role: 'manager',
    name: 'Rohan Kulkarni',
    phone: '+91 98220 44444',
    email: 'rohan@roastritual.in',
    demoPassword: 'manager123',
    mustResetPassword: false,
    status: 'active',
    failedLogins: 0,
    createdAt: daysAgo(63),
  },
  {
    id: 'usr_nisha',
    businessId: 'biz_grind',
    role: 'manager',
    name: 'Nisha Desai',
    phone: '+91 98790 55555',
    email: 'nisha@morninggrind.in',
    demoPassword: 'manager123',
    mustResetPassword: false,
    status: 'active',
    failedLogins: 0,
    createdAt: daysAgo(17),
  },
]

const MENU_TEMPLATE = [
  {
    name: 'Coffee',
    items: [
      ['Espresso', 140],
      ['Cappuccino', 190],
      ['Flat White', 210],
      ['Cold Brew', 230],
    ],
  },
  { name: 'Tea', items: [['Masala Chai', 90], ['Matcha Latte', 240]] },
  { name: 'Shakes', items: [['Cold Coffee', 200], ['Hazelnut Frappe', 260]] },
  { name: 'Bakes', items: [['Butter Croissant', 150], ['Banana Bread', 130]] },
  { name: 'Sandwiches', items: [['Pesto Paneer Melt', 280], ['Egg Mayo', 220]] },
  { name: 'Bowls', items: [['Acai Bowl', 320]] },
  { name: 'Desserts', items: [['Tiramisu Cup', 240], ['Brownie', 160]] },
  { name: 'Beverages', items: [['Fresh Lime Soda', 110], ['Mineral Water', 40]] },
]

function buildMenu(businessId, prefix) {
  const categories = []
  const items = []
  MENU_TEMPLATE.forEach((category, categoryIndex) => {
    const categoryId = `${prefix}_cat_${categoryIndex}`
    categories.push({ id: categoryId, businessId, name: category.name, active: true })
    category.items.forEach(([name, price], itemIndex) => {
      items.push({
        id: `${prefix}_item_${categoryIndex}_${itemIndex}`,
        businessId,
        categoryId,
        name,
        price,
        active: !(name === 'Acai Bowl' && prefix === 'kc'),
      })
    })
  })
  return { categories, items }
}

const FIRST_NAMES = [
  'Aarav', 'Diya', 'Ishaan', 'Ananya', 'Vihaan', 'Saanvi', 'Kabir', 'Myra', 'Reyansh', 'Anika',
  'Aditya', 'Kiara', 'Arnav', 'Navya', 'Dhruv', 'Ira', 'Krish', 'Riya', 'Yash', 'Tara',
  'Neel', 'Pari', 'Om', 'Zoya', 'Veer', 'Meher', 'Advik', 'Siya', 'Rudra', 'Aisha',
]
const LAST_NAMES = ['Mehta', 'Shah', 'Patel', 'Joshi', 'Desai', 'Trivedi', 'Kapoor', 'Rao', 'Nair', 'Bhatt']

function buildCustomers(business, count, random, startSequence = 1) {
  const customers = []
  const cards = []
  for (let index = 0; index < count; index += 1) {
    const firstName = FIRST_NAMES[(index * 7 + business.name.length) % FIRST_NAMES.length]
    const lastName = LAST_NAMES[(index * 3 + 1) % LAST_NAMES.length]
    const id = `${business.cardPrefix.toLowerCase()}_cus_${index + 1}`
    const createdDaysAgo = random.int(2, 90)
    customers.push({
      id,
      businessId: business.id,
      name: `${firstName} ${lastName}`,
      phone: `+91 9${String(8100 + index * 13 + business.name.length).slice(-4)}${String(
        10000 + ((index * 7919) % 89999),
      ).slice(-5)}`.replace(/^(\+91 \d{5})(\d{5})$/, '$1 $2'),
      email: index % 3 === 0 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mail.com` : '',
      birthday: index % 4 === 0 ? `1995-${String((index % 12) + 1).padStart(2, '0')}-14` : '',
      createdAt: daysAgo(createdDaysAgo),
    })
    cards.push({
      id: `${id}_card`,
      businessId: business.id,
      customerId: id,
      cardNumber: generateCardNumber(business.cardPrefix, startSequence + index),
      qrToken: `blq_${business.cardPrefix.toLowerCase()}_${(index + 1) * 104729}`,
      status: 'active',
      issuedAt: daysAgo(createdDaysAgo),
    })
  }
  return { customers, cards }
}

function buildOffers(businessId, prefix) {
  return [
    {
      id: `${prefix}_offer_7th_bill`,
      businessId,
      name: '7th bill on us',
      ruleType: 'bill_count',
      scopeType: 'bill',
      scopeId: null,
      threshold: 6,
      rewardType: 'free_bill',
      rewardValue: 0,
      rewardCap: 400,
      minBillValue: 150,
      validFrom: isoDay(100),
      validTo: '',
      active: true,
      createdAt: daysAgo(100),
    },
    {
      id: `${prefix}_offer_coffee`,
      businessId,
      name: 'Coffee lovers',
      ruleType: 'item_count',
      scopeType: 'category',
      scopeId: `${prefix}_cat_0`,
      threshold: 6,
      rewardType: 'free_item',
      rewardValue: 0,
      rewardCap: 0,
      minBillValue: 0,
      validFrom: isoDay(100),
      validTo: '',
      active: true,
      createdAt: daysAgo(100),
    },
    {
      id: `${prefix}_offer_bakes`,
      businessId,
      name: 'Bake-off weekend',
      ruleType: 'item_count',
      scopeType: 'category',
      scopeId: `${prefix}_cat_3`,
      threshold: 5,
      rewardType: 'percent_off',
      rewardValue: 20,
      rewardCap: 150,
      minBillValue: 0,
      validFrom: isoDay(60),
      validTo: isoDay(10),
      active: false,
      createdAt: daysAgo(60),
    },
  ]
}

/** Replays generated bills through the offers engine so progress & rewards are consistent. */
function buildBills({ business, customers, menuItems, offers, staffIds, random, billCount }) {
  const itemsById = Object.fromEntries(menuItems.map((item) => [item.id, item]))
  const activeItems = menuItems.filter((item) => item.active)
  const popular = activeItems.filter((item) =>
    ['Cappuccino', 'Masala Chai', 'Cold Coffee', 'Butter Croissant', 'Flat White'].includes(item.name),
  )
  const regulars = customers.slice(0, Math.ceil(customers.length * 0.35))

  const drafts = []
  for (let index = 0; index < billCount; index += 1) {
    const customer = random.next() < 0.65 ? random.pick(regulars) : random.pick(customers)
    const lineCount = random.int(1, 3)
    const lines = []
    for (let line = 0; line < lineCount; line += 1) {
      const item = random.next() < 0.6 ? random.pick(popular) : random.pick(activeItems)
      const existing = lines.find((entry) => entry.itemId === item.id)
      if (existing) {
        existing.quantity += 1
        continue
      }
      lines.push({ itemId: item.id, name: item.name, quantity: random.int(1, 2), unitPrice: item.price })
    }
    const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
    drafts.push({
      businessId: business.id,
      customerId: customer.id,
      createdBy: random.pick(staffIds),
      lines,
      subtotal,
      discount: 0,
      total: subtotal,
      status: 'active',
      redeemedRewardId: null,
      redeemedOfferId: null,
      createdAt: daysAgo(random.int(0, 75), random.int(8, 21), random.int(0, 59)),
    })
  }
  drafts.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const bills = []
  const rewards = []
  const progressByKey = {}
  let rewardSequence = 0

  drafts.forEach((draft, index) => {
    const bill = { ...draft, id: `${business.cardPrefix.toLowerCase()}_bill_${index + 1}` }

    // Redeem roughly half of available rewards on the customer's next visit.
    const available = rewards.find(
      (reward) => reward.customerId === bill.customerId && reward.status === 'available',
    )
    if (available && random.next() < 0.55) {
      const offer = offers.find((entry) => entry.id === available.offerId)
      const discount =
        offer.rewardType === 'free_bill'
          ? Math.min(bill.subtotal, offer.rewardCap || Infinity)
          : Math.min(bill.lines[0].unitPrice, offer.rewardCap || Infinity)
      available.status = 'redeemed'
      available.redeemedBillId = bill.id
      bill.redeemedRewardId = available.id
      bill.redeemedOfferId = available.offerId
      bill.discount = discount
      bill.total = Math.max(0, bill.subtotal - discount)
    }

    const result = applyBillToOffers({
      bill,
      offers,
      itemsById,
      progressByKey,
      makeId: () => `${business.cardPrefix.toLowerCase()}_rwd_${(rewardSequence += 1)}`,
    })
    result.progressUpdates.forEach((row) => {
      progressByKey[progressKey(row.customerId, row.offerId)] = row
    })
    rewards.push(...result.newRewards)
    bills.push({ ...bill, contributions: result.contributions })
  })

  return { bills, rewards, progressByKey }
}

function buildSmsLog(business, customers, random) {
  const purposes = ['reward_alert', 'card_link', 'reward_alert', 'promotion']
  return Array.from({ length: 214 }, (_, index) => ({
    id: `${business.cardPrefix.toLowerCase()}_sms_${index + 1}`,
    businessId: business.id,
    customerId: random.pick(customers).id,
    purpose: random.pick(purposes),
    sentAt: daysAgo(random.int(0, new Date().getDate() - 1), random.int(9, 20)),
  }))
}

export function buildInitialState() {
  const random = createRandom(7)
  const state = {
    businesses,
    users,
    categories: [],
    items: [],
    customers: [],
    cards: [],
    offers: [],
    bills: [],
    rewards: [],
    progress: {},
    smsLog: [],
  }

  const sizing = { biz_kettle: [42, 420], biz_roast: [24, 160], biz_grind: [8, 30] }

  businesses.forEach((business) => {
    const prefix = business.cardPrefix.toLowerCase()
    const menu = buildMenu(business.id, prefix)
    const [customerCount, billCount] = sizing[business.id]
    const people = buildCustomers(business, customerCount, random)
    const offers = buildOffers(business.id, prefix)
    const staffIds = users.filter((user) => user.businessId === business.id).map((user) => user.id)
    const billing = buildBills({
      business,
      customers: people.customers,
      menuItems: menu.items,
      offers,
      staffIds,
      random,
      billCount,
    })

    state.categories.push(...menu.categories)
    state.items.push(...menu.items)
    state.customers.push(...people.customers)
    state.cards.push(...people.cards)
    state.offers.push(...offers)
    state.bills.push(...billing.bills)
    state.rewards.push(...billing.rewards)
    Object.assign(state.progress, billing.progressByKey)
    if (business.plan === 'platinum') state.smsLog.push(...buildSmsLog(business, people.customers, random))
  })

  return state
}

export const DEMO_ACCOUNTS = [
  { label: 'Platform admin', identifier: 'admin@brewloop.app', password: 'admin123' },
  { label: 'Manager · Platinum café', identifier: 'meera@kettlecrumb.in', password: 'manager123' },
  { label: 'Staff · counter', identifier: 'arjun@kettlecrumb.in', password: 'staff123' },
  { label: 'Manager · Silver café', identifier: 'nisha@morninggrind.in', password: 'manager123' },
  { label: 'First login (temp password)', identifier: 'kavya@kettlecrumb.in', password: 'TEMP-4821' },
]
