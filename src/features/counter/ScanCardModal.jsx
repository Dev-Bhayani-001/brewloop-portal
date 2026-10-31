import { useState } from 'react'
import { useSelector } from 'react-redux'
import { ScanLine } from 'lucide-react'

import Button from '../../components/Button'
import { TextField } from '../../components/Field'
import Modal from '../../components/Modal'
import { selectCards, selectCustomers } from '../../app/selectors'

/**
 * QR scan entry point. USB/Bluetooth scanners act as keyboards, so the input is
 * focused and accepts the scanned card number + Enter. A camera scanner can plug in here later.
 */
export default function ScanCardModal({ onClose, onFound }) {
  const cards = useSelector(selectCards)
  const customers = useSelector(selectCustomers)
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const code = value.trim().toUpperCase()
    const card = cards.find((entry) => entry.cardNumber === code || entry.qrToken === value.trim())
    if (!card) return setError('No card with that number in this business.')
    if (card.status !== 'active') return setError('This card has been replaced. Ask for the new one.')
    onFound(customers.find((customer) => customer.id === card.customerId))
  }

  return (
    <Modal open onClose={onClose} title="Scan loyalty card" size="sm">
      <form onSubmit={handleSubmit}>
        <div className="relative mx-auto mb-5 flex aspect-square max-w-[220px] items-center justify-center overflow-hidden rounded-3xl bg-espresso-900 shadow-soft">
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-roast-500 opacity-60 blur-2xl" />
          <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-white/20" />
          <ScanLine className="size-14 animate-pulse text-roast-200" />
        </div>
        <p className="mb-4 text-center text-sm text-espresso-500">
          Point the scanner at the customer's QR, or type the card number.
        </p>
        <TextField
          placeholder="e.g. KC-00007"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setError(null)
          }}
          error={error}
          autoFocus
          inputClassName="font-mono uppercase tracking-wider"
        />
        <Button type="submit" variant="accent" className="mt-4 w-full">
          Find customer
        </Button>
      </form>
    </Modal>
  )
}
