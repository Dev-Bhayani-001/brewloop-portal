const TONES = {
  default: 'bg-white text-espresso-900 shadow-card dark:bg-[#1a1816] dark:text-cream-50 dark:ring-1 dark:ring-white/10 dark:shadow-none',
  ink: 'bg-espresso-900 text-cream-50 dark:bg-[#151412] dark:ring-1 dark:ring-white/10',
  sage: 'bg-tint-sage text-espresso-900 dark:bg-[#1b221a] dark:text-cream-50 dark:ring-1 dark:ring-leaf-700/30',
  stone: 'bg-tint-stone text-espresso-900 dark:bg-[#201e1b] dark:text-cream-50 dark:ring-1 dark:ring-white/10',
  blush: 'bg-tint-blush text-espresso-900 dark:bg-[#271d19] dark:text-cream-50 dark:ring-1 dark:ring-roast-700/30',
  mist: 'bg-tint-mist text-espresso-900 dark:bg-[#192025] dark:text-cream-50 dark:ring-1 dark:ring-white/10',
  sand: 'bg-tint-sand text-espresso-900 dark:bg-[#231f16] dark:text-cream-50 dark:ring-1 dark:ring-amber-800/30',
}

/** KPI tile: serif figure, quiet label. Tinted tones for bento rows. */
export default function StatTile({ label, value, detail, icon: Icon, tone = 'default' }) {
  const dark = tone === 'ink'
  return (
    <div className={`flex min-w-0 flex-col justify-between rounded-2xl p-5 transition-colors ${TONES[tone] ?? TONES.default}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[13px] font-medium ${dark ? 'text-cream-300' : 'text-espresso-600 dark:text-cream-200/80'}`}>{label}</p>
        {Icon && <Icon className={`size-4 shrink-0 ${dark ? 'text-cream-300' : 'text-espresso-400 dark:text-cream-300/60'}`} strokeWidth={1.75} />}
      </div>
      <div>
        <p className="tabular display-title mt-4 truncate text-[40px] leading-none text-inherit">{value}</p>
        {detail && <p className={`mt-2 text-[13px] ${dark ? 'text-cream-300' : 'text-espresso-500 dark:text-espresso-400'}`}>{detail}</p>}
      </div>
    </div>
  )
}
