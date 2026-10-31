const TONES = {
  neutral: 'bg-cream-200/70 text-espresso-700',
  success: 'bg-leaf-50 text-leaf-700',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-700',
  accent: 'bg-roast-50 text-roast-700',
  dark: 'bg-espresso-900 text-cream-50',
  new: 'bg-tint-sage text-espresso-800',
  silver: 'bg-cream-200 text-espresso-700',
  gold: 'bg-tint-sand text-amber-900',
  platinum: 'bg-espresso-900 text-cream-50',
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
