import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Building2, Gem, Plus, UsersRound } from 'lucide-react'

import AppShell from './AppShell'

const navigation = [
  {
    title: 'Platform',
    items: [
      { to: '/admin', label: 'Businesses', icon: Building2, end: true },
      { to: '/admin/members', label: 'Members', icon: UsersRound },
      { to: '/admin/plans', label: 'Plans', icon: Gem },
    ],
  },
]

const commands = [
  { to: '/admin?onboard=1', label: 'Onboard a business', icon: Plus, keywords: 'new create cafe shop' },
  { to: '/admin/members?add=1', label: 'Add a member', icon: Plus, keywords: 'manager staff user' },
  ...navigation[0].items.map((item) => ({ ...item, label: `Go to ${item.label}` })),
]

function AdminHeader() {
  return (
    <div className="mx-1 rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10">
      <p className="display-title text-[20px] leading-none text-cream-50">Admin console</p>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-cream-300">
        <span className="size-1.5 rounded-full bg-roast-400" /> Brewloop team only
      </p>
    </div>
  )
}

export default function AdminLayout() {
  const businesses = useSelector((state) => state.admin.businesses)

  // Palette rows for businesses, so admins can jump straight to one.
  const searchBusinesses = useCallback(
    (query) =>
      businesses
        .filter((business) => `${business.name} ${business.city}`.toLowerCase().includes(query))
        .slice(0, 5)
        .map((business) => ({
          id: business.id,
          label: business.name,
          sublabel: business.city,
          to: `/admin/businesses/${business.id}`,
        })),
    [businesses],
  )

  return <AppShell navigation={navigation} header={<AdminHeader />} commands={commands} searchPeople={searchBusinesses} peopleLabel="Businesses" />
}
