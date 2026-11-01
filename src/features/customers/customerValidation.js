/** Pure validation helpers for customer and member forms (mirror these in the API). */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Last 10 digits of whatever was typed (handles +91, spaces, leading 0). */
export const phoneDigits = (value = '') => value.replace(/\D/g, '').slice(-10)

/** Indian mobile numbers are 10 digits starting 6–9. Returns an error message or null. */
export function phoneError(value) {
  const raw = value.replace(/\D/g, '')
  if (!raw) return 'Mobile number is required.'
  const digits = phoneDigits(value)
  if (digits.length !== 10 || raw.length > 12) return 'Enter a 10-digit mobile number.'
  if (!/^[6-9]/.test(digits)) return 'Indian mobile numbers start with 6, 7, 8 or 9.'
  return null
}

export const formatIndianPhone = (value) => {
  const digits = phoneDigits(value)
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}

export const isValidEmail = (value) => EMAIL_PATTERN.test(value.trim())

export function validateCustomer(form, customers, excludeId) {
  const errors = {}
  const phoneProblem = phoneError(form.phone)
  if (phoneProblem) {
    errors.phone = phoneProblem
  } else {
    const digits = phoneDigits(form.phone)
    const duplicate = customers.find((customer) => customer.id !== excludeId && phoneDigits(customer.phone) === digits)
    if (duplicate) errors.phone = `${duplicate.name} already uses this number.`
  }

  const name = form.name.trim()
  if (!name) errors.name = 'Name is required.'
  else if (name.length < 2) errors.name = 'Name looks too short.'
  else if (!/[a-z]/i.test(name)) errors.name = 'Name should contain letters.'

  if (form.email.trim() && !isValidEmail(form.email)) errors.email = 'That email doesn’t look right.'

  if (form.birthday) {
    const today = new Date()
    const date = new Date(`${form.birthday}T00:00:00`)
    if (Number.isNaN(date.getTime())) errors.birthday = 'Enter a valid date.'
    else if (date > today) errors.birthday = 'Birthday can’t be in the future.'
    else if (date.getFullYear() < 1900) errors.birthday = 'Check the year.'
  }
  return errors
}
