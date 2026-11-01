const TONES = {
  default: 'bg-white',
  ink: 'bg-espresso-900 text-cream-50',
  sage: 'bg-tint-sage',
  stone: 'bg-tint-stone',
  blush: 'bg-tint-blush',
  mist: 'bg-tint-mist',
  sand: 'bg-tint-sand',
}

/** KPI tile: serif figure, quiet label. Tinted tones for bento rows. */
export default function StatTile({ label, value, detail, icon: Icon, tone = 'default' }) {
  const dark = tone === 'ink'
  return (
    <div className={`flex min-w-0 flex-col justify-between rounded-2xl p-5 shadow-card ${TONES[tone] ?? TONES.default}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[13px] font-medium ${dark ? 'text-cream-300' : 'text-espresso-600'}`}>{label}</p>
        {Icon && <Icon className={`size-4 shrink-0 ${dark ? 'text-cream-300' : 'text-espresso-400'}`} strokeWidth={1.75} />}
      </div>
      <div>
        <p className="tabular display-title mt-4 truncate text-[40px] leading-none text-inherit">{value}</p>
        {detail && <p className={`mt-2 text-[13px] ${dark ? 'text-cream-300' : 'text-espresso-500'}`}>{detail}</p>}
      </div>
    </div>
  )
}
