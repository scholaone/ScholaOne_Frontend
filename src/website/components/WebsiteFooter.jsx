import { Link } from 'react-router-dom'
import { FiArrowRight, FiGithub, FiMail, FiShield } from 'react-icons/fi'
import ScholaOneLogo from '@/components/brand/ScholaOneLogo'
import {
  BRAND_CONTACT_EMAIL,
  BRAND_GITHUB_URL,
  BRAND_NAME,
  BRAND_WEBSITE_URL,
} from '@/config/brand'
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
      <div className="landing-wrap landing-footer-inner">
        <div className="grid w-full gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link to="/" className="inline-flex">
              <ScholaOneLogo size="md" variant="full" imageClassName="max-h-12 sm:max-h-14" />
            </Link>
            <p className="mt-2 max-w-md text-xs font-semibold leading-relaxed landing-text-muted sm:text-sm">
              {WEBSITE.subdescription}
            </p>
            <Link
              to="/login"
              className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold landing-text-accent hover:opacity-80 sm:text-sm"
            >
              Sign in to the LMS <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:col-span-7 lg:gap-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider landing-text-muted">Explore</p>
              <ul className="mt-2 space-y-1.5">
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
              <p className="text-[11px] font-extrabold uppercase tracking-wider landing-text-muted">LMS modules</p>
              <ul className="mt-2 space-y-1">
                {MODULES.slice(0, 6).map((m) => (
                  <li key={m} className="text-sm font-semibold landing-text-muted">{m}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider landing-text-muted">Account</p>
              <ul className="mt-2 space-y-1.5">
                <li><Link to="/login" className="text-sm font-bold landing-text-muted hover:landing-text-accent">Sign in</Link></li>
                <li><Link to="/forgot-password" className="text-sm font-bold landing-text-muted hover:landing-text-accent">Forgot password</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="landing-footer-bar flex w-full flex-col items-center justify-between border-t border-[var(--lp-border)] sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <a
              href={BRAND_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-extrabold landing-text-accent hover:opacity-80"
            >
              scholaone.in
            </a>
            <span className="landing-footer-cloudflare">
              <FiShield className="h-3 w-3" aria-hidden />
              Cloudflare certified
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={BRAND_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="landing-footer-link inline-flex items-center gap-1.5"
              aria-label="GitHub"
            >
              <FiGithub className="h-3.5 w-3.5" />
            </a>
            <a
              href={`mailto:${BRAND_CONTACT_EMAIL}`}
              className="landing-footer-link inline-flex items-center gap-1.5"
            >
              <FiMail className="h-3.5 w-3.5" />
              {BRAND_CONTACT_EMAIL}
            </a>
          </div>
          <p className="text-[11px] font-semibold landing-text-muted">
            © {new Date().getFullYear()} {BRAND_NAME}
          </p>
        </div>
      </div>
    </footer>
  )
}
