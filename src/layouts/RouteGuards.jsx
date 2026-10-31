import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { selectCurrentBusiness, selectCurrentUser, selectSession } from '../app/selectors'
import { loggedOut } from '../features/auth/authSlice'
import { can, homeFor } from '../utils/permissions'

/**
 * Requires a valid session. Ends it if the user was deactivated/locked or their
 * business paused while signed in (the API would reject their token the same way).
 * Members with must_reset_password are sent to the reset screen.
 */
export function RequireAuth() {
  const dispatch = useDispatch()
  const session = useSelector(selectSession)
  const user = useSelector(selectCurrentUser)
  const business = useSelector(selectCurrentBusiness)
  const location = useLocation()

  const revoked =
    session &&
    (!user ||
      ['deactivated', 'locked'].includes(user.status) ||
      (session.businessId && (!business || business.status !== 'active')))

  useEffect(() => {
    if (revoked) dispatch(loggedOut())
  }, [revoked, dispatch])

  if (!session || revoked) return <Navigate to="/login" replace state={{ from: location }} />
  if (session.mustResetPassword) return <Navigate to="/set-password" replace />
  return <Outlet />
}

export function RequireRole({ roles }) {
  const session = useSelector(selectSession)
  if (!roles.includes(session.role)) return <Navigate to={homeFor(session.role)} replace />
  return <Outlet />
}

/** Role capability gate (UI layer). The API enforces the same rule. */
export function RequireCapability({ capability }) {
  const session = useSelector(selectSession)
  if (!can(session.role, capability)) return <Navigate to="/" replace />
  return <Outlet />
}
