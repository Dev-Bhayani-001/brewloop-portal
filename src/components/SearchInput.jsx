import { forwardRef } from 'react'
import { Search, X } from 'lucide-react'

/** Search box with a clear button. `size="lg"` is the counter's hero search. */
const SearchInput = forwardRef(function SearchInput({ className = '', size = 'md', value, onChange, ...props }, ref) {
  const large = size === 'lg'
  const clear = () => onChange?.({ target: { value: '' } })
  return (
    <div className={`relative ${className}`}>
      <Search
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-espresso-400 ${large ? 'left-5 size-5' : 'left-3.5 size-4'}`}
        strokeWidth={1.75}
      />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        className={`field-input [&::-webkit-search-cancel-button]:hidden ${
          large ? 'h-14 rounded-2xl border-transparent pr-12 pl-13 text-[16px] shadow-soft' : 'pr-9 pl-10'
        }`}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full text-espresso-400 hover:bg-cream-100 hover:text-espresso-800 ${
            large ? 'right-4 size-7' : 'right-2.5 size-6'
          }`}
          aria-label="Clear search"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      )}
    </div>
  )
})

export default SearchInput
