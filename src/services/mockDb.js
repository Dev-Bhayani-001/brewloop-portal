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
    id: 'usr_customer',
    businessId: 'biz_kettle',
    customerId: 'kc_cus_1',
    role: 'customer',
    name: 'Dhruv Shah',
    phone: '+91 98250 99999',
    email: 'customer@brewloop.app',
    demoPassword: 'user123',
    mustResetPassword: false,
    status: 'active',
    failedLogins: 0,
    createdAt: daysAgo(90),
  },
  {
    id: 'usr_customer_new',
    businessId: 'biz_kettle',
    customerId: null,
    role: 'customer',
    name: 'Tara Nair',
    phone: '+91 98250 88888',
    email: 'newcustomer@brewloop.app',
    demoPassword: 'user123',
    mustResetPassword: false,
    status: 'active',
    failedLogins: 0,
    createdAt: daysAgo(1),
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
      ['Espresso', 140, { calories: 5, description: 'Rich, intense double shot with golden crema', healthy: false, dietary: ['Sugar-Free'] }],
      ['Cappuccino', 190, { calories: 120, description: 'Balanced espresso with velvety steamed milk foam', healthy: false }],
      ['Flat White', 210, { calories: 135, description: 'Smooth microfoam poured over double espresso ristretto', healthy: false }],
      ['Cold Brew', 230, { calories: 5, description: 'Steeped for 16 hours, naturally sweet and smooth', healthy: true, dietary: ['Sugar-Free'] }],
    ],
  },
  {
    name: 'Tea',
    items: [
      ['Masala Chai', 90, { calories: 95, description: 'Spiced Indian black tea brewed with fresh ginger and cardamom' }],
      ['Matcha Latte', 240, { calories: 140, description: 'Ceremonial Japanese matcha whisked with oat milk', healthy: true, dietary: ['Vegan'] }],
    ],
  },
  {
    name: 'Shakes',
    items: [
      ['Cold Coffee', 200, { calories: 210, description: 'Classic blended iced coffee with milk and vanilla syrup' }],
      ['Hazelnut Frappe', 260, { calories: 290, description: 'Decadent blended espresso with roasted hazelnut drizzle' }],
    ],
  },
  {
    name: 'Bakes',
    items: [
      ['Butter Croissant', 150, { calories: 260, description: 'Flaky, buttery French pastry baked fresh daily' }],
      ['Banana Bread', 130, { calories: 195, description: 'Moist walnut banana loaf slice with cinnamon' }],
    ],
  },
  {
    name: 'Sandwiches',
    items: [
      ['Pesto Paneer Melt', 280, { calories: 340, description: 'Grilled multigrain panini with basil pesto and fresh cottage cheese' }],
      ['Egg Mayo', 220, { calories: 280, description: 'Creamy egg salad with cracked black pepper and chives' }],
    ],
  },
  {
    name: 'Bowls',
    items: [
      ['Acai Bowl', 320, { calories: 240, description: 'Organic acai topped with fresh berries, chia seeds & house granola', healthy: true, dietary: ['Vegan', 'High Protein'] }],
    ],
  },
  {
    name: 'Desserts',
    items: [
      ['Tiramisu Cup', 240, { calories: 310, description: 'Espresso-soaked ladyfingers with mascarpone cream' }],
      ['Brownie', 160, { calories: 270, description: 'Warm fudge dark chocolate brownie' }],
    ],
  },
  {
    name: 'Beverages',
    items: [
      ['Fresh Lime Soda', 110, { calories: 45, description: 'Zesty fresh lime with sparkling soda, sweet or salted', healthy: true }],
      ['Mineral Water', 40, { calories: 0, description: 'Chilled natural spring water 500ml', healthy: true, dietary: ['Sugar-Free'] }],
    ],
  },
]

