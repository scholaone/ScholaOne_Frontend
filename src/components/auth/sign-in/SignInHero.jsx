import { motion } from 'framer-motion'
import { BRAND_NAME, BRAND_TAGLINE } from '@/config/brand'

export default function SignInHero() {
  return (
    <div className="auth-brand-panel">
      <div className="auth-brand-orbs" aria-hidden>
        <span className="auth-brand-orb auth-brand-orb--1" />
        <span className="auth-brand-orb auth-brand-orb--2" />
        <span className="auth-brand-orb auth-brand-orb--3" />
        <span className="auth-brand-orb auth-brand-orb--4" />
      </div>

      <motion.div
        className="auth-brand-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <p className="auth-brand-kicker">Welcome</p>
        <h1 className="auth-brand-title">{BRAND_NAME}</h1>
        <p className="auth-brand-tagline">{BRAND_TAGLINE}</p>
        <p className="auth-brand-copy">
          Sign in to access courses, live classes, assessments, and your personalized learning dashboard.
        </p>
   
      </motion.div>
    </div>
  )
}
