import { Lock } from 'lucide-react'

import { minimumPlanFor } from '../utils/planFeatures'

/** Shown in place of a plan-locked feature (the API also returns 403 for it). */
export default function UpgradePrompt({ feature, title, description, preview }) {
  const plan = minimumPlanFor(feature)
  return (
    <div className="card relative overflow-hidden">
      {preview && (
        <div className="pointer-events-none blur-[6px] select-none" aria-hidden="true">
          {preview}
        </div>
      )}
      <div
        className={`${preview ? 'absolute inset-0 bg-cream-50/75' : ''} flex flex-col items-center justify-center px-6 py-16 text-center`}
      >
        <span className="mb-5 flex size-12 items-center justify-center rounded-full bg-espresso-900 text-cream-50">
          <Lock className="size-5" strokeWidth={1.75} />
        </span>
        <p className="display-title text-4xl">{title}</p>
        <p className="mt-2 max-w-md text-sm text-espresso-600">{description}</p>
        <p className="mt-6 rounded-full bg-white px-4 py-2 text-sm text-espresso-700 shadow-card">
          Included with <span className="font-medium text-espresso-900">{plan?.label}</span> and above — contact your
          Brewloop account manager.
        </p>
      </div>
    </div>
  )
}
