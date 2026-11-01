import { useSelector } from 'react-redux'
import { Check, MessageSquare, Minus } from 'lucide-react'

import Avatar from '../../components/Avatar'
import Badge from '../../components/Badge'
import PageHeader from '../../components/PageHeader'
import PlanBadge from '../../components/PlanBadge'
import { selectCurrentBusiness, selectPlan, selectSmsUsageThisMonth } from '../../app/selectors'
import { FEATURE_ROWS, PLAN_ORDER, PLANS } from '../../utils/planFeatures'
import { MEMBER_STATUS_TONE, ROLE_LABELS } from '../../utils/permissions'
import { formatNumber } from '../../utils/format'

function SmsUsage({ used, allowance }) {
  const ratio = Math.min(1, used / allowance)
  const resetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-4 text-espresso-500" />
        <h2 className="display-title text-[22px] leading-tight">SMS this month</h2>
      </div>
      <p className="tabular mt-3 display-title text-3xl">
        {formatNumber(used)} <span className="text-lg font-normal text-espresso-500">/ {formatNumber(allowance)}</span>
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-200">
        <div
          className={`h-full rounded-full ${ratio > 0.9 ? 'bg-red-600' : 'bg-espresso-900'}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p className="mt-2 text-[13px] text-espresso-500">
        Used for reward alerts and card links. Resets on{' '}
        {resetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}.
      </p>
    </section>
  )
}

export default function BusinessSettingsPage() {
  const business = useSelector(selectCurrentBusiness)
  const plan = useSelector(selectPlan)
  const smsUsed = useSelector(selectSmsUsageThisMonth)
  const members = useSelector((state) => state.admin.users.filter((user) => user.businessId === business.id))

  return (
    <>
      <PageHeader eyebrow="Manage" title={business.name} description={`${business.city} · Card prefix ${business.cardPrefix}`} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card overflow-hidden">
            <header className="flex items-center justify-between border-b border-cream-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="display-title text-[22px] leading-tight">Your plan</h2>
                <p className="text-[13px] text-espresso-500">Plan changes are handled by your Brewloop account manager.</p>
              </div>
              <PlanBadge plan={plan.id} />
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-5 py-3 font-medium text-espresso-500 sm:px-6">Feature</th>
                    {PLAN_ORDER.map((id) => (
                      <th
                        key={id}
                        className={`px-4 py-3 text-center font-semibold ${id === plan.id ? 'bg-roast-50 text-roast-700' : ''}`}
                      >
                        {PLANS[id].label}
                        {id === plan.id && <span className="block text-[11px] font-normal">Current</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {FEATURE_ROWS.map((row) => (
                    <tr key={row.key}>
                      <td className="px-5 py-3 sm:px-6">{row.label}</td>
                      {PLAN_ORDER.map((id) => {
                        const included = PLANS[id].features[row.key]
                        const text = row.render?.(PLANS[id])
                        return (
                          <td key={id} className={`px-4 py-3 text-center ${id === plan.id ? 'bg-roast-50/60' : ''}`}>
                            {included ? (
                              text ?? <Check className="mx-auto size-4 text-leaf-600" aria-label="Included" />
                            ) : (
                              <Minus className="mx-auto size-4 text-espresso-400" aria-label="Not included" />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <header className="border-b border-cream-200 px-5 py-4 sm:px-6">
              <h2 className="display-title text-[22px] leading-tight">Team</h2>
              <p className="text-[13px] text-espresso-500">New members are added by the Brewloop admin.</p>
            </header>
            <ul className="divide-y divide-cream-200">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                  <Avatar name={member.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    <p className="truncate text-[13px] text-espresso-500">
                      {member.phone} · {member.email}
                    </p>
                  </div>
                  <span className="hidden text-[13px] text-espresso-600 sm:inline">{ROLE_LABELS[member.role]}</span>
                  <Badge tone={MEMBER_STATUS_TONE[member.status]}>{member.status}</Badge>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          {plan.features.sms ? (
            <SmsUsage used={smsUsed} allowance={plan.smsAllowance} />
          ) : (
            <section className="card p-5 text-sm text-espresso-600">
              <div className="mb-2 flex items-center gap-2 font-semibold text-espresso-900">
                <MessageSquare className="size-4" /> SMS alerts
              </div>
              Text customers when they unlock a reward. Included with Platinum (1,000 SMS / month).
            </section>
          )}
        </aside>
      </div>
    </>
  )
}
