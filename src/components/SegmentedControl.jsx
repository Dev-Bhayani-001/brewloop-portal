export default function SegmentedControl({ options, value, onChange, size = 'md', label }) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-[13px]' : 'px-3.5 py-1.5 text-sm'
  return (
    <div
      className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-full bg-cream-200/60 p-1"
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
              active ? 'bg-white text-espresso-900 shadow-card' : 'text-espresso-500 hover:text-espresso-900'
            }`}
          >
            {option.label}
            {option.count !== undefined && <span className="ml-1.5 text-espresso-400 tabular">{option.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
