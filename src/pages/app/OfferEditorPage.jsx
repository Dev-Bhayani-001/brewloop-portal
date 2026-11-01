import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Info, Minus, Plus, ReceiptText, ShoppingBag } from 'lucide-react'

import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import { SelectField, TextField } from '../../components/Field'
import SegmentedControl from '../../components/SegmentedControl'
import StampProgress from '../../components/StampProgress'
import Switch from '../../components/Switch'
import { selectCategories, selectCurrentBusiness, selectItems, selectLookups, selectOffers } from '../../app/selectors'
import { REWARD_TYPES, RULE_TYPES, describeRule } from '../../features/offers/offersEngine'
import { offerSaved } from '../../features/offers/offersSlice'
import { toastShown } from '../../features/ui/uiSlice'
import { toDateInputValue } from '../../utils/format'

const RULE_ICONS = { bill_count: ReceiptText, item_count: ShoppingBag }

const NEW_OFFER = {
  name: '',
  ruleType: 'bill_count',
  scopeType: 'bill',
  scopeId: null,
  threshold: 6,
  rewardType: 'free_bill',
  rewardValue: 0,
  rewardCap: '',
  minBillValue: '',
  validFrom: toDateInputValue(new Date()),
  validTo: '',
  active: true,
}

/** Returns a map of field → message. Empty map means the offer can be saved. */
function validate(form) {
  const errors = {}
  const threshold = Number(form.threshold)
  if (!form.name.trim()) errors.name = 'Give the offer a name customers will recognise.'
  if (!Number.isInteger(threshold) || threshold < 1) errors.threshold = 'Use a whole number of 1 or more.'
  else if (threshold > 100) errors.threshold = 'Keep it to 100 or fewer.'
  if (form.rewardCap !== '' && Number(form.rewardCap) < 0) errors.rewardCap = 'Can’t be negative.'
  if (form.minBillValue !== '' && Number(form.minBillValue) < 0) errors.minBillValue = 'Can’t be negative.'
  if (form.scopeType !== 'bill' && !form.scopeId) errors.scopeId = 'Pick what this offer applies to.'
  if (form.ruleType === 'item_count' && form.scopeType === 'bill') {
    errors.scopeType = 'Item-count offers need a category or item to count.'
  }
  if (form.rewardType === 'free_item' && form.scopeType === 'bill') {
    errors.rewardType = 'A free item needs a category or item scope.'
  }
  if (REWARD_TYPES[form.rewardType].needsValue && !(Number(form.rewardValue) > 0)) {
    errors.rewardValue = 'Enter a value above 0.'
  }
  if (form.rewardType === 'percent_off' && Number(form.rewardValue) > 100) errors.rewardValue = 'Max 100%.'
  if (form.validTo && form.validFrom && form.validTo < form.validFrom) errors.validTo = 'Ends before it starts.'
  return errors
}

function ChoiceCard({ selected, onClick, icon: Icon, title, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
        selected ? 'border-espresso-900 bg-white ring-1 ring-espresso-900' : 'border-cream-300 bg-white hover:bg-cream-50'
      }`}
    >
      {Icon && (
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            selected ? 'bg-roast-500 text-white' : 'bg-cream-100 text-espresso-600'
          }`}
        >
          <Icon className="size-4" />
        </span>
      )}
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-[13px] text-espresso-500">{description}</span>
      </span>
    </button>
  )
}

