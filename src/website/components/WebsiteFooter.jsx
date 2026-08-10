import { Link } from 'react-router-dom'
import { FiArrowRight, FiGithub, FiMail, FiTwitter } from 'react-icons/fi'
import ScholaOneLogo from '@/components/brand/ScholaOneLogo'
import { WEBSITE, MODULES } from '../content'

const EXPLORE = [
  { label: 'Features', href: '#features' },
  { label: 'For everyone', href: '#audiences' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Modules', href: '#modules' },
]

export default function WebsiteFooter() {
  return (
    <footer className="landing-footer w-full">
      <div className="landing-wrap py-16 lg:py-20">
        <div className="grid w-full gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link to="/" className="inline-flex">
              <ScholaOneLogo size="md" variant="full" />
            </Link>
            <p className="mt-5 max-w-md text-sm font-semibold leading-relaxed landing-text-muted">
              {WEBSITE.subdescription}
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold landing-text-accent hover:opacity-80"
            >
              Sign in to the LMS <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider landing-text-muted">Explore</p>
              <ul className="mt-4 space-y-3">
                {EXPLORE.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-sm font-bold landing-text-muted hover:landing-text-accent">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider landing-text-muted">LMS modules</p>
              <ul className="mt-4 space-y-2">
                {MODULES.slice(0, 8).map((m) => (
                  <li key={m} className="text-sm font-semibold landing-text-muted">{m}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider landing-text-muted">Account</p>
              <ul className="mt-4 space-y-3">
                <li><Link to="/login" className="text-sm font-bold landing-text-muted hover:landing-text-accent">Sign in</Link></li>
                <li><Link to="/forgot-password" className="text-sm font-bold landing-text-muted hover:landing-text-accent">Forgot password</Link></li>
              </ul>
              <div className="mt-6 flex gap-3">
                {[FiTwitter, FiGithub, FiMail].map((Icon, i) => (
                  <span
                    key={i}
                    className="landing-icon-box flex h-10 w-10 cursor-default items-center justify-center landing-text-muted"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex w-full flex-col items-center justify-between gap-4 border-t border-[var(--lp-border)] pt-8 sm:flex-row">
          <p className="text-xs font-semibold landing-text-muted">
            © {new Date().getFullYear()} {WEBSITE.name}. Learning Management System.
          </p>
          <p className="text-xs font-semibold landing-text-muted">
            React · Tailwind · Framer Motion
          </p>
        </div>
      </div>
    </footer>
  )
}
