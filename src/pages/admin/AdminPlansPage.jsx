import { useSelector } from 'react-redux'
import { Check, Minus } from 'lucide-react'

import PageHeader from '../../components/PageHeader'
import { FEATURE_ROWS, PLAN_ORDER, PLANS } from '../../utils/planFeatures'

export default function AdminPlansPage() {
  const businesses = useSelector((state) => state.admin.businesses)

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Plans"
        description="What each subscription unlocks. Pricing is still to be decided."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_ORDER.map((id, index) => {
          const plan = PLANS[id]
          const count = businesses.filter((business) => business.plan === id).length
          const featured = index === PLAN_ORDER.length - 1
          return (
            <section
              key={id}
              className={`flex flex-col rounded-2xl border p-6 shadow-card ${
                featured ? 'border-espresso-900 bg-espresso-900 text-cream-50' : 'border-cream-200 bg-white'
              }`}
            >
              <p className={`display-title text-[32px] leading-none ${featured ? 'text-cream-50' : ''}`}>{plan.label}</p>
              <p className={`mt-1 text-sm ${featured ? 'text-cream-300' : 'text-espresso-500'}`}>{plan.tagline}</p>
              <p className={`display-title mt-6 text-4xl ${featured ? 'text-cream-50' : ''}`}>
                TBD <span className={`text-sm font-normal ${featured ? 'text-cream-300' : 'text-espresso-500'}`}>/ month</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {FEATURE_ROWS.map((row) => {
                  const included = plan.features[row.key]
                  return (
                    <li key={row.key} className={`flex items-center gap-2 ${included ? '' : 'opacity-50'}`}>
                      {included ? (
                        <Check className={`size-4 ${featured ? 'text-roast-400' : 'text-leaf-600'}`} />
                      ) : (
                        <Minus className="size-4" />
                      )}
                      {row.label}
                      {included && row.render?.(plan) && <span className="ml-auto text-xs">{row.render(plan)}</span>}
                    </li>
                  )
                })}
              </ul>
              <p className={`mt-6 border-t pt-4 text-sm ${featured ? 'border-cream-50/10 text-cream-300' : 'border-cream-200 text-espresso-500'}`}>
                {count} business{count === 1 ? '' : 'es'} on this plan
              </p>
            </section>
          )
        })}
      </div>
    </>
  )
}
