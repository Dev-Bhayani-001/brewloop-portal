import { Fragment, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Ban, ChevronDown, Plus, ReceiptText } from 'lucide-react'

import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import { TextField } from '../../components/Field'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import SearchInput from '../../components/SearchInput'
import SegmentedControl from '../../components/SegmentedControl'
import { selectBills, selectCustomers } from '../../app/selectors'
import { voidBill } from '../../features/billing/billingThunks'
import { toastShown } from '../../features/ui/uiSlice'
import { formatCurrency, formatDateTime } from '../../utils/format'

const RANGES = { today: 1, week: 7, month: 30, all: Infinity }
const PAGE_SIZE = 25

function VoidBillModal({ bill, customerName, onClose }) {
  const dispatch = useDispatch()
  const [reason, setReason] = useState('')

  const confirm = async () => {
    const action = await dispatch(voidBill({ billId: bill.id, reason }))
    const cancelled = action.payload?.rewardChanges.filter((change) => change.status === 'cancelled').length ?? 0
    dispatch(
      toastShown({
        title: 'Bill voided',
        description: cancelled
          ? `Offer progress reversed and ${cancelled} unused reward cancelled.`
          : 'Offer progress has been reversed.',
      }),
    )
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Void this bill?"
      description={`${formatCurrency(bill.total)} for ${customerName} · ${formatDateTime(bill.createdAt)}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Keep bill
          </Button>
          <Button variant="danger" icon={Ban} onClick={confirm} disabled={!reason.trim()}>
            Void bill
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-espresso-600">
        Bills are never deleted. Voiding keeps a record, reverses the stamps this bill earned, and cancels any
        reward it unlocked that hasn't been used yet.
      </p>
      <TextField
        label="Reason"
        placeholder="e.g. Wrong customer, entered twice"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        autoFocus
      />
    </Modal>
  )
}

export default function BillsPage() {
  const bills = useSelector(selectBills)
  const customers = useSelector(selectCustomers)
  const users = useSelector((state) => state.admin.users)
  const [range, setRange] = useState('week')
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [voiding, setVoiding] = useState(null)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [now] = useState(() => Date.now())

  const customersById = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers])
  const usersById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users])

  const filtered = useMemo(() => {
    const cutoff = range === 'today' ? new Date(new Date(now).toDateString()).getTime() : now - RANGES[range] * 86400000
    const text = query.trim().toLowerCase()
    return bills
      .filter((bill) => new Date(bill.createdAt).getTime() >= cutoff)
      .filter((bill) => !text || customersById[bill.customerId]?.name.toLowerCase().includes(text))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [bills, range, query, customersById, now])

  const activeTotal = filtered.filter((bill) => bill.status === 'active').reduce((sum, bill) => sum + bill.total, 0)

  return (
    <>
      <PageHeader
        eyebrow="Counter"
        title="Bills"
        description={`${filtered.length} bills · ${formatCurrency(activeTotal)} collected`}
        actions={
          <Button icon={Plus} to="/bills/new">
            New bill
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SegmentedControl
          value={range}
          onChange={(value) => {
            setRange(value)
            setVisible(PAGE_SIZE)
          }}
          options={[
            { value: 'today', label: 'Today' },
            { value: 'week', label: '7 days' },
            { value: 'month', label: '30 days' },
            { value: 'all', label: 'All' },
          ]}
        />
        <SearchInput
          className="md:w-72"
          placeholder="Search by customer"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-cream-200 text-[11px] font-medium tracking-[0.12em] text-espresso-500 uppercase">
                <tr>
                  <th className="w-8 px-3 py-3" />
                  <th className="px-3 py-3 font-medium">When</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Items</th>
                  <th className="px-3 py-3 font-medium">Recorded by</th>
                  <th className="px-3 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 text-right font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filtered.slice(0, visible).map((bill) => {
                  const customer = customersById[bill.customerId]
                  const expanded = expandedId === bill.id
                  const isVoid = bill.status === 'void'
                  return (
                    <Fragment key={bill.id}>
                      <tr className={isVoid ? 'bg-cream-50/60 text-espresso-400' : ''}>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => setExpandedId(expanded ? null : bill.id)}
                            className="rounded p-1 text-espresso-400 hover:bg-cream-100 hover:text-espresso-700"
                            aria-label={expanded ? 'Hide items' : 'Show items'}
                            aria-expanded={expanded}
                          >
                            <ChevronDown className={`size-4 transition ${expanded ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">{formatDateTime(bill.createdAt)}</td>
                        <td className="px-3 py-3">
                          <Link to={`/customers/${customer?.id}`} className="font-medium hover:underline">
                            {customer?.name}
                          </Link>
                        </td>
                        <td className="max-w-[240px] truncate px-3 py-3 text-espresso-600">
                          {bill.lines.reduce((sum, line) => sum + line.quantity, 0)} items
                          {bill.discount > 0 && (
                            <Badge tone="success" className="ml-2">
                              Reward
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 text-espresso-600">{usersById[bill.createdBy]?.name.split(' ')[0]}</td>
                        <td className={`tabular px-3 py-3 text-right font-semibold ${isVoid ? 'line-through' : ''}`}>
                          {formatCurrency(bill.total)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {isVoid ? (
                            <Badge tone="danger">Void</Badge>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => setVoiding(bill)}>
                              Void
                            </Button>
                          )}
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="bg-cream-50">
                          <td />
                          <td colSpan={6} className="px-3 pt-1 pb-4">
                            <ul className="max-w-md space-y-1 text-[13px]">
                              {bill.lines.map((line) => (
                                <li key={line.itemId} className="flex justify-between">
                                  <span>
                                    {line.quantity}× {line.name}
                                  </span>
                                  <span className="tabular">{formatCurrency(line.quantity * line.unitPrice)}</span>
                                </li>
                              ))}
                              {bill.discount > 0 && (
                                <li className="flex justify-between text-roast-600">
                                  <span>Reward</span>
                                  <span className="tabular">−{formatCurrency(bill.discount)}</span>
                                </li>
                              )}
                            </ul>
                            {isVoid && bill.voidReason && (
                              <p className="mt-2 text-[13px] text-red-700">Voided: {bill.voidReason}</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={ReceiptText} title="No bills in this period" />
        )}
        {filtered.length > visible && (
          <div className="border-t border-cream-200 p-3 text-center">
            <Button variant="ghost" size="sm" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
              Show more ({filtered.length - visible} left)
            </Button>
          </div>
        )}
      </div>

      {voiding && (
        <VoidBillModal
          bill={voiding}
          customerName={customersById[voiding.customerId]?.name}
          onClose={() => setVoiding(null)}
        />
      )}
    </>
  )
}
