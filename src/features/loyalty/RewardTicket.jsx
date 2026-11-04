import { Gift } from 'lucide-react'

import { rewardCapNote, rewardTitle } from './loyaltyPresentation'
import { formatRelative } from '../../utils/format'

/** An earned reward, styled as a tear-off ticket. */
export default function RewardTicket({ reward, offer, lookups }) {
  const capNote = rewardCapNote(offer)

  return (
    <div className="drop-shadow-[0_8px_16px_rgb(23_21_19/0.14)] transition duration-200 hover:-translate-y-0.5 hover:-rotate-[0.6deg]">
      <div className="reward-ticket ticket-shine relative flex min-h-24 overflow-hidden rounded-2xl">
        <div className="ticket-stub wallet-surface flex w-[84px] shrink-0 items-center justify-center border-r-2 border-dashed border-white/25 text-[var(--tone-ink)]">
          <Gift className="size-7" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 bg-white p-4 dark:bg-[#1f1c19]">
          <p className="display-title truncate text-2xl leading-tight">{rewardTitle(offer, lookups)}</p>
          <p className="mt-0.5 truncate text-[13px] text-espresso-600 dark:text-cream-200">
            {offer?.name ?? 'Loyalty reward'}
            {capNote && ` · ${capNote}`}
          </p>
          <p className="mt-1.5 text-xs text-espresso-500 dark:text-cream-300/80">Earned {formatRelative(reward.createdAt)} · Ask at checkout</p>
        </div>
      </div>
    </div>
  )
}
