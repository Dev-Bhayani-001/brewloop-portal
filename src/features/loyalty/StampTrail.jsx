import { Coffee, Gift, ReceiptText } from 'lucide-react'

// Fixed offsets so stamps look hand-pressed without shifting between renders.
const STAMP_ROTATIONS = ['-9deg', '6deg', '-4deg', '10deg', '-7deg', '4deg']

const SLOT = 'flex shrink-0 items-center justify-center rounded-full size-9 sm:size-13'

function InkedStamp({ index, icon: Icon }) {
  return (
    <li
      className={`${SLOT} stamp-inked bg-[var(--tone-ink)] text-espresso-950 shadow-[inset_0_0_0_2px_rgb(0_0_0/0.12)]`}
      style={{
        '--stamp-rotate': STAMP_ROTATIONS[index % STAMP_ROTATIONS.length],
        animationDelay: `${index * 90}ms`,
      }}
    >
      <Icon className="size-4 sm:size-6" strokeWidth={2} />
    </li>
  )
}

function EmptySlot({ isNext, number }) {
  return (
    <li
      className={`${SLOT} border-[1.5px] border-dashed border-white/25 text-[13px] font-medium text-cream-50/45 ${
        isNext ? 'stamp-next' : ''
      }`}
    >
      {number}
    </li>
  )
}

/** Punch-card progress: one pressed stamp per unit earned, ending on the reward. */
export default function StampTrail({ count, threshold, rewardLabel, ruleType }) {
  // Visit-based offers stamp a receipt: the customer isn't necessarily buying coffee.
  const stampIcon = ruleType === 'bill_count' ? ReceiptText : Coffee
  const label = `${count} of ${threshold} stamps collected. Reward: ${rewardLabel}.`

  // Long programmes don't fit as a row of stamps, so they read as a meter instead.
  if (threshold > 12) {
    return (
      <div role="img" aria-label={label} className="flex items-center gap-4">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[var(--tone-ink)] transition-[width] duration-500"
            style={{ width: `${Math.min(100, (count / threshold) * 100)}%` }}
          />
        </div>
        <span className="tabular text-sm text-cream-200">
          {count}/{threshold}
        </span>
        <span className="stamp-reward flex size-11 items-center justify-center rounded-full bg-cream-50 text-espresso-950">
          <Gift className="size-5" />
        </span>
      </div>
    )
  }

  return (
    <ol aria-label={label} className="flex flex-wrap items-center gap-1 sm:gap-2.5">
      {Array.from({ length: threshold }, (_, index) =>
        index < count ? (
          <InkedStamp key={index} index={index} icon={stampIcon} />
        ) : (
          <EmptySlot key={index} number={index + 1} isNext={index === count} />
        ),
      )}
      <li
        title={rewardLabel}
        className={`${SLOT} stamp-reward bg-cream-50 text-espresso-950`}
      >
        <Gift className="size-4 sm:size-6" strokeWidth={2} />
      </li>
    </ol>
  )
}
