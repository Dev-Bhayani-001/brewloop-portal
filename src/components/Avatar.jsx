import { initials } from '../utils/format'

const PALETTE = ['bg-tint-sage', 'bg-tint-stone', 'bg-tint-blush', 'bg-tint-mist', 'bg-tint-sand']

const hash = (text) => [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0)

export default function Avatar({ name = '', size = 'md' }) {
  const sizes = { sm: 'size-8 text-[11px]', md: 'size-10 text-xs', lg: 'size-16 text-lg' }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium tracking-wide text-espresso-700 ring-1 ring-espresso-900/5 ${sizes[size]} ${PALETTE[hash(name) % PALETTE.length]}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
