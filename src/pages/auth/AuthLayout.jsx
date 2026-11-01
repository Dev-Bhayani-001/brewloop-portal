import BrandMark from '../../components/BrandMark'
import LoyaltyCard from '../../components/LoyaltyCard'
import StampProgress from '../../components/StampProgress'
import ThemeToggle from '../../components/ThemeToggle'

/** Split-screen auth frame: an editorial brand panel on the left, the form on the right. */
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative m-3 hidden overflow-hidden rounded-3xl bg-espresso-900 p-12 text-cream-50 lg:flex lg:flex-col">
        <div className="absolute -top-40 -right-40 size-[560px] rounded-full bg-roast-500/25 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.05)_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative">
          <BrandMark inverted />
        </div>

        <div className="relative my-auto max-w-lg">
          <p className="eyebrow text-cream-300">Loyalty, made simple</p>
          <h1 className="display-title mt-4 text-[72px] leading-[0.95] text-cream-50">
            Turn first visits into <em className="text-roast-200">regulars.</em>
          </h1>
          <p className="mt-6 max-w-sm text-[17px] leading-relaxed text-cream-300">
            Loyalty cards, stamp offers and repeat-customer insights for cafés and neighbourhood shops.
          </p>

          <div className="relative mt-14 h-60">
            <div className="absolute left-0 w-[340px] animate-fade-up">
              <LoyaltyCard businessName="Kettle & Crumb" customerName="Ananya Mehta" cardNumber="KC-00042" compact />
            </div>
            <div className="absolute top-28 left-[300px] animate-fade-up rounded-2xl bg-cream-50 p-4 text-espresso-900 shadow-pop">
              <p className="mb-2.5 text-[13px] font-medium">7th bill on us</p>
              <StampProgress count={4} threshold={6} size="sm" />
              <p className="mt-2.5 text-[11px] text-espresso-500">2 more visits to unlock</p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-espresso-400">© {new Date().getFullYear()} Brewloop</p>
      </section>

      <section className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto my-auto w-full max-w-sm animate-fade-up py-10">{children}</div>
      </section>
    </div>
  )
}
