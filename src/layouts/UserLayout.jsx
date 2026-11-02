import { useSelector } from 'react-redux'
import { CreditCard, ReceiptText, Sparkles } from 'lucide-react'

import AppShell from './AppShell'
import SidebarCafeCard from '../features/loyalty/SidebarCafeCard'
import { selectCustomerCards } from '../app/selectors'

export default function UserLayout() {
  const cards = useSelector(selectCustomerCards)
  const rewardCount = cards.reduce((sum, entry) => sum + entry.availableRewards.length, 0)

  const navigation = [
    {
      items: [
        { to: '/portal/loyalty', label: 'My Loyalty', icon: CreditCard, badge: rewardCount, badgeLabel: 'rewards ready' },
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
      header={({ onNavigate }) => <SidebarCafeCard onNavigate={onNavigate} />}
      mobileTabs={mobileTabs}
      commands={commands}
      minimalChrome
    />
  )
}
