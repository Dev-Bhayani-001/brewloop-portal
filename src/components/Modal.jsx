import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Accessible modal on <dialog>: Esc / backdrop close it.
 * Renders as a bottom sheet on phones and a centred card on larger screens.
 */
export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      className={`fixed inset-x-0 bottom-0 mx-0 mt-auto mb-0 w-full max-w-none rounded-t-3xl bg-white p-0 text-espresso-900 shadow-pop backdrop:bg-espresso-950/45 backdrop:backdrop-blur-sm open:animate-pop-in dark:border dark:border-white/10 dark:bg-[#1a1714] dark:text-cream-50 dark:shadow-none sm:m-auto sm:w-[calc(100%-2rem)] sm:rounded-3xl sm:shadow-pop ${widths[size]}`}
    >
      {open && (
        <div className="flex max-h-[88vh] flex-col">
          <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-cream-300 sm:hidden dark:bg-white/20" aria-hidden="true" />
          <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
            <div>
              <h2 className="display-title text-[28px] leading-tight">{title}</h2>
              {description && <p className="mt-1 text-sm text-espresso-500">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-full text-espresso-500 transition hover:bg-cream-100 hover:text-espresso-900 dark:text-cream-300 dark:hover:bg-white/10 dark:hover:text-cream-50"
              aria-label="Close"
            >
              <X className="size-4" strokeWidth={2.5} />
            </button>
          </header>
          <div className="overflow-y-auto px-6 pb-6">{children}</div>
          {footer && (
            <footer className="flex flex-wrap justify-end gap-2 border-t border-cream-200 bg-cream-50 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-white/10 dark:bg-[#151310]">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  )
}
