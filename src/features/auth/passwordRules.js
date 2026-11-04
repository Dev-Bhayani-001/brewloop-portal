export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'One number', test: (value) => /\d/.test(value) },
  { label: 'One letter', test: (value) => /[a-z]/i.test(value) },
]
