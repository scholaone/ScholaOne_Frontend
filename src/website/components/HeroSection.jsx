import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiPlay, FiShield } from 'react-icons/fi'
import { HERO_POINTS, WEBSITE } from '../content'
import AnimatedInfinityHero from './AnimatedInfinityHero'

export default function HeroSection({ isAuthenticated }) {
  return (
    <section className="landing-hero-bleed landing-mesh relative w-full">
      <div className="pointer-events-none absolute left-0 top-16 h-[420px] w-[420px] -translate-x-1/3 rounded-full bg-[#22d3ee]/15 blur-[100px]" />
      <div className="pointer-events-none absolute right-0 top-24 h-[480px] w-[480px] translate-x-1/4 rounded-full bg-[#3b82f6]/12 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#34d399]/08 blur-[100px]" />

      <div className="landing-wrap relative">
        <div className="landing-hero-grid">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="landing-hero-grid__content landing-toxic-panel"
          >
            <div className="landing-toxic-badge">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22d3ee] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#06b6d4]" />
              </span>
              {WEBSITE.tagline}
            </div>

            <h1 className="relative z-[1] mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight landing-text-primary sm:text-4xl lg:text-5xl xl:text-[3.25rem]">
              <span className="landing-gradient-text">{WEBSITE.name}</span>{' '}
              for modern education
            </h1>

            <p className="relative z-[1] mt-4 max-w-xl text-base font-semibold leading-relaxed landing-text-muted lg:text-lg">
              {WEBSITE.description}
            </p>

            <ul className="relative z-[1] mt-5 grid gap-2">
              {HERO_POINTS.map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                  className="landing-toxic-check"
                >
                  <span className="landing-icon-box-filled flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-extrabold shadow-[0_0_16px_rgba(34,211,238,0.4)]">
                    ✓
                  </span>
                  <span className="text-sm font-bold landing-text-primary">{point}</span>
                </motion.li>
              ))}
            </ul>

            <div className="relative z-[1] mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="landing-btn-toxic inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-extrabold text-white sm:text-base"
              >
                {isAuthenticated ? 'Open Dashboard' : 'Start learning — Sign in'}
                <FiArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="landing-btn-outline inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-extrabold sm:text-base"
              >
                <FiPlay className="h-4 w-4 landing-text-accent" />
                See how it works
              </a>
            </div>

            <div className="landing-toxic-trust relative z-[1] mt-auto">
              <span className="flex items-center gap-2">
                <FiShield className="h-4 w-4 text-[#06b6d4]" />
                Enterprise-grade security
              </span>
              <span className="hidden h-4 w-px bg-[var(--lp-border)] sm:block" />
              <span>Multi-school · Role-based · AI-powered</span>
            </div>
          </motion.div>

          <div className="landing-hero-grid__visual landing-toxic-panel landing-toxic-panel--visual">
            <AnimatedInfinityHero />
          </div>
        </div>
      </div>
    </section>
  )
}
