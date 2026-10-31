/** Role → capability map. Mirrors what the API must enforce server-side. */
export const ROLES = {
  platform_admin: 'platform_admin',
  manager: 'manager',
  staff: 'staff',
}

export const ROLE_LABELS = {
  platform_admin: 'Platform admin',
  manager: 'Manager',
  staff: 'Staff',
}

const CAPABILITIES = {
  manager: ['customers', 'billing', 'cards', 'rewards', 'menu', 'offers', 'analytics', 'settings'],
  staff: ['customers', 'billing', 'cards', 'rewards'],
  platform_admin: ['admin'],
}

export const can = (role, capability) => CAPABILITIES[role]?.includes(capability) ?? false

export const MEMBER_STATUS_TONE = { active: 'success', invited: 'warning', locked: 'danger', deactivated: 'neutral' }

/** Landing route after login for each role. */
export const homeFor = (role) => (role === 'platform_admin' ? '/admin' : '/')