function buildMenu(businessId, prefix) {
  const categories = []
  const items = []
  MENU_TEMPLATE.forEach((category, categoryIndex) => {
    const categoryId = `${prefix}_cat_${categoryIndex}`
    categories.push({ id: categoryId, businessId, name: category.name, active: true })
    category.items.forEach(([name, price, meta = {}], itemIndex) => {
      items.push({
        id: `${prefix}_item_${categoryIndex}_${itemIndex}`,
        businessId,
        categoryId,
        name,
        price,
        active: !(name === 'Acai Bowl' && prefix === 'kc'),
        description: meta.description ?? null,
        calories: meta.calories ?? null,
        healthy: meta.healthy ?? false,
        dietary: meta.dietary ?? [],
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
    const isDemoCustomer = index === 0
    customers.push({
      id,
      businessId: business.id,
      name: isDemoCustomer ? 'Dhruv Shah' : `${firstName} ${lastName}`,
      phone: isDemoCustomer
        ? '+91 98250 99999'
        : `+91 9${String(8100 + index * 13 + business.name.length).slice(-4)}${String(
            10000 + ((index * 7919) % 89999),
          ).slice(-5)}`.replace(/^(\+91 \d{5})(\d{5})$/, '$1 $2'),
      email: isDemoCustomer ? 'customer@brewloop.app' : index % 3 === 0 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mail.com` : '',
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

const withoutLiveOffers = (offers) => offers.map((offer) => ({ ...offer, active: false }))

/**
 * Small cafés that put the demo customer's wallet into each state the loyalty page
 * handles, so they can all be seen without editing data. Progress is set directly
 * rather than replayed from bills, which keeps each state exact.
 */
const DEMO_SCENARIOS = [
  {
    // No live offers and nothing to claim.
    business: { id: 'biz_quiet', name: 'Quiet Corner', city: 'Vadodara', cardPrefix: 'QC' },
    configureOffers: withoutLiveOffers,
  },
  {
    // Every offer has ended, but a reward earned earlier is still unclaimed.
    business: { id: 'biz_lastcall', name: 'Last Call', city: 'Rajkot', cardPrefix: 'LC' },
    configureOffers: (offers) => offers.map((offer) => ({ ...offer, validTo: isoDay(5) })),
    rewardOffers: ['coffee'],
  },
  {
    // Brand-new member: offers are live, no stamps yet.
    business: { id: 'biz_firstsip', name: 'First Sip', city: 'Mumbai', cardPrefix: 'FS' },
  },
  {
    // More than one reward waiting at the same café.
    business: { id: 'biz_doubleshot', name: 'Double Shot', city: 'Jaipur', cardPrefix: 'DS' },
    progress: { coffee: 2, '7th_bill': 1 },
    rewardOffers: ['coffee', '7th_bill'],
  },
  {
    // Too many stamps for a row of slots, so the page falls back to a meter.
    business: { id: 'biz_longpour', name: 'Long Pour', city: 'Bengaluru', cardPrefix: 'LP' },
    configureOffers: (offers) =>
      offers
        .filter((offer) => offer.id.endsWith('_offer_coffee'))
        .map((offer) => ({ ...offer, threshold: 20 })),
    progress: { coffee: 13 },
  },
  {
    // Visit-based only: stamps come from bills, so there's no list of qualifying items.
    business: { id: 'biz_regulars', name: 'Regulars Table', city: 'Chennai', cardPrefix: 'RT' },
    configureOffers: (offers) => offers.filter((offer) => offer.id.endsWith('_offer_7th_bill')),
    progress: { '7th_bill': 3 },
  },
]

/** Everyday cafés that take the demo wallet past 20 cards: [name, city, prefix, coffee stamps, visit stamps, rewards]. */
const DEMO_EXTRA_CAFES = [
  ['Bean Theory', 'Ahmedabad', 'BT', 5, 2, ['coffee']],
  ['Copper Kettle', 'Pune', 'CK', 4, 5, []],
  ['Filter House', 'Chennai', 'FH', 1, 0, []],
  ['Saffron Cup', 'Jaipur', 'SC', 2, 3, []],
  ['Monsoon Roasters', 'Kochi', 'MR', 5, 1, []],
  ['The Daily Drip', 'Mumbai', 'DD', 0, 1, ['7th_bill']],
  ['Old Town Brew', 'Delhi', 'OT', 3, 4, []],
  ['Marigold Café', 'Udaipur', 'MC', 1, 1, []],
  ['Northern Lights', 'Shimla', 'NL', 4, 0, []],
  ['Pour Decisions', 'Bengaluru', 'PD', 2, 2, []],
  ['Sunday Roast Co.', 'Goa', 'SR', 0, 0, []],
  ['Tamarind Tree', 'Hyderabad', 'TT', 3, 1, ['coffee']],
  ['Verandah', 'Kolkata', 'VR', 5, 5, []],
  ['Wild Bean', 'Coorg', 'WB', 1, 3, []],
  ['Yellow Door', 'Lucknow', 'YD', 2, 0, []],
].map(([name, city, cardPrefix, coffee, visits, rewardOffers]) => ({
  business: { id: `biz_${cardPrefix.toLowerCase()}`, name, city, cardPrefix },
  progress: { coffee, '7th_bill': visits },
  rewardOffers,
}))

/** Past visits matching a scenario's stamps, so its receipts agree with its progress. */
function buildScenarioBills(business, customer, offers, items, progress) {
  const prefix = business.cardPrefix.toLowerCase()
  const coffeeStamps = progress.coffee ?? 0
  const visitStamps = progress['7th_bill'] ?? 0
  const cappuccino = items.find((item) => item.id === `${prefix}_item_0_1`)
  const croissant = items.find((item) => item.id === `${prefix}_item_3_0`)
  const dayOffset = prefix.charCodeAt(0) % 5

  return Array.from({ length: Math.max(coffeeStamps, visitStamps) }, (_, index) => {
    const item = index < coffeeStamps ? cappuccino : croissant
    const contributions = []
    if (index < coffeeStamps) contributions.push({ offerId: `${prefix}_offer_coffee`, units: 1, rewardsEarned: 0 })
    if (index < visitStamps) contributions.push({ offerId: `${prefix}_offer_7th_bill`, units: 1, rewardsEarned: 0 })
    return {
      id: `${prefix}_bill_${index + 1}`,
      businessId: business.id,
      customerId: customer.id,
      createdBy: null,
      lines: [{ itemId: item.id, name: item.name, quantity: 1, unitPrice: item.price }],
      subtotal: item.price,
      discount: 0,
      total: item.price,
      status: 'active',
      redeemedRewardId: null,
      redeemedOfferId: null,
      createdAt: daysAgo(dayOffset + 2 + index * 5, 9 + (index % 10), 15),
      contributions,
    }
  })
}

function seedScenario(state, scenario, random) {
  const business = { plan: 'silver', status: 'active', createdAt: daysAgo(30), ...scenario.business }
  const prefix = business.cardPrefix.toLowerCase()
  const menu = buildMenu(business.id, prefix)
  const people = buildCustomers(business, 1, random)
  const [customer] = people.customers
  const allOffers = buildOffers(business.id, prefix).filter((offer) => offer.active)
  const offers = scenario.configureOffers?.(allOffers) ?? allOffers

  state.businesses.push(business)
  state.categories.push(...menu.categories)
  state.items.push(...menu.items)
  state.customers.push(...people.customers)
  state.cards.push(...people.cards)
  state.offers.push(...offers)

  Object.entries(scenario.progress ?? {}).forEach(([offerKey, count]) => {
    const offer = offers.find((entry) => entry.id === `${prefix}_offer_${offerKey}`)
    state.progress[progressKey(customer.id, offer.id)] = {
      customerId: customer.id,
      offerId: offer.id,
      count,
      thresholdSnapshot: offer.threshold,
      cycleStartedAt: daysAgo(14),
    }
  })

  state.bills.push(...buildScenarioBills(business, customer, offers, menu.items, scenario.progress ?? {}))

  ;(scenario.rewardOffers ?? []).forEach((offerKey, index) => {
    state.rewards.push({
      id: `${prefix}_rwd_${index + 1}`,
      businessId: business.id,
      customerId: customer.id,
      offerId: `${prefix}_offer_${offerKey}`,
      status: 'available',
      earnedBillId: null,
      redeemedBillId: null,
      createdAt: daysAgo(6 + index),
    })
  })
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
    businesses: [...businesses],
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

  // Seeded last so the shared random sequence, and the cafés above, stay unchanged.
  for (const scenario of [...DEMO_SCENARIOS, ...DEMO_EXTRA_CAFES]) seedScenario(state, scenario, random)

  return state
}

export const DEMO_ACCOUNTS = [
  { label: 'Platform admin', identifier: 'admin@brewloop.app', password: 'admin123' },
  { label: 'Manager · Platinum café', identifier: 'meera@kettlecrumb.in', password: 'manager123' },
  { label: 'Staff · counter', identifier: 'arjun@kettlecrumb.in', password: 'staff123' },
  { label: 'Customer · User panel', identifier: 'customer@brewloop.app', password: 'user123' },
  { label: 'Customer · No cards yet', identifier: 'newcustomer@brewloop.app', password: 'user123' },
  { label: 'Manager · Silver café', identifier: 'nisha@morninggrind.in', password: 'manager123' },
  { label: 'First login (temp password)', identifier: 'kavya@kettlecrumb.in', password: 'TEMP-4821' },
]
