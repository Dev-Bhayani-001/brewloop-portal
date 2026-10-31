import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'

import { toastDismissed } from '../features/ui/uiSlice'

const ICONS = { success: CheckCircle2, info: Info, error: TriangleAlert }
const ICON_TONES = { success: 'text-leaf-600', info: 'text-espresso-500', error: 'text-red-600' }

function Toast({ toast }) {
  const dispatch = useDispatch()
  const Icon = ICONS[toast.tone] ?? Info

  useEffect(() => {
    const timer = setTimeout(() => dispatch(toastDismissed(toast.id)), toast.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [dispatch, toast.id, toast.duration])

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto flex w-full max-w-sm animate-pop-in items-start gap-3 rounded-2xl bg-espresso-900 p-4 text-cream-50 shadow-pop"
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${ICON_TONES[toast.tone]} brightness-150`} strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-[13px] text-cream-300">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => dispatch(toastDismissed(toast.id))}
        className="rounded-full p-0.5 text-cream-300 hover:text-cream-50"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export default function Toaster() {
  const toasts = useSelector((state) => state.ui.toasts)
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:px-6"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