function Section({ step, title, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-6 items-center justify-center rounded-full bg-espresso-900 text-xs font-semibold text-cream-50">
          {step}
        </span>
        <h2 className="display-title text-[22px] leading-tight">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function OfferEditorPage() {
  const { offerId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const business = useSelector(selectCurrentBusiness)
  const offers = useSelector(selectOffers)
  const categories = useSelector(selectCategories).filter((category) => category.active)
  const items = useSelector(selectItems).filter((item) => item.active)
  const lookups = useSelector(selectLookups)

  const existing = offerId ? offers.find((offer) => offer.id === offerId) : null
  const [form, setForm] = useState(() => (existing ? { ...existing } : NEW_OFFER))
  const [submitted, setSubmitted] = useState(false)

  if (offerId && !existing) return <EmptyState title="Offer not found" />

  const errors = validate(form)
  const showError = (field) => (submitted ? errors[field] : undefined)
  const set = (patch) => setForm((current) => ({ ...current, ...patch }))
  const thresholdChanged = existing && Number(form.threshold) !== existing.threshold

  const scopeOptions =
    form.scopeType === 'category'
      ? categories.map((category) => ({ value: category.id, label: category.name }))
      : items.map((item) => ({ value: item.id, label: `${item.name} · ${lookups.categoriesById[item.categoryId]?.name}` }))

  const save = (event) => {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length) return
    dispatch(
      offerSaved({
        ...form,
        businessId: business.id,
        name: form.name.trim(),
        threshold: Number(form.threshold),
        rewardValue: Number(form.rewardValue) || 0,
        rewardCap: Number(form.rewardCap) || 0,
        minBillValue: Number(form.minBillValue) || 0,
        scopeId: form.scopeType === 'bill' ? null : form.scopeId,
      }),
    )
    dispatch(toastShown(existing ? 'Offer updated' : 'Offer created — it applies from the next bill'))
    navigate('/offers')
  }

  const previewOffer = { ...form, threshold: Number(form.threshold) || 1, rewardValue: Number(form.rewardValue) }

  return (
    <form onSubmit={save}>
      <Link to="/offers" className="mb-4 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold text-espresso-500 hover:bg-white hover:text-espresso-900">
        <ArrowLeft className="size-4" /> Offers
      </Link>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="display-title text-[40px] leading-none sm:text-[48px]">{existing ? 'Edit offer' : 'New offer'}</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-espresso-700">
            <Switch checked={form.active} onChange={(active) => set({ active })} label="Active" /> Active
          </label>
          <Button type="submit">{existing ? 'Save changes' : 'Create offer'}</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Section step={1} title="How customers earn">
            <TextField
              label="Offer name"
              placeholder="e.g. 7th bill on us"
              value={form.name}
              onChange={(event) => set({ name: event.target.value })}
              error={showError('name')}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(RULE_TYPES).map(([value, rule]) => (
                <ChoiceCard
                  key={value}
                  selected={form.ruleType === value}
                  onClick={() =>
                    set({
                      ruleType: value,
                      scopeType: value === 'item_count' && form.scopeType === 'bill' ? 'category' : form.scopeType,
                    })
                  }
                  icon={RULE_ICONS[value]}
                  title={rule.label}
                  description={rule.description}
                />
              ))}
            </div>

            <div className="mt-5">
              <p className="field-label">What counts</p>
              <SegmentedControl
                value={form.scopeType}
                onChange={(scopeType) => set({ scopeType, scopeId: null })}
                options={[
                  ...(form.ruleType === 'bill_count' ? [{ value: 'bill', label: 'Any bill' }] : []),
                  { value: 'category', label: 'A category' },
                  { value: 'item', label: 'One item' },
                ]}
              />
              {showError('scopeType') && <p className="mt-1.5 text-[13px] text-red-700">{errors.scopeType}</p>}
              {form.scopeType !== 'bill' && (
                <SelectField
                  className="mt-3 sm:max-w-sm"
                  value={form.scopeId ?? ''}
                  aria-label={form.scopeType === 'category' ? 'Category' : 'Item'}
                  onChange={(event) => set({ scopeId: event.target.value })}
                  error={showError('scopeId')}
                  options={[{ value: '', label: `Choose ${form.scopeType}…`, disabled: true }, ...scopeOptions]}
                />
              )}
              {form.ruleType === 'bill_count' && form.scopeType !== 'bill' && (
                <p className="mt-1.5 text-[13px] text-espresso-500">A bill counts if it includes at least one.</p>
              )}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="field-label">Stamps needed</p>
                <div className="flex h-11 w-fit items-center rounded-xl border border-cream-300 bg-white">
                  <button
                    type="button"
                    className="px-3 text-espresso-600 hover:text-espresso-900"
                    onClick={() => set({ threshold: Math.max(1, Math.floor(Number(form.threshold) || 2) - 1) })}
                    aria-label="Fewer stamps"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    className="tabular w-12 border-x border-cream-200 text-center outline-none"
                    value={form.threshold}
                    onChange={(event) => set({ threshold: event.target.value })}
                    aria-label="Stamps needed"
                  />
                  <button
                    type="button"
                    className="px-3 text-espresso-600 hover:text-espresso-900"
                    onClick={() => set({ threshold: Math.min(100, Math.floor(Number(form.threshold) || 0) + 1) })}
                    aria-label="More stamps"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                {showError('threshold') ? (
                  <p role="alert" className="mt-1.5 text-[13px] font-medium text-red-700">
                    {errors.threshold}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[13px] text-espresso-500">
                    The reward unlocks after {form.threshold || '…'} {RULE_TYPES[form.ruleType].unit}s.
                  </p>
                )}
              </div>
              {form.ruleType === 'bill_count' && (
                <TextField
                  label="Minimum bill value"
                  hint="Optional — smaller bills won't count."
                  prefix="₹"
                  type="number"
                  min="0"
                  value={form.minBillValue || ''}
                  onChange={(event) => set({ minBillValue: event.target.value })}
                  error={showError('minBillValue')}
                />
              )}
            </div>

            {thresholdChanged && (
              <p className="mt-4 flex gap-2 rounded-lg bg-sky-50 p-3 text-[13px] text-sky-900 ring-1 ring-sky-200">
                <Info className="mt-0.5 size-4 shrink-0" />
                Customers already part-way through keep their current target of {existing.threshold}. The new target
                of {form.threshold} applies from their next cycle, so nobody loses progress.
              </p>
            )}
          </Section>

          <Section step={2} title="What they get">
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(REWARD_TYPES).map(([value, reward]) => (
                <ChoiceCard
                  key={value}
                  selected={form.rewardType === value}
                  onClick={() => set({ rewardType: value })}
                  title={reward.label}
                  description={
                    {
                      free_bill: 'The whole next bill is on the house.',
                      free_item: 'One item from the chosen scope, free.',
                      percent_off: 'A percentage off the next bill.',
                      flat_off: 'A fixed amount off the next bill.',
                    }[value]
                  }
                />
              ))}
            </div>
            {showError('rewardType') && <p className="mt-2 text-[13px] text-red-700">{errors.rewardType}</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {REWARD_TYPES[form.rewardType].needsValue && (
                <TextField
                  label={form.rewardType === 'percent_off' ? 'Discount' : 'Amount off'}
                  type="number"
                  min="0"
                  prefix={REWARD_TYPES[form.rewardType].prefix}
                  suffix={REWARD_TYPES[form.rewardType].suffix}
                  value={form.rewardValue || ''}
                  onChange={(event) => set({ rewardValue: event.target.value })}
                  error={showError('rewardValue')}
                />
              )}
              {form.rewardType !== 'flat_off' && (
                <TextField
                  label="Cap the reward at"
                  hint="Optional — e.g. a free bill worth at most ₹400."
                  prefix="₹"
                  type="number"
                  min="0"
                  value={form.rewardCap || ''}
                  onChange={(event) => set({ rewardCap: event.target.value })}
                  error={showError('rewardCap')}
                />
              )}
            </div>
          </Section>

          <Section step={3} title="When it runs">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Starts"
                type="date"
                value={form.validFrom}
                onChange={(event) => set({ validFrom: event.target.value })}
              />
              <TextField
                label="Ends"
                hint="Leave empty to run until you pause it."
                type="date"
                value={form.validTo}
                onChange={(event) => set({ validTo: event.target.value })}
                error={showError('validTo')}
              />
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <p className="eyebrow mb-2">Customer preview</p>
          <div className="rounded-2xl bg-espresso-900 p-5 text-cream-50 shadow-pop">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-roast-200 uppercase">{business.name}</p>
            <p className="display-title mt-1 text-[28px] text-cream-50">{form.name || 'Your offer'}</p>
            <div className="mt-4 rounded-xl bg-cream-50 p-4 text-espresso-900">
              <StampProgress
                count={Math.max(0, previewOffer.threshold - 2)}
                threshold={previewOffer.threshold}
                size="sm"
              />
              <p className="mt-3 text-sm font-medium">2 more to go!</p>
            </div>
            <p className="mt-4 text-sm text-cream-300">{describeRule(previewOffer, lookups)}</p>
          </div>
          <div className="mt-4 rounded-xl border border-cream-200 bg-white p-4 text-[13px] text-espresso-600">
            <p className="mb-1 font-medium text-espresso-800">How it runs</p>
            Each saved bill adds stamps. When a customer reaches the target, a reward is waiting for them at the
            counter, and their card starts again. Voiding a bill takes its stamps back.
          </div>
        </aside>
      </div>
    </form>
  )
}
