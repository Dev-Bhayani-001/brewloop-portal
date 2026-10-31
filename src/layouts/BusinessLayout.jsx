import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  BarChart3,
  Coffee,
  Home,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react'

import AppShell from './AppShell'
import PlanBadge from '../components/PlanBadge'
import {
  selectCardsByCustomer,
  selectCurrentBusiness,
  selectCustomers,
  selectFeatures,
  selectSession,
} from '../app/selectors'
import { matchesCustomer } from '../hooks/useCustomerSearch'
import { can } from '../utils/permissions'

function BusinessHeader({ business }) {
  return (
    <div className="mx-1 rounded-3xl bg-white/6 p-3.5 ring-1 ring-white/10">
      <p className="display-title truncate text-[20px] leading-none text-cream-50">{business?.name}</p>
      <div className="mt-1.5 flex items-center gap-2">
        <PlanBadge plan={business?.plan} />
        <span className="text-xs text-cream-300">{business?.city}</span>
      </div>
    </div>
  )
}

export default function BusinessLayout() {
  const session = useSelector(selectSession)
  const business = useSelector(selectCurrentBusiness)
  const features = useSelector(selectFeatures)
  const customers = useSelector(selectCustomers)
  const cardsByCustomer = useSelector(selectCardsByCustomer)
  const role = session?.role

  const counter = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/bills/new', label: 'New bill', icon: Plus },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/bills', label: 'Bills', icon: ReceiptText, end: true },
  ]

  const manage = [
    can(role, 'menu') && { to: '/menu', label: 'Menu', icon: Coffee },
    can(role, 'offers') && { to: '/offers', label: 'Offers', icon: Sparkles },
    can(role, 'analytics') && { to: '/analytics', label: 'Analytics', icon: BarChart3, locked: !features.analytics },
    can(role, 'settings') && { to: '/settings', label: 'Business', icon: Settings },
  ].filter(Boolean)

  const navigation = [{ title: 'Counter', items: counter }]
  if (manage.length) navigation.push({ title: 'Manage', items: manage })

  const mobileTabs = [
    counter[0],
    counter[2],
    { ...counter[1], primary: true },
    counter[3],
    { action: 'palette', label: 'Search', icon: Search },
  ]

  const commands = [
    { to: '/bills/new', label: 'Start a new bill', icon: Plus, keywords: 'bill sale checkout' },
    { to: '/customers?add=1', label: 'Add a customer', icon: UserPlus, keywords: 'new member card' },
    ...counter.filter((item) => item.to !== '/bills/new').map((item) => ({ ...item, label: `Go to ${item.label}` })),
    ...manage.map((item) => ({ ...item, label: `Go to ${item.label}` })),
    can(role, 'offers') && { to: '/offers/new', label: 'Create an offer', icon: Sparkles, keywords: 'reward stamp' },
  ].filter(Boolean)

  const searchPeople = useCallback(
    (query) =>
      customers
        .filter((customer) => matchesCustomer(customer, cardsByCustomer[customer.id], query))
        .slice(0, 5)
        .map((customer) => ({
          id: customer.id,
          label: customer.name,
          sublabel: `${customer.phone} · ${cardsByCustomer[customer.id]?.cardNumber ?? ''}`,
          to: `/customers/${customer.id}`,
        })),
    [customers, cardsByCustomer],
  )

  return (
    <AppShell
      navigation={navigation}
      header={<BusinessHeader business={business} />}
      mobileTabs={mobileTabs}
      commands={commands}
      searchPeople={searchPeople}
    />
  )
}
