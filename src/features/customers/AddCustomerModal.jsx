import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Printer, ReceiptText } from 'lucide-react'

import Button from '../../components/Button'
import { TextField } from '../../components/Field'
import LoyaltyCard from '../../components/LoyaltyCard'
import Modal from '../../components/Modal'
import { selectCardsByCustomer, selectCurrentBusiness, selectCustomers } from '../../app/selectors'
import { formatDate, toDateInputValue } from '../../utils/format'
import { toastShown } from '../ui/uiSlice'
import { customerAdded, customerUpdated } from './customersSlice'
import { formatIndianPhone, validateCustomer } from './customerValidation'

const EMPTY = { name: '', phone: '', email: '', birthday: '' }

function CustomerFields({ form, errors, update, isEdit }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        className="sm:col-span-2"
        label="Mobile number"
        prefix="+91"
        type="tel"
        inputMode="numeric"
        autoComplete="off"
        placeholder="98250 12345"
        maxLength={14}
        value={form.phone}
        onChange={update('phone')}
        error={errors.phone}
        autoFocus={!isEdit}
      />
      <TextField
        className="sm:col-span-2"
        label="Full name"
        placeholder="e.g. Ananya Mehta"
        maxLength={60}
        value={form.name}
        onChange={update('name')}
        error={errors.name}
        autoFocus={isEdit}
      />
      <TextField
        label="Email"
        hint="Optional"
        type="email"
        placeholder="name@mail.com"
        value={form.email}
        onChange={update('email')}
        error={errors.email}
      />
      <TextField
        label="Birthday"
        hint="Optional"
        type="date"
        max={toDateInputValue(new Date())}
        value={form.birthday}
        onChange={update('birthday')}
        error={errors.birthday}
      />
    </div>
  )
}

/** Shared form state + validation for add and edit. */
function useCustomerForm(initial, excludeId) {
  const customers = useSelector(selectCustomers)
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const validate = () => {
    const result = validateCustomer(form, customers, excludeId)
    setErrors(result)
    return Object.keys(result).length === 0
  }

  return { form, errors, update, validate }
}

/**
 * Add a customer at the counter. Phone is the unique key per business.
 * On success the freshly issued loyalty card is shown so staff can hand it over.
 */
export default function AddCustomerModal({ open, onClose, initialPhone = '', onCreated }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const business = useSelector(selectCurrentBusiness)
  const customers = useSelector(selectCustomers)
  const cardsByCustomer = useSelector(selectCardsByCustomer)
  const { form, errors, update, validate } = useCustomerForm({ ...EMPTY, phone: initialPhone })
  const [createdId, setCreatedId] = useState(null)

  const created = customers.find((customer) => customer.id === createdId)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return
    const action = dispatch(
      customerAdded({
        cardPrefix: business.cardPrefix,
        customer: {
          businessId: business.id,
          name: form.name.trim().replace(/\s+/g, ' '),
          phone: formatIndianPhone(form.phone),
          email: form.email.trim().toLowerCase(),
          birthday: form.birthday,
        },
      }),
    )
    setCreatedId(action.payload.customer.id)
    onCreated?.(action.payload.customer)
  }

  if (created) {
    const card = cardsByCustomer[created.id]
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Card issued"
        description={`${created.name} is now a member. Share or print their card.`}
        footer={
          <>
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
            <Button
              variant="accent"
              icon={ReceiptText}
              onClick={() => {
                onClose()
                navigate(`/bills/new?customer=${created.id}`)
              }}
            >
              Start a bill
            </Button>
          </>
        }
      >
        <div>
          <LoyaltyCard
            businessName={business.name}
            customerName={created.name}
            cardNumber={card.cardNumber}
            memberSince={formatDate(created.createdAt)}
          />
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add customer"
      description="A loyalty card is issued automatically."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" form="add-customer-form">
            Add & issue card
          </Button>
        </>
      }
    >
      <form id="add-customer-form" onSubmit={handleSubmit} noValidate>
        <CustomerFields form={form} errors={errors} update={update} />
      </form>
    </Modal>
  )
}

/** Edit an existing customer's details. Phone stays unique within the business. */
export function EditCustomerModal({ customer, onClose }) {
  const dispatch = useDispatch()
  const { form, errors, update, validate } = useCustomerForm(
    {
      name: customer.name,
      phone: customer.phone.replace(/^\+91\s*/, ''),
      email: customer.email ?? '',
      birthday: customer.birthday ?? '',
    },
    customer.id,
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return
    dispatch(
      customerUpdated({
        id: customer.id,
        name: form.name.trim().replace(/\s+/g, ' '),
        phone: formatIndianPhone(form.phone),
        email: form.email.trim().toLowerCase(),
        birthday: form.birthday,
      }),
    )
    dispatch(toastShown('Details saved'))
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit details"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" form="edit-customer-form">
            Save changes
          </Button>
        </>
      }
    >
      <form id="edit-customer-form" onSubmit={handleSubmit} noValidate>
        <CustomerFields form={form} errors={errors} update={update} isEdit />
      </form>
    </Modal>
  )
}
