import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Repeat, ShoppingBag, Users, Wallet } from 'lucide-react'

import PageHeader from '../../components/PageHeader'
import SegmentedControl from '../../components/SegmentedControl'
import StatTile from '../../components/StatTile'
import UpgradePrompt from '../../components/UpgradePrompt'
import { DailyBarChart, RankedBars, SplitBar } from '../../features/analytics/charts'
import { computeAnalytics } from '../../features/analytics/computeAnalytics'
import {
  selectBills,
  selectCustomers,
  selectFeatures,
  selectOffers,
  selectRewards,
} from '../../app/selectors'
import { formatCurrency, formatNumber, formatPercent, toDateInputValue } from '../../utils/format'

const PRESETS = { 7: 'Last 7 days', 30: 'Last 30 days', 90: 'Last 90 days' }

function Panel({ title, description, actions, children, className = '' }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="display-title text-[22px] leading-tight">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-espresso-500">{description}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}

function useDateRange() {
  const [today] = useState(() => new Date())
  const [preset, setPreset] = useState('30')
  const [custom, setCustom] = useState({ from: '', to: '' })
  const to = preset === 'custom' ? custom.to : toDateInputValue(today)
  const from =
    preset === 'custom' ? custom.from : toDateInputValue(today.getTime() - (Number(preset) - 1) * 86400000)
  return { preset, setPreset, custom, setCustom, from, to }
}

export default function AnalyticsPage() {
  const features = useSelector(selectFeatures)
  const bills = useSelector(selectBills)
  const customers = useSelector(selectCustomers)
  const offers = useSelector(selectOffers)
  const rewards = useSelector(selectRewards)
  const range = useDateRange()
  const [itemMetric, setItemMetric] = useState('quantity')
  const [customerMetric, setCustomerMetric] = useState('visits')

  const data = useMemo(
    () =>
      range.from && range.to && range.from <= range.to
        ? computeAnalytics({ bills, customers, offers, rewards, from: range.from, to: range.to })
        : null,
    [bills, customers, offers, rewards, range.from, range.to],
  )

  if (!features.analytics) {
    return (
      <>
        <PageHeader eyebrow="Insights" title="Analytics" />
        <UpgradePrompt
          feature="analytics"
          title="See who keeps coming back"
          description="Repeat customers, best-sellers, what people re-order, and how your offers perform."
          preview={
            <div className="grid gap-4 p-6 sm:grid-cols-4">
              {['Repeat customers', 'Revenue', 'Bills', 'Avg. bill'].map((label) => (
                <StatTile key={label} label={label} value="—" />
              ))}
              <div className="h-48 rounded-2xl bg-cream-200 sm:col-span-4" />
            </div>
          }
        />
      </>
    )
  }

  const rangeControls = (
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedControl
        value={range.preset}
        onChange={range.setPreset}
        options={[
          ...Object.keys(PRESETS).map((days) => ({ value: days, label: `${days}d` })),
          { value: 'custom', label: 'Custom' },
        ]}
      />
      {range.preset === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="field-input h-9 w-auto text-sm"
            value={range.custom.from}
            onChange={(event) => range.setCustom({ ...range.custom, from: event.target.value })}
            aria-label="From"
          />
          <span className="text-espresso-400">–</span>
          <input
            type="date"
            className="field-input h-9 w-auto text-sm"
            value={range.custom.to}
            onChange={(event) => range.setCustom({ ...range.custom, to: event.target.value })}
            aria-label="To"
          />
        </div>
      )}
    </div>
  )

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description={PRESETS[range.preset] ?? 'Custom range'}
        actions={rangeControls}
      />

      {!data ? (
        <div className="card p-10 text-center text-sm text-espresso-500">
          {range.from && range.to ? 'The start date must be on or before the end date.' : 'Pick a start and end date.'}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatTile
              tone="ink"
              label="Repeat customers"
              value={formatPercent(data.repeatShare)}
              detail={`${data.repeatCount} of ${data.customersBilled} came back 2+ times`}
              icon={Repeat}
            />
            <StatTile label="Customers billed" value={formatNumber(data.customersBilled)} icon={Users} />
            <StatTile label="Revenue" value={formatCurrency(data.revenue)} detail={`${data.billCount} bills`} icon={Wallet} />
            <StatTile label="Average bill" value={formatCurrency(data.averageBill)} icon={ShoppingBag} />
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Bills per day" description="Hover a bar for that day's total." className="lg:col-span-2">
              <DailyBarChart data={data.daily} />
            </Panel>
            <Panel title="New vs returning" description="First-ever bill in this period vs. an earlier one.">
              <SplitBar
                first={{ label: 'New', value: data.newCount }}
                second={{ label: 'Returning', value: data.returningCount }}
              />
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel
              title="Most-selling items"
              actions={
                <SegmentedControl
                  size="sm"
                  value={itemMetric}
                  onChange={setItemMetric}
                  options={[
                    { value: 'quantity', label: 'Quantity' },
                    { value: 'revenue', label: 'Revenue' },
                  ]}
                />
              }
            >
              <RankedBars
                valueKey={itemMetric}
                format={itemMetric === 'revenue' ? formatCurrency : formatNumber}
                rows={[...data.items]
                  .sort((a, b) => b[itemMetric] - a[itemMetric])
                  .slice(0, 8)
                  .map((item) => ({ ...item, id: item.itemId, label: item.name }))}
              />
            </Panel>
            <Panel title="Most re-ordered items" description="Customers who bought the item on 2+ separate bills.">
              <RankedBars
                valueKey="repeatCustomers"
                format={(value) => `${value} customer${value === 1 ? '' : 's'}`}
                rows={data.items
                  .filter((item) => item.repeatCustomers > 0)
                  .sort((a, b) => b.repeatCustomers - a.repeatCustomers)
                  .slice(0, 8)
                  .map((item) => ({ ...item, id: item.itemId, label: item.name }))}
              />
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel
              title="Top customers"
              actions={
                <SegmentedControl
                  size="sm"
                  value={customerMetric}
                  onChange={setCustomerMetric}
                  options={[
                    { value: 'visits', label: 'Visits' },
                    { value: 'spend', label: 'Spend' },
                  ]}
                />
              }
            >
              <ol className="divide-y divide-cream-200">
                {[...data.topCustomers]
                  .sort((a, b) => b[customerMetric] - a[customerMetric])
                  .slice(0, 8)
                  .map((row, index) => (
                    <li key={row.customer.id} className="flex items-center gap-3 py-2.5 text-sm">
                      <span className="tabular w-5 text-espresso-400">{index + 1}</span>
                      <Link to={`/customers/${row.customer.id}`} className="flex-1 truncate font-medium hover:underline">
                        {row.customer.name}
                      </Link>
                      <span className="tabular w-16 text-right text-espresso-600">{row.visits} visits</span>
                      <span className="tabular w-20 text-right font-medium">{formatCurrency(row.spend)}</span>
                    </li>
                  ))}
              </ol>
            </Panel>

            <Panel title="Offer performance" description="Rewards earned in this period, and how many were used.">
              <table className="w-full text-sm">
                <thead className="text-left text-[12px] tracking-wide text-espresso-500 uppercase">
                  <tr>
                    <th className="pb-2 font-medium">Offer</th>
                    <th className="pb-2 text-right font-medium">Earned</th>
                    <th className="pb-2 text-right font-medium">Redeemed</th>
                    <th className="w-28 pb-2 pl-4 font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {data.offerPerformance.map(({ offer, earned, redeemed }) => {
                    const rate = earned ? redeemed / earned : 0
                    return (
                      <tr key={offer.id}>
                        <td className="py-2.5 font-medium">{offer.name}</td>
                        <td className="tabular py-2.5 text-right">{earned}</td>
                        <td className="tabular py-2.5 text-right">{redeemed}</td>
                        <td className="py-2.5 pl-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-cream-100">
                              <div className="h-full rounded-full bg-[#cf5f22]" style={{ width: `${rate * 100}%` }} />
                            </div>
                            <span className="tabular w-9 text-right text-xs text-espresso-600">
                              {earned ? formatPercent(rate) : '—'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Panel>
          </div>
        </div>
      )}
    </>
  )
}
