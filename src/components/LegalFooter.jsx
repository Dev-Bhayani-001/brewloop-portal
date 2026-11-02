import { Link } from 'react-router-dom'

const LINK = 'underline-offset-4 hover:text-espresso-900 hover:underline dark:hover:text-cream-50'

/** Copyright and legal links, shown at the bottom of every screen. */
export default function LegalFooter({ className = '' }) {
  return (
    <footer className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-espresso-500 dark:text-cream-300/80 ${className}`}>
      <span>© {new Date().getFullYear()} Brewloop</span>
      <Link to="/privacy" className={LINK}>
        Privacy Policy
      </Link>
      <Link to="/terms" className={LINK}>
        Terms and Conditions
      </Link>
    </footer>
  )
}
