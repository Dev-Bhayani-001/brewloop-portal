/** Pass size="sm" for the smaller terracotta version. */
export default function Switch({ checked, onChange, label, disabled, size = 'md' }) {
  const small = size === 'sm'
  const onColor = small ? 'bg-roast-500' : 'bg-espresso-900 dark:bg-roast-500'
  const onOffset = small ? 'translate-x-4' : 'translate-x-4.5'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 items-center rounded-full transition disabled:opacity-40 ${
        small ? 'h-5 w-[34px]' : 'h-6 w-10'
      } ${checked ? onColor : 'bg-cream-300 dark:bg-white/20 dark:ring-1 dark:ring-white/10'}`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow-sm transition-transform ${small ? 'size-4' : 'size-5'} ${
          checked ? onOffset : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
