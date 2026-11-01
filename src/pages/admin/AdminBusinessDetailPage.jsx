import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Pause, Play, UserPlus } from 'lucide-react'

import Avatar from '../../components/Avatar'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import PlanBadge from '../../components/PlanBadge'
import StatTile from '../../components/StatTile'
import { businessUpdated } from '../../features/admin/adminSlice'
import MemberActions from '../../features/admin/MemberActions'
import { AddMemberModal, CredentialsModal } from '../../features/admin/MemberModals'
import { toastShown } from '../../features/ui/uiSlice'
import { PLAN_ORDER, PLANS } from '../../utils/planFeatures'
import { MEMBER_STATUS_TONE, ROLE_LABELS } from '../../utils/permissions'
import { formatCurrency, formatDate, formatNumber } from '../../utils/format'

function ChangePlanModal({ business, plan, onClose }) {
  const dispatch = useDispatch()
  const isDowngrade = PLAN_ORDER.indexOf(plan) < PLAN_ORDER.indexOf(business.plan)

  const confirm = () => {
    dispatch(businessUpdated({ id: business.id, plan }))
    dispatch(toastShown(`${business.name} moved to ${PLANS[plan].label}`))
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={`Move to ${PLANS[plan].label}?`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={confirm}>Change plan</Button>
        </>
      }
    >
      <p className="text-sm text-espresso-600">
        This takes effect immediately for everyone at {business.name}.
        {isDowngrade &&
          ' Features not on the new plan are hidden — no data is deleted, and it all comes back if they upgrade again.'}
      </p>
    </Modal>
  )
}

export default function AdminBusinessDetailPage() {
  const { businessId } = useParams()
  const dispatch = useDispatch()
  const [params, setParams] = useSearchParams()
  const business = useSelector((state) => state.admin.businesses.find((entry) => entry.id === businessId))
  const allUsers = useSelector((state) => state.admin.users)
  const allCustomers = useSelector((state) => state.customers.customers)
  const allBills = useSelector((state) => state.billing.bills)
  const [pendingPlan, setPendingPlan] = useState(null)
  const [credentials, setCredentials] = useState(null) // { userId, title }
  const addingMember = params.get('addMember') === '1'

  if (!business) return <EmptyState title="Business not found" />

  const members = allUsers.filter((user) => user.businessId === businessId)
  const customerCount = allCustomers.filter((customer) => customer.businessId === businessId).length
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const monthBills = allBills.filter(
    (bill) => bill.businessId === businessId && bill.status === 'active' && bill.createdAt >= monthStart,
  )
  const isActive = business.status === 'active'

  const setAddingMember = (open) => {
    const next = new URLSearchParams(params)
    if (open) next.set('addMember', '1')
    else next.delete('addMember')
    setParams(next, { replace: true })
  }

  const toggleStatus = () => {
    dispatch(businessUpdated({ id: business.id, status: isActive ? 'paused' : 'active' }))
    dispatch(toastShown(isActive ? `${business.name} paused — members can't sign in` : `${business.name} reactivated`))
  }

  return (
    <>
      <Link to="/admin" className="mb-4 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold text-espresso-500 hover:bg-white hover:text-espresso-900">
        <ArrowLeft className="size-4" /> Businesses
      </Link>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="display-title text-[40px] leading-none sm:text-[48px]">{business.name}</h1>
            <Badge tone={isActive ? 'success' : 'warning'}>{business.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-espresso-500">
            {business.city} · card prefix {business.cardPrefix} · since {formatDate(business.createdAt)}
          </p>
        </div>
        <Button variant={isActive ? 'danger' : 'secondary'} icon={isActive ? Pause : Play} onClick={toggleStatus}>
          {isActive ? 'Pause business' : 'Reactivate'}
        </Button>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <StatTile label="Customers" value={formatNumber(customerCount)} />
        <StatTile label="Bills this month" value={formatNumber(monthBills.length)} />
        <StatTile
          label="Sales this month"
          value={formatCurrency(monthBills.reduce((sum, bill) => sum + bill.total, 0))}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <header className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
            <div>
              <h2 className="display-title text-[22px] leading-tight">Members</h2>
              <p className="text-[13px] text-espresso-500">Managers and counter staff who can sign in.</p>
            </div>
            <Button size="sm" icon={UserPlus} onClick={() => setAddingMember(true)}>
              Add member
            </Button>
          </header>
          {members.length ? (
            <ul className="divide-y divide-cream-200">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={member.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member.name}
                      <span className="ml-2 text-[13px] font-normal text-espresso-500">{ROLE_LABELS[member.role]}</span>
                    </p>
                    <p className="truncate text-[13px] text-espresso-500">
                      {member.phone} · {member.email}
                    </p>
                  </div>
                  <Badge tone={MEMBER_STATUS_TONE[member.status]}>
                    {member.status === 'invited' ? 'awaiting first login' : member.status}
                  </Badge>
                  <MemberActions
                    member={member}
                    onPasswordReset={(userId) => setCredentials({ userId, title: 'Password reset' })}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={UserPlus}
              title="No members yet"
              description="Add the owner as a manager so they can start issuing cards."
              action={
                <Button icon={UserPlus} onClick={() => setAddingMember(true)}>
                  Add manager
                </Button>
              }
            />
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="display-title text-[22px] leading-tight">Plan</h2>
            <PlanBadge plan={business.plan} />
          </div>
          <div className="mt-4 space-y-2">
            {PLAN_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                disabled={id === business.plan}
                onClick={() => setPendingPlan(id)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                  id === business.plan
                    ? 'border-roast-400 bg-roast-50'
                    : 'border-cream-300 hover:border-espresso-400/40 hover:bg-cream-50'
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">{PLANS[id].label}</span>
                  <span className="block text-[13px] text-espresso-500">{PLANS[id].tagline}</span>
                </span>
                {id === business.plan && <Badge tone="accent">Current</Badge>}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-espresso-500">Changes apply immediately. Downgrades hide data, never delete it.</p>
        </section>
      </div>

      {pendingPlan && <ChangePlanModal business={business} plan={pendingPlan} onClose={() => setPendingPlan(null)} />}
      {addingMember && (
        <AddMemberModal
          businessId={business.id}
          onClose={() => setAddingMember(false)}
          onCreated={(userId) => {
            setAddingMember(false)
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
