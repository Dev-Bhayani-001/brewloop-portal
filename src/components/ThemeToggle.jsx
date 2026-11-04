import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'Auto', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon },
]

export default function ThemeToggle({ className = '', compact = false, variant = 'auto' }) {
  const { theme, setTheme } = useTheme()

  const isSidebar = variant === 'sidebar'

  const containerClasses = isSidebar
    ? 'bg-white/8 ring-1 ring-white/10 p-0.5'
    : 'bg-cream-200/60 ring-1 ring-espresso-900/10 dark:bg-white/10 dark:ring-white/15 p-1'

  const activeClasses = isSidebar
    ? 'bg-white text-espresso-950 shadow-sm font-semibold'
    : 'bg-white text-espresso-950 shadow-sm dark:bg-[#2c2823] dark:text-cream-50 font-semibold'

  const inactiveClasses = isSidebar
    ? 'text-cream-300/75 hover:bg-white/5 hover:text-cream-50'
    : 'text-espresso-600 hover:text-espresso-950 hover:bg-black/5 dark:text-cream-300/75 dark:hover:text-cream-50 dark:hover:bg-white/5'

  return (
    <div
      role="group"
      aria-label="Theme switcher"
      className={`inline-flex items-center rounded-xl transition-colors ${containerClasses} ${className}`}
    >
      {THEMES.map(({ value, label, icon: Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            title={`Switch to ${label} theme (${value === 'system' ? 'Auto-detect OS' : label})`}
            aria-pressed={active}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all ${
              active ? activeClasses : inactiveClasses
            }`}
          >
            <Icon className="size-3.5 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
            {!compact && <span className="capitalize">{label}</span>}
          </button>
        )
      })}
    </div>
  )
}
