import { useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, ImagePlus, Plus, Store, Users } from 'lucide-react'

import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { TextField } from '../../components/Field'
import ImageCropModal from '../../components/ImageCropModal'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import PlanBadge from '../../components/PlanBadge'
import SearchInput from '../../components/SearchInput'
import StatTile from '../../components/StatTile'
import { businessCreated } from '../../features/admin/adminSlice'
import { formatIndianPhone, isValidEmail, phoneError } from '../../features/customers/customerValidation'
import { toastShown } from '../../features/ui/uiSlice'
import { PLAN_ORDER, PLANS } from '../../utils/planFeatures'
import { formatDate, formatNumber } from '../../utils/format'
import { IMAGE_TYPES, imageFileError } from '../../utils/image'

function OnboardBusinessModal({ onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const businesses = useSelector((state) => state.admin.businesses)
  const logoInputRef = useRef(null)
  const [form, setForm] = useState({
    name: '',
    city: '',
    phone: '',
    email: '',
    address: '',
    logo: null,
    plan: 'silver',
  })
  const [errors, setErrors] = useState({})
  const [cropFile, setCropFile] = useState(null)
  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const chooseLogo = (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // Lets the same file be picked again after removing it.
    if (!file) return
    const logo = imageFileError(file) ?? undefined
    setErrors((current) => ({ ...current, logo }))
    if (!logo) setCropFile(file)
  }

  const submit = (event) => {
    event.preventDefault()
    const name = form.name.trim()
    const nextErrors = {}
    if (name.length < 2) nextErrors.name = 'Enter the business name.'
    else if (businesses.some((business) => business.name.toLowerCase() === name.toLowerCase())) {
      nextErrors.name = 'A business with this name already exists.'
    }
    if (!form.city.trim()) nextErrors.city = 'Enter the city.'
    const phoneProblem = phoneError(form.phone)
    if (phoneProblem) nextErrors.phone = phoneProblem
    const email = form.email.trim().toLowerCase()
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email.'
    if (!form.address.trim()) nextErrors.address = 'Enter the address.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const action = dispatch(
      businessCreated({
        ...form,
        name,
        city: form.city.trim(),
        phone: formatIndianPhone(form.phone),
        email,
        address: form.address.trim(),
      }),
    )
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
            onChange={set('name')}
            error={errors.name}
            maxLength={60}
            autoFocus
          />
          <TextField
            label="City"
            value={form.city}
            onChange={set('city')}
            error={errors.city}
            maxLength={40}
          />
          <TextField
            label="Contact number"
            prefix="+91"
            type="tel"
            inputMode="numeric"
            maxLength={14}
            value={form.phone}
            onChange={set('phone')}
            error={errors.phone}
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            maxLength={254}
          />
          <TextField
            className="sm:col-span-2"
            label="Address"
            value={form.address}
            onChange={set('address')}
            error={errors.address}
            maxLength={160}
          />
        </div>
        <div>
          <p className="field-label">Logo (optional)</p>
          <div className="flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cream-300 bg-cream-50 text-espresso-400 dark:border-white/15 dark:bg-white/5">
              {form.logo ? (
                <img src={form.logo} alt="Logo preview" className="size-full object-contain" />
              ) : (
                <ImagePlus className="size-5" strokeWidth={1.75} aria-hidden="true" />
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept={IMAGE_TYPES.join(',')}
              className="hidden"
              onChange={chooseLogo}
            />
            <Button variant="secondary" size="sm" onClick={() => logoInputRef.current?.click()}>
              {form.logo ? 'Replace' : 'Upload logo'}
            </Button>
            {form.logo && (
              <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, logo: null })}>
                Remove
              </Button>
            )}
          </div>
          {errors.logo ? (
            <p role="alert" className="mt-1.5 text-[13px] font-medium text-red-700 dark:text-red-400">
              {errors.logo}
            </p>
          ) : (
            <p className="mt-1.5 text-[13px] text-espresso-500">PNG, JPG or WebP, up to 10 MB.</p>
          )}
        </div>
        <fieldset>
          <legend className="field-label">Plan</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {PLAN_ORDER.map((id) => (
              <label
                key={id}
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  form.plan === id
                    ? 'border-espresso-900 bg-white ring-1 ring-espresso-900 dark:border-roast-400 dark:bg-roast-500/15 dark:ring-roast-400'
                    : 'border-cream-300 hover:bg-cream-50 dark:border-white/15'
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
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          shape="square"
          onCancel={() => setCropFile(null)}
          onCrop={(logo) => {
            setForm((current) => ({ ...current, logo }))
            setCropFile(null)
          }}
        />
      )}
    </Modal>
  )
}

const PLAN_CARD_FINISH = {
  silver: 'from-[#eef0f3] via-[#8f96a0] to-[#d5d8dd]',
  gold: 'from-[#f7e2a0] via-[#b5832a] to-[#ecca75]',
  platinum: 'from-[#f1ecf8] via-[#8e84a8] to-[#d8d2e6]',
}

/** Businesses per plan, shown as mini metallic membership cards. */
function PlanMixTile({ businesses }) {
  return (
    <div className="flex min-w-0 flex-col justify-between rounded-2xl bg-white p-5 text-espresso-900 shadow-card transition-colors dark:bg-[#1a1816] dark:text-cream-50 dark:shadow-none dark:ring-1 dark:ring-white/10">
      <p className="text-[13px] font-medium text-espresso-600 dark:text-cream-200/80">Plan mix</p>
      <ul className="mt-3.5 flex flex-wrap gap-1.5">
        {PLAN_ORDER.map((id) => (
          <li
            key={id}
            className={`flex h-[62px] min-w-fit flex-1 flex-col justify-between rounded-[9px] bg-linear-135 via-55% px-2 py-[7px] text-[#171513] shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] ${PLAN_CARD_FINISH[id]}`}
          >
            <span className="text-[10px] font-semibold whitespace-nowrap">{PLANS[id].label}</span>
            <span className="tabular font-display text-[24px] leading-none">
              {businesses.filter((business) => business.plan === id).length}
            </span>
          </li>
        ))}
      </ul>
    </div>
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
        <PlanMixTile businesses={businesses} />
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
