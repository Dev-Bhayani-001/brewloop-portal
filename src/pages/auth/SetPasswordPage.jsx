import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { Check, ShieldCheck } from 'lucide-react'

import AuthLayout from './AuthLayout'
import Button from '../../components/Button'
import { TextField } from '../../components/Field'
import { selectCurrentUser, selectSession } from '../../app/selectors'
import { loggedOut, setOwnPassword } from '../../features/auth/authSlice'
import { homeFor } from '../../utils/permissions'

const RULES = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'One number', test: (value) => /\d/.test(value) },
  { label: 'One letter', test: (value) => /[a-z]/i.test(value) },
]

/** Step 4 of onboarding: the member must replace their temporary password before anything else. */
export default function SetPasswordPage() {
  const dispatch = useDispatch()
  const session = useSelector(selectSession)
  const user = useSelector(selectCurrentUser)
  const status = useSelector((state) => state.auth.status)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState(false)

  if (!session) return <Navigate to="/login" replace />
  if (!session.mustResetPassword) return <Navigate to={homeFor(session.role)} replace />

  const passesRules = RULES.every((rule) => rule.test(password))
  const matches = password === confirm
  const reusesTemporary = password === user?.demoPassword

  const handleSubmit = (event) => {
    event.preventDefault()
    setTouched(true)
    if (!passesRules || !matches || reusesTemporary) return
    dispatch(setOwnPassword({ password }))
  }

  return (
    <AuthLayout>
      <span className="flex size-12 items-center justify-center rounded-full bg-tint-sage text-leaf-700">
        <ShieldCheck className="size-5" strokeWidth={1.75} />
      </span>
      <h2 className="mt-5 display-title text-[44px] leading-none">Set your password</h2>
      <p className="mt-2 text-espresso-500">
        Hi {user?.name?.split(' ')[0]}, you signed in with a one-time password. Choose your own to continue — the
        temporary one stops working after this.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          required
        />
        <ul className="grid gap-1.5 text-[13px]">
          {RULES.map((rule) => {
            const ok = rule.test(password)
            return (
              <li key={rule.label} className={`flex items-center gap-2 font-medium ${ok ? 'text-espresso-900' : 'text-espresso-500'}`}>
                <span
                  className={`flex size-4 items-center justify-center rounded-full transition ${ok ? 'bg-espresso-900 text-cream-50' : 'ring-1 ring-cream-300'}`}
                >
                  {ok && <Check className="size-3" />}
                </span>
                {rule.label}
              </li>
            )
          })}
        </ul>
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={touched && !matches ? "Passwords don't match." : touched && reusesTemporary ? 'Choose something other than your temporary password.' : null}
          required
        />
        <Button type="submit" size="lg" className="w-full" loading={status === 'loading'} disabled={!passesRules}>
          Save and continue
        </Button>
      </form>
      <button
        type="button"
        onClick={() => dispatch(loggedOut())}
        className="mt-4 text-sm text-espresso-500 hover:text-espresso-800"
      >
        Not you? Sign out
      </button>
    </AuthLayout>
  )
}
