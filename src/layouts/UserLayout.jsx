import { useSelector } from 'react-redux'
import { CreditCard, ReceiptText, Sparkles } from 'lucide-react'

import AppShell from './AppShell'
import { selectCurrentBusiness, selectCurrentCustomer } from '../app/selectors'

function UserHeader({ business, customer }) {
  return (
    <div className="mx-1 rounded-3xl bg-white/6 p-3.5 ring-1 ring-white/10">
      <p className="display-title truncate text-[20px] leading-none text-cream-50">{business?.name ?? 'Brewloop Cafés'}</p>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="rounded-full bg-roast-400/20 px-2 py-0.5 text-[11px] font-medium text-roast-200 ring-1 ring-roast-400/30">
          Customer Portal
        </span>
        <span className="text-xs text-cream-300">Multi-Café Access</span>
      </div>
      {customer && (
        <p className="mt-2 text-xs text-cream-300/80">
          Signed in as <span className="font-medium text-cream-50">{customer.name}</span>
        </p>
      )}
    </div>
  )
}

export default function UserLayout() {
  const business = useSelector(selectCurrentBusiness)
  const customer = useSelector(selectCurrentCustomer)

  const navigation = [
    {
      title: 'Member Access',
      items: [
        { to: '/portal/loyalty', label: 'My Loyalty', icon: CreditCard },
        { to: '/portal/bills', label: 'My Bills', icon: ReceiptText },
      ],
    },
  ]

  const mobileTabs = [
    { to: '/portal/loyalty', label: 'Loyalty', icon: CreditCard },
    { to: '/portal/bills', label: 'Bills', icon: ReceiptText },
  ]

  const commands = [
    { to: '/portal/loyalty', label: 'View my loyalty cards & stamps', icon: Sparkles },
    { to: '/portal/bills', label: 'View my bills and receipts', icon: ReceiptText },
  ]

  return (
    <AppShell
      navigation={navigation}
      header={<UserHeader business={business} customer={customer} />}
      mobileTabs={mobileTabs}
      commands={commands}
    />
  )
}
