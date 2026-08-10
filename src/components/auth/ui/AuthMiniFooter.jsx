import { FiGithub, FiMail, FiShield } from 'react-icons/fi'
import {
  BRAND_CONTACT_EMAIL,
  BRAND_GITHUB_URL,
  BRAND_NAME,
  BRAND_WEBSITE_URL,
} from '@/config/brand'

export default function AuthMiniFooter() {
  return (
    <footer className="auth-mini-footer">
      <div className="auth-mini-footer__cert">
        <a
          href={BRAND_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="auth-mini-footer__site"
        >
          scholaone.in
        </a>
        <span className="auth-mini-footer__badge">
          <FiShield className="h-3 w-3" aria-hidden />
          Cloudflare certified
        </span>
      </div>
      <div className="auth-mini-footer__links">
        <a
          href={BRAND_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="auth-mini-footer__link"
          aria-label="GitHub"
        >
          <FiGithub className="h-3.5 w-3.5" />
        </a>
        <a href={`mailto:${BRAND_CONTACT_EMAIL}`} className="auth-mini-footer__link auth-mini-footer__email">
          <FiMail className="h-3.5 w-3.5 shrink-0" />
          {BRAND_CONTACT_EMAIL}
        </a>
      </div>
      <p className="auth-mini-footer__copy">© {new Date().getFullYear()} {BRAND_NAME}</p>
    </footer>
  )
}
