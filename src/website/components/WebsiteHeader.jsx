import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiMenu, FiX } from 'react-icons/fi'
import ScholaOneLogo from '@/components/brand/ScholaOneLogo'

const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#audiences', label: 'For everyone' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#modules', label: 'Modules' },
]

export default function WebsiteHeader({ isAuthenticated }) {
  const headerRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        '--landing-header-height',
        `${header.offsetHeight}px`,
      )
    }

    syncHeaderHeight()
    const observer = new ResizeObserver(syncHeaderHeight)
    observer.observe(header)
    window.addEventListener('resize', syncHeaderHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncHeaderHeight)
    }
  }, [mobileOpen, scrolled])

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 w-full">
      <div className="landing-wrap py-1 transition-all duration-300">
        <div
          className={`flex min-h-[60px] w-full items-center justify-between rounded-2xl px-4 transition-all duration-300 sm:min-h-[72px] sm:px-6 lg:px-8 landing-glass-nav-toxic ${
            scrolled ? 'shadow-xl' : ''
          }`}
        >
          <Link to="/" className="landing-header-logo-wrap flex items-center bg-transparent">
            <ScholaOneLogo
              size="xl"
              variant="full"
              imageClassName="max-h-14 sm:max-h-16 lg:max-h-[4.75rem]"
            />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="landing-nav-link"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="landing-btn-toxic inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold text-white"
            >
              {isAuthenticated ? 'LMS Dashboard' : 'Sign in'}
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2.5 landing-text-primary lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="landing-glass mt-2 w-full rounded-2xl p-4 lg:hidden"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-4 py-3.5 text-sm font-bold landing-text-primary"
              >
                {item.label}
              </a>
            ))}
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="landing-btn-primary mt-3 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold text-white"
            >
              {isAuthenticated ? 'LMS Dashboard' : 'Sign in'}
            </Link>
          </motion.div>
        )}
      </div>
    </header>
  )
}
