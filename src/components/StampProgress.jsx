/**
 * Refined stamp card: filled dots for stamps, a ringed accent dot for the reward.
 * Large thresholds fall back to a slim progress bar.
 */
export default function StampProgress({ count, threshold, size = 'md' }) {
  const label = `${count} of ${threshold} stamps`

  if (threshold > 12) {
    return (
      <div aria-label={label} className="w-40">
        <div className="h-1.5 overflow-hidden rounded-full bg-cream-200">
          <div className="h-full rounded-full bg-espresso-900" style={{ width: `${(count / threshold) * 100}%` }} />
        </div>
      </div>
    )
  }

  const dot = size === 'sm' ? 'size-3' : 'size-4'
  return (
    <ol className="flex flex-wrap items-center gap-1.5" aria-label={label}>
      {Array.from({ length: threshold }, (_, index) => (
        <li
          key={index}
          className={`${dot} rounded-full transition ${index < count ? 'bg-espresso-900' : 'bg-cream-200 ring-1 ring-inset ring-espresso-900/5'}`}
        />
      ))}
      <li className={`${dot} rounded-full bg-roast-400 ring-2 ring-roast-100 ring-offset-1`} title="Reward" />
    </ol>
  )
}
