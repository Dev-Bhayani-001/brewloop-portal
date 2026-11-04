import { useId } from 'react'
import { ChevronDown } from 'lucide-react'

function FieldShell({ id, label, hint, error, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[13px] font-medium text-red-700">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-[13px] text-espresso-500">{hint}</p>
      )}
    </div>
  )
}

export function TextField({ label, hint, error, className, prefix, suffix, inputClassName = '', ...props }) {
  const id = useId()
  const input = (
    <input
      id={id}
      className={`field-input ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''} ${inputClassName}`}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
  )
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={className}>
      {prefix || suffix ? (
        <div className="relative">
          {prefix && (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-medium text-espresso-500">
              {prefix}
            </span>
          )}
          {input}
          {suffix && (
            <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm font-medium text-espresso-500">
              {suffix}
            </span>
          )}
        </div>
      ) : (
        input
      )}
    </FieldShell>
  )
}

export function SelectField({ label, hint, error, className, options, ...props }) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={className}>
      <div className="relative">
        <select id={id} className="field-input appearance-none pr-10" aria-invalid={Boolean(error)} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-espresso-500" />
      </div>
    </FieldShell>
  )
}

export function TextAreaField({ label, hint, error, className, rows = 3, ...props }) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        rows={rows}
        className="field-input h-auto min-h-[76px] resize-none py-2.5"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
    </FieldShell>
  )
}
