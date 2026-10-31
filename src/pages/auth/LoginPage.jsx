import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react'

import AuthLayout from './AuthLayout'
import Button from '../../components/Button'
import { TextField } from '../../components/Field'
import { selectSession } from '../../app/selectors'
import { errorCleared, login } from '../../features/auth/authSlice'
import { homeFor } from '../../utils/permissions'
import { DEMO_ACCOUNTS } from '../../services/mockDb'

export default function LoginPage() {
  const dispatch = useDispatch()
  const session = useSelector(selectSession)
  const { status, error } = useSelector((state) => state.auth)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (session) return <Navigate to={session.mustResetPassword ? '/set-password' : homeFor(session.role)} replace />

  const handleSubmit = (event) => {
    event.preventDefault()
    dispatch(login({ identifier, password }))
  }

  const fillDemo = (account) => {
    dispatch(errorCleared())
    setIdentifier(account.identifier)
    setPassword(account.password)
  }

  return (
    <AuthLayout>
      <h2 className="display-title text-[44px] leading-none">Welcome back</h2>
      <p className="mt-3 text-espresso-500">Sign in with the phone number or email your Brewloop admin set up for you.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <TextField
          label="Phone or email"
          placeholder="98250 11111 or you@cafe.in"
          autoComplete="username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
          autoFocus
        />
        <div className="relative">
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2 bottom-1.5 rounded-full p-2 text-espresso-400 hover:bg-cream-100 hover:text-espresso-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={status === 'loading'} iconRight={ArrowRight}>
          Sign in
        </Button>
      </form>

      <p className="mt-5 text-sm text-espresso-500">
        Forgot your password? Ask your Brewloop admin to reset it — you'll get a new one-time password.
      </p>

      <div className="mt-10 rounded-2xl border border-dashed border-cream-300 p-3">
        <p className="eyebrow flex items-center gap-1.5">
          <KeyRound className="size-3" /> Demo accounts
        </p>
        <div className="mt-3 grid gap-1">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.identifier}
              type="button"
              onClick={() => fillDemo(account)}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white hover:shadow-card"
            >
              <span className="font-medium text-espresso-800">{account.label}</span>
              <span className="truncate pl-3 text-xs text-espresso-500">{account.identifier}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  )
}
