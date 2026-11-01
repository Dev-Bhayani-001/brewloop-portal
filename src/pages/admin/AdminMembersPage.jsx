import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import { UserPlus } from 'lucide-react'

import Avatar from '../../components/Avatar'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import SegmentedControl from '../../components/SegmentedControl'
import MemberActions from '../../features/admin/MemberActions'
import { AddMemberModal, CredentialsModal } from '../../features/admin/MemberModals'
import { MEMBER_STATUS_TONE, ROLE_LABELS } from '../../utils/permissions'
import { formatRelative } from '../../utils/format'

export default function AdminMembersPage() {
  const users = useSelector((state) => state.admin.users)
  const businesses = useSelector((state) => state.admin.businesses)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [params, setParams] = useSearchParams()
  const adding = params.get('add') === '1'
  const setAdding = (open) => setParams(open ? { add: '1' } : {}, { replace: true })
  const [credentials, setCredentials] = useState(null)

  const businessesById = useMemo(() => Object.fromEntries(businesses.map((b) => [b.id, b])), [businesses])
  const members = users.filter((user) => user.businessId)
  const filtered = members.filter((member) => {
    if (role !== 'all' && member.role !== role) return false
    const text = query.trim().toLowerCase()
    return (
      !text ||
      `${member.name} ${member.email} ${member.phone} ${businessesById[member.businessId]?.name}`.toLowerCase().includes(text)
    )
  })

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Members"
        description="Managers and staff across every business."
        actions={
          <Button icon={UserPlus} onClick={() => setAdding(true)}>
            Add member
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SegmentedControl
          value={role}
          onChange={setRole}
          options={[
            { value: 'all', label: 'All', count: members.length },
            { value: 'manager', label: 'Managers', count: members.filter((m) => m.role === 'manager').length },
            { value: 'staff', label: 'Staff', count: members.filter((m) => m.role === 'staff').length },
          ]}
        />
        <SearchInput
          className="md:w-72"
          placeholder="Search name, email, business"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-cream-200 text-[11px] font-medium tracking-[0.12em] text-espresso-500 uppercase">
            <tr>
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Business</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Added</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {filtered.map((member) => (
              <tr key={member.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} size="sm" />
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-[13px] text-espresso-500">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Link to={`/admin/businesses/${member.businessId}`} className="hover:underline">
                    {businessesById[member.businessId]?.name}
                  </Link>
                </td>
                <td className="px-5 py-3">{ROLE_LABELS[member.role]}</td>
                <td className="px-5 py-3">
                  <Badge tone={MEMBER_STATUS_TONE[member.status]}>{member.status}</Badge>
                  {member.failedLogins > 0 && member.status !== 'locked' && (
                    <span className="ml-2 text-xs text-amber-700">{member.failedLogins} failed</span>
                  )}
                </td>
                <td className="px-5 py-3 text-espresso-600">{formatRelative(member.createdAt)}</td>
                <td className="px-5 py-3">
                  <MemberActions
                    member={member}
                    onPasswordReset={(userId) => setCredentials({ userId, title: 'Password reset' })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adding && (
        <AddMemberModal
          businessOptions={businesses.map((business) => ({ value: business.id, label: business.name }))}
          onClose={() => setAdding(false)}
          onCreated={(userId) => {
            setAdding(false)
            setCredentials({ userId, title: 'Login created' })
          }}
        />
      )}
      {credentials && (
        <CredentialsModal userId={credentials.userId} title={credentials.title} onClose={() => setCredentials(null)} />
      )}
    </>
  )
}
