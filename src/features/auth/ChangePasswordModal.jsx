import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Check } from 'lucide-react'

import Button from '../../components/Button'
import { TextField } from '../../components/Field'
import Modal from '../../components/Modal'
import { changeOwnPassword } from './authSlice'
import { PASSWORD_RULES } from './passwordRules'

/** Asks for the current password, then the new one twice. */
export default function ChangePasswordModal({ onClose, onChanged }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.current) nextErrors.current = 'Enter your current password.'
    if (!PASSWORD_RULES.every((rule) => rule.test(form.next))) nextErrors.next = 'Meet all the rules below.'
    else if (form.next === form.current) nextErrors.next = 'Choose something other than your current password.'
    if (form.confirm !== form.next) nextErrors.confirm = 'Passwords don’t match.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    try {
      await dispatch(changeOwnPassword({ currentPassword: form.current, newPassword: form.next })).unwrap()
      onChanged()
    } catch (message) {
      setErrors({ current: message })
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Change password"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="password-form" loading={saving}>
            Update password
          </Button>
        </>
      }
    >
      <form id="password-form" onSubmit={submit} className="space-y-4" noValidate>
        <TextField
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={form.current}
          onChange={set('current')}
          error={errors.current}
          autoFocus
        />
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={form.next}
          onChange={set('next')}
          error={errors.next}
        />
        <ul className="grid gap-1.5 text-[13px]">
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(form.next)
            return (
              <li
                key={rule.label}
                className={`flex items-center gap-2 font-medium ${
                  passed ? 'text-espresso-900 dark:text-cream-50' : 'text-espresso-500 dark:text-cream-300/80'
                }`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded-full transition ${
                    passed
                      ? 'bg-espresso-900 text-cream-50 dark:bg-roast-500'
                      : 'ring-1 ring-cream-300 dark:ring-white/20'
                  }`}
                >
                  {passed && <Check className="size-3" />}
                </span>
                {rule.label}
              </li>
            )
          })}
        </ul>
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
        />
      </form>
    </Modal>
  )
}
