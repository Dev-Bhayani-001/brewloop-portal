/** Compact circular progress, coloured by the surrounding card tone. Shows the count unless given children. */
export default function ProgressRing({ count, threshold, className = 'size-11', inverted = false, children }) {
  const percent = threshold > 0 ? Math.min(100, (count / threshold) * 100) : 0

  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
        <circle cx="22" cy="22" r="18" fill="none" strokeWidth="4" className={inverted ? 'stroke-white/15' : 'stroke-cream-200 dark:stroke-white/10'} />
        {/* Skipped at zero: a round linecap would still draw a dot. */}
        {percent > 0 && (
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${percent} 100`}
            className="stroke-[var(--tone-glow)] transition-[stroke-dasharray] duration-500"
          />
        )}
      </svg>
      <span className={`tabular font-semibold tracking-tight ${!children && threshold >= 10 ? 'text-[9px]' : 'text-[11px]'} ${inverted ? 'text-cream-50' : 'text-espresso-800 dark:text-cream-100'}`}>
        {children ?? `${count}/${threshold}`}
      </span>
    </span>
  )
}
