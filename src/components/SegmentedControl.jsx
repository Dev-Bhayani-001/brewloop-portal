export default function SegmentedControl({ options, value, onChange, size = 'md', label }) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-[13px]' : 'px-3.5 py-1.5 text-sm'
  return (
    <div
      className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-full bg-cream-200/60 p-1 transition-colors dark:bg-white/8 dark:ring-1 dark:ring-white/10"
      role="tablist"
      aria-label={label}
    >
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`rounded-full font-medium whitespace-nowrap transition ${pad} ${
              active
                ? 'bg-white text-espresso-900 shadow-card dark:bg-[#25221e] dark:text-cream-50 dark:shadow-none'
                : 'text-espresso-500 hover:text-espresso-900 dark:text-cream-300/70 dark:hover:text-cream-50'
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className="ml-1.5 tabular text-espresso-400 dark:text-cream-300/50">{option.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
