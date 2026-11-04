import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Avatar from '../../components/Avatar'
import Button from '../../components/Button'
import { TextField } from '../../components/Field'
import ImageCropModal from '../../components/ImageCropModal'
import Modal from '../../components/Modal'
import { selectCurrentUser } from '../../app/selectors'
import ChangePasswordModal from './ChangePasswordModal'
import { memberUpdated } from '../admin/adminSlice'
import { formatIndianPhone, isValidEmail, phoneDigits, phoneError } from '../customers/customerValidation'
import { toastShown } from '../ui/uiSlice'
import { IMAGE_TYPES, imageFileError } from '../../utils/image'

/** Lets the signed-in user edit their own name and, unless they're a customer, their login details. */
export default function EditProfileModal({ onClose }) {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const users = useSelector((state) => state.admin.users)
  // Loyalty cards are matched to customers by phone and email, so changing them would lose
  // the customer's cards or expose someone else's.
  const contactLocked = user.role === 'customer'
  const photoInputRef = useRef(null)
  const [form, setForm] = useState({
    name: user.name,
    phone: phoneDigits(user.phone),
    email: user.email,
    avatar: user.avatar ?? null,
  })
  const [errors, setErrors] = useState({})
  const [cropFile, setCropFile] = useState(null)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const choosePhoto = (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // Lets the same file be picked again after removing it.
    if (!file) return
    const avatar = imageFileError(file) ?? undefined
    setErrors((current) => ({ ...current, avatar }))
    if (!avatar) setCropFile(file)
  }

  const submit = (event) => {
    event.preventDefault()
    const name = form.name.trim().replace(/\s+/g, ' ')
    const nextErrors = {}
    if (name.length < 2) nextErrors.name = 'Enter your full name.'

    if (contactLocked) {
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length) return
      dispatch(memberUpdated({ id: user.id, name, avatar: form.avatar }))
    } else {
      const others = users.filter((entry) => entry.id !== user.id)
      const email = form.email.trim().toLowerCase()
      const digits = phoneDigits(form.phone)
      const phoneProblem = phoneError(form.phone)
      if (phoneProblem) nextErrors.phone = phoneProblem
      else if (others.some((entry) => phoneDigits(entry.phone) === digits)) nextErrors.phone = 'This number is already in use.'
      if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email.'
      else if (others.some((entry) => entry.email?.toLowerCase() === email)) nextErrors.email = 'This email is already in use.'
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length) return
      dispatch(memberUpdated({ id: user.id, name, phone: formatIndianPhone(form.phone), email, avatar: form.avatar }))
    }

    dispatch(toastShown('Profile updated'))
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Edit profile"
      description={
        contactLocked
          ? 'Your mobile and email are linked to your loyalty cards, so they can’t be changed here.'
          : 'You log in with your mobile or email, so any change applies to your next login.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="profile-form">
            Save
          </Button>
        </>
      }
    >
      <form id="profile-form" onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <div className="flex items-center gap-4">
            <Avatar name={form.name} src={form.avatar} size="lg" />
            <input
              ref={photoInputRef}
              type="file"
              accept={IMAGE_TYPES.join(',')}
              className="hidden"
              onChange={choosePhoto}
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => photoInputRef.current?.click()}>
                {form.avatar ? 'Change photo' : 'Upload photo'}
              </Button>
              {form.avatar && (
                <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, avatar: null })}>
                  Remove
                </Button>
              )}
            </div>
          </div>
          {errors.avatar ? (
            <p role="alert" className="mt-1.5 text-[13px] font-medium text-red-700 dark:text-red-400">
              {errors.avatar}
            </p>
          ) : (
            <p className="mt-1.5 text-[13px] text-espresso-500 dark:text-cream-300/80">
              Optional. PNG, JPG or WebP, up to 10 MB.
            </p>
          )}
        </div>
        <TextField
          label="Full name"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          maxLength={60}
          autoComplete="name"
          autoFocus
        />
        <TextField
          label="Mobile"
          prefix="+91"
          type="tel"
          inputMode="numeric"
          maxLength={14}
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
          disabled={contactLocked}
        />
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          disabled={contactLocked}
        />
        <div className="flex items-center justify-between gap-3 border-t border-cream-200 pt-4 dark:border-white/10">
          <div>
            <p className="text-sm font-medium">Password</p>
            {passwordChanged && (
              <p role="status" className="text-[13px] text-leaf-700 dark:text-emerald-300">
                Password updated.
              </p>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setChangingPassword(true)}>
            Change password
          </Button>
        </div>
      </form>
      {changingPassword && (
        <ChangePasswordModal
          onClose={() => setChangingPassword(false)}
          onChanged={() => {
            setChangingPassword(false)
            setPasswordChanged(true)
          }}
        />
      )}
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          shape="circle"
          onCancel={() => setCropFile(null)}
          onCrop={(avatar) => {
            setForm((current) => ({ ...current, avatar }))
            setCropFile(null)
          }}
        />
      )}
    </Modal>
  )
}
