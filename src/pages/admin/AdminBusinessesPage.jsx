import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, Plus, Store, Users } from 'lucide-react'

import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { TextField } from '../../components/Field'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import PlanBadge from '../../components/PlanBadge'
import SearchInput from '../../components/SearchInput'
import StatTile from '../../components/StatTile'
import { businessCreated } from '../../features/admin/adminSlice'
import { toastShown } from '../../features/ui/uiSlice'
import { PLAN_ORDER, PLANS } from '../../utils/planFeatures'
import { formatDate, formatNumber } from '../../utils/format'

function OnboardBusinessModal({ onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const businesses = useSelector((state) => state.admin.businesses)
  const [form, setForm] = useState({ name: '', city: '', plan: 'silver' })
  const [errors, setErrors] = useState({})

  const submit = (event) => {
    event.preventDefault()
    const name = form.name.trim()
    const nextErrors = {}
    if (name.length < 2) nextErrors.name = 'Enter the business name.'
    else if (businesses.some((business) => business.name.toLowerCase() === name.toLowerCase())) {
      nextErrors.name = 'A business with this name already exists.'
    }
    if (!form.city.trim()) nextErrors.city = 'Enter the city.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const action = dispatch(businessCreated({ ...form, name, city: form.city.trim() }))
    dispatch(toastShown({ title: `${name} onboarded`, description: 'Now add their manager.' }))
    navigate(`/admin/businesses/${action.payload.id}?addMember=1`)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Onboard a business"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="business-form">
            Create business
          </Button>
        </>
      }
    >
      <form id="business-form" onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Business name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            error={errors.name}
            maxLength={60}
            autoFocus
          />
          <TextField
            label="City"
            value={form.city}
            onChange={(event) => setForm({ ...form, city: event.target.value })}
            error={errors.city}
            maxLength={40}
          />
        </div>
        <fieldset>
          <legend className="field-label">Plan</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {PLAN_ORDER.map((id) => (
              <label
                key={id}
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  form.plan === id ? 'border-espresso-900 bg-white ring-1 ring-espresso-900' : 'border-cream-300 hover:bg-cream-50'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={id}
                  className="sr-only"
                  checked={form.plan === id}
                  onChange={() => setForm({ ...form, plan: id })}
                />
                <span className="block font-semibold">{PLANS[id].label}</span>
                <span className="block text-[13px] text-espresso-500">{PLANS[id].tagline}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}

export default function AdminBusinessesPage() {
  const navigate = useNavigate()
  const businesses = useSelector((state) => state.admin.businesses)
  const users = useSelector((state) => state.admin.users)
  const customers = useSelector((state) => state.customers.customers)
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const onboarding = params.get('onboard') === '1'
  const setOnboarding = (open) => setParams(open ? { onboard: '1' } : {}, { replace: true })

  const rows = useMemo(
    () =>
      businesses.map((business) => ({
        business,
        members: users.filter((user) => user.businessId === business.id).length,
        customers: customers.filter((customer) => customer.businessId === business.id).length,
      })),
    [businesses, users, customers],
  )
  const filtered = rows.filter(({ business }) =>
    `${business.name} ${business.city}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Businesses"
        description="Every café and shop on Brewloop. There's no public sign-up — onboard them here."
        actions={
          <Button icon={Plus} onClick={() => setOnboarding(true)}>
            Onboard business
          </Button>
        }
      />

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile label="Businesses" value={businesses.length} icon={Building2} />
        <StatTile label="Members" value={users.filter((user) => user.businessId).length} icon={Users} />
        <StatTile label="Customers" value={formatNumber(customers.length)} icon={Store} />
        <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-card">
          <p className="text-[13px] font-medium text-espresso-500">Plan mix</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {PLAN_ORDER.map((id) => (
              <Badge key={id} tone={id}>
                {PLANS[id].label} {businesses.filter((business) => business.plan === id).length}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <div className="card overflow-hidden">
        <div className="border-b border-cream-200 p-4">
          <SearchInput
            className="sm:w-72"
            placeholder="Search businesses"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-y border-cream-200 text-[11px] font-medium tracking-[0.12em] text-espresso-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Business</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 text-right font-medium">Members</th>
                <th className="px-5 py-3 text-right font-medium">Customers</th>
                <th className="px-5 py-3 font-medium">Since</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {filtered.map(({ business, members, customers: customerCount }) => (
                <tr
                  key={business.id}
                  onClick={() => navigate(`/admin/businesses/${business.id}`)}
                  className="cursor-pointer hover:bg-cream-50"
                >
                  <td className="px-5 py-3">
                    <Link
                      to={`/admin/businesses/${business.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="font-medium hover:underline"
                    >
                      {business.name}
                    </Link>
                    <p className="text-[13px] text-espresso-500">{business.city}</p>
                  </td>
                  <td className="px-5 py-3">
                    <PlanBadge plan={business.plan} />
                  </td>
                  <td className="tabular px-5 py-3 text-right">{members}</td>
                  <td className="tabular px-5 py-3 text-right">{customerCount}</td>
                  <td className="px-5 py-3 text-espresso-600">{formatDate(business.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Badge tone={business.status === 'active' ? 'success' : 'warning'}>{business.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {onboarding && <OnboardBusinessModal onClose={() => setOnboarding(false)} />}
    </>
  )
}
