export default function BrandMark({ inverted = false, showWordmark = true }) {
  const ink = inverted ? '#fdfcfa' : '#171513'
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 28 28" className="size-7" aria-hidden="true">
        <circle cx="14" cy="14" r="9" fill="none" stroke={ink} strokeWidth="2.2" />
        <circle cx="20.4" cy="7.6" r="2.8" fill="#c9734a" />
      </svg>
      {showWordmark && (
        <span className={`display-title text-[26px] leading-none ${inverted ? 'text-cream-50' : ''}`}>brewloop</span>
      )}
    </span>
  )
}
