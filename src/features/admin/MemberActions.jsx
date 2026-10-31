import { useDispatch } from 'react-redux'
import { KeyRound, UserCheck, UserX } from 'lucide-react'

import Button from '../../components/Button'
import { toastShown } from '../ui/uiSlice'
import { memberPasswordReset, memberUpdated } from './adminSlice'

/** Reset password (admin-driven "forgot password") and deactivate / reactivate. */
export default function MemberActions({ member, onPasswordReset }) {
  const dispatch = useDispatch()
  const isDeactivated = member.status === 'deactivated'

  const resetPassword = () => {
    dispatch(memberPasswordReset(member.id))
    onPasswordReset(member.id)
  }

  const toggleActive = () => {
    const status = isDeactivated ? (member.mustResetPassword ? 'invited' : 'active') : 'deactivated'
    dispatch(memberUpdated({ id: member.id, status }))
    dispatch(toastShown(isDeactivated ? `${member.name} reactivated` : `${member.name} can no longer sign in`))
  }

  return (
    <div className="flex justify-end gap-1">
      {!isDeactivated && (
        <Button
          variant="ghost"
          size="sm"
          icon={KeyRound}
          onClick={resetPassword}
          title="Reset password"
          aria-label={`Reset password for ${member.name}`}
        >
          <span className="hidden xl:inline">Reset</span>
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        icon={isDeactivated ? UserCheck : UserX}
        onClick={toggleActive}
        title={isDeactivated ? 'Reactivate' : 'Deactivate'}
        aria-label={`${isDeactivated ? 'Reactivate' : 'Deactivate'} ${member.name}`}
      >
        <span className="hidden xl:inline">{isDeactivated ? 'Reactivate' : 'Deactivate'}</span>
      </Button>
    </div>
  )
}
