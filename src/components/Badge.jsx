const TONES = {
  neutral: 'bg-cream-200/70 text-espresso-700 dark:bg-white/10 dark:text-cream-200',
  success: 'bg-leaf-50 text-leaf-700 dark:bg-leaf-700/25 dark:text-leaf-500',
  warning: 'bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  accent: 'bg-roast-50 text-roast-700 dark:bg-roast-500/25 dark:text-roast-200',
  dark: 'bg-espresso-900 text-cream-50 dark:bg-white/10 dark:text-cream-50',
  new: 'bg-tint-sage text-espresso-800 dark:bg-emerald-950 dark:text-emerald-300',
  silver: 'bg-cream-200 text-espresso-700 dark:bg-stone-800 dark:text-stone-300',
  gold: 'bg-tint-sand text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  platinum: 'bg-espresso-900 text-cream-50 dark:bg-white/15 dark:text-cream-50',
}

export default function Badge({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap capitalize ${TONES[tone]} ${className}`}
    >
      {Icon && <Icon className="size-3" strokeWidth={2} />}
      {children}
    </span>
  )
}
