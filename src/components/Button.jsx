import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-espresso-900 text-cream-50 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-espresso-800',
  accent: 'bg-roast-500 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] hover:bg-roast-600',
  secondary: 'bg-white text-espresso-900 shadow-card hover:bg-cream-50 hover:shadow-soft',
  ghost: 'text-espresso-700 hover:bg-espresso-900/5 hover:text-espresso-900',
  danger: 'bg-white text-red-700 shadow-card hover:bg-red-50',
}

const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-[15px] gap-2',
  icon: 'size-9 justify-center',
}

/** Rounded button. Pass `to` to render a router link styled as a button. */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  className = '',
  children,
  type = 'button',
  to,
  ...props
}) {
  const classes = `inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap transition duration-200 select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`
  const content = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" /> : Icon && <Icon className="size-4" strokeWidth={1.75} />}
      {children}
      {IconRight && <IconRight className="size-4" strokeWidth={1.75} />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...props} disabled={loading || props.disabled}>
      {content}
    </button>
  )
}
