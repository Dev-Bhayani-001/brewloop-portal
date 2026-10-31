import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, Copy, KeyRound } from 'lucide-react'

import Button from '../../components/Button'
import { SelectField, TextField } from '../../components/Field'
import Modal from '../../components/Modal'
import { formatIndianPhone, isValidEmail, phoneDigits, phoneError } from '../customers/customerValidation'
import { memberCreated } from './adminSlice'

/** Shows the one-time password so the admin can share it with the member. */
export function CredentialsModal({ userId, title, onClose }) {
  const user = useSelector((state) => state.admin.users.find((entry) => entry.id === userId))
  const [copied, setCopied] = useState(false)
  if (!user) return null

  const message = `Hi ${user.name.split(' ')[0]}, your Brewloop login is ready.\nLogin: ${user.email || user.phone}\nOne-time password: ${user.demoPassword}\nYou'll set your own password when you first sign in.`

  const copy = async () => {
    await navigator.clipboard?.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={title}
      description="Share these details with the member. The password works once."
      footer={
        <>
          <Button variant="secondary" icon={copied ? Check : Copy} onClick={copy}>
            {copied ? 'Copied' : 'Copy message'}
          </Button>
          <Button onClick={onClose}>Done</Button>
        </>
      }
    >
      <div className="rounded-xl bg-cream-50 p-4 ring-1 ring-cream-200">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs text-espresso-500">Member</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-espresso-500">Login</dt>
            <dd className="font-medium">{user.email || user.phone}</dd>
          </div>
          <div>
            <dt className="text-xs text-espresso-500">One-time password</dt>
            <dd className="mt-1 inline-flex items-center gap-2 rounded-lg bg-espresso-900 px-3 py-1.5 font-mono text-lg tracking-wider text-cream-50">
              <KeyRound className="size-4 text-roast-400" />
              {user.demoPassword}
            </dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 text-[13px] text-espresso-500">
        In production this is sent by SMS/email automatically; it's shown here for the demo.
      </p>
    </Modal>
  )
}

const EMPTY_MEMBER = { name: '', phone: '', email: '', role: 'staff' }

export function AddMemberModal({ businessId, businessOptions, onClose, onCreated }) {
  const dispatch = useDispatch()
  const users = useSelector((state) => state.admin.users)
  const [form, setForm] = useState({ ...EMPTY_MEMBER, businessId: businessId ?? businessOptions?.[0]?.value })
  const [error, setError] = useState(null)
  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const submit = (event) => {
    event.preventDefault()
    const email = form.email.trim().toLowerCase()
    const digits = phoneDigits(form.phone)
    const nextErrors = {}
    if (form.name.trim().length < 2) nextErrors.name = 'Enter their full name.'
    const phoneProblem = phoneError(form.phone)
    if (phoneProblem) nextErrors.phone = phoneProblem
    else if (users.some((user) => phoneDigits(user.phone) === digits)) nextErrors.phone = 'This number is already in use.'
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email.'
    else if (users.some((user) => user.email.toLowerCase() === email)) nextErrors.email = 'This email is already in use.'
    if (!form.businessId) nextErrors.businessId = 'Choose a business.'
    if (Object.keys(nextErrors).length) return setError(nextErrors)
    const action = dispatch(
      memberCreated({
        businessId: form.businessId,
        role: form.role,
        name: form.name.trim(),
        phone: formatIndianPhone(form.phone),
        email,
      }),
    )
    onCreated(action.payload.id)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Add member"
      description="They'll get a one-time password and set their own on first login."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="member-form">
            Create login
          </Button>
        </>
      }
    >
      <form id="member-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        {businessOptions && (
          <SelectField
            className="sm:col-span-2"
            label="Business"
            value={form.businessId}
            onChange={set('businessId')}
            options={businessOptions}
          />
        )}
        <TextField
          className="sm:col-span-2"
          label="Full name"
          value={form.name}
          onChange={(event) => {
            setError(null)
            set('name')(event)
          }}
          error={error?.name}
          maxLength={60}
          autoFocus
        />
        <TextField
          label="Mobile"
          prefix="+91"
          type="tel"
          inputMode="numeric"
          maxLength={14}
          value={form.phone}
          onChange={(event) => {
            setError(null)
            set('phone')(event)
          }}
          error={error?.phone}
        />
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => {
            setError(null)
            set('email')(event)
          }}
          error={error?.email}
        />
        <fieldset className="sm:col-span-2">
          <legend className="field-label">Role</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ['manager', 'Manager', 'Everything incl. menu, offers & analytics'],
              ['staff', 'Staff', 'Counter only: customers, bills, rewards'],
            ].map(([value, label, hint]) => (
              <label
                key={value}
                className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
                  form.role === value ? 'border-roast-400 bg-roast-50' : 'border-cream-300 hover:bg-cream-50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={form.role === value}
                  onChange={set('role')}
                  className="mt-1 accent-roast-500"
                />
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-[13px] text-espresso-500">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
