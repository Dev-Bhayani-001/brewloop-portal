import BrandMark from '../../components/BrandMark'
import LegalFooter from '../../components/LegalFooter'
import ThemeToggle from '../../components/ThemeToggle'
import CupStory from '../../features/loyalty/CupStory'

/** Split-screen auth frame: an editorial brand panel on the left, the form on the right. */
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="auth-panel m-3 hidden rounded-3xl p-10 lg:flex lg:flex-col">
        <div className="relative z-10">
          <BrandMark accent="#7a4d2c" />
        </div>
        <CupStory />
      </section>

      <section className="auth-scope flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto my-auto w-full max-w-sm animate-fade-up py-10">{children}</div>
        <LegalFooter />
      </section>
    </div>
  )
}
