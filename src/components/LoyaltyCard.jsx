import { QRCodeSVG } from 'qrcode.react'

/** The customer's digital/printable loyalty card. The QR encodes the card number. */
export default function LoyaltyCard({ businessName, customerName, cardNumber, memberSince, compact = false }) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-3xl bg-espresso-900 text-cream-50 shadow-lifted ring-1 ring-white/10 print:shadow-none ${
        compact ? 'p-5' : 'p-7'
      }`}
    >
      {/* Soft light falloff for a premium, card-stock feel */}
      <div className="absolute -top-32 -right-24 -z-10 size-72 rounded-full bg-roast-500/35 blur-3xl" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgb(255_255_255/0.08),transparent_40%)]" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-[0.22em] text-cream-300 uppercase">Loyalty member</p>
          <p className={`display-title mt-1.5 truncate text-cream-50 ${compact ? 'text-2xl' : 'text-[34px] leading-tight'}`}>
            {businessName}
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-cream-50 p-2">
          <QRCodeSVG value={cardNumber} size={compact ? 60 : 84} fgColor="#171513" bgColor="#fdfcfa" level="M" />
        </div>
      </div>

      <div className={`flex items-end justify-between gap-4 ${compact ? 'mt-6' : 'mt-12'}`}>
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.18em] text-cream-300 uppercase">Name</p>
          <p className="truncate text-[15px] font-medium">{customerName}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-[0.18em] text-cream-300 uppercase">Card no.</p>
          <p className="tabular font-mono text-[15px] tracking-wider">{cardNumber}</p>
        </div>
      </div>
      {memberSince && !compact && (
        <p className="mt-5 border-t border-white/10 pt-3 text-[11px] tracking-wide text-cream-300">
          Member since {memberSince}
        </p>
      )}
    </div>
  )
}
