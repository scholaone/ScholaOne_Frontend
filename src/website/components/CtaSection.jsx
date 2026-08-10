import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiStar } from 'react-icons/fi'
import { BRAND_NAME } from '@/config/brand'

export default function CtaSection({ isAuthenticated }) {
  return (
    <section className="w-full py-20 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="landing-band-dark relative w-full overflow-hidden px-6 py-20 sm:px-12 sm:py-28 lg:px-16"
      >
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#3b82f6]/08 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#00c2ff]/06 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6366f1]/05 blur-3xl" />

        <div className="relative mx-auto max-w-4xl landing-glass-cta px-6 py-14 sm:px-12 sm:py-16 lg:px-16">
          <div className="landing-glass-premium mx-auto flex w-fit items-center gap-1 rounded-full px-5 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <FiStar key={i} className="h-3.5 w-3.5 fill-[#3b82f6] text-[#3b82f6]" />
            ))}
            <span className="ml-2 text-xs font-bold text-[var(--lp-muted)]">Trusted by forward-thinking institutions</span>
          </div>

          <h2 className="mx-auto mt-8 text-center text-3xl font-extrabold text-[var(--lp-text)] sm:text-4xl lg:text-5xl xl:text-6xl">
            Ready to deliver an extraordinary learning experience with {BRAND_NAME}?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-base font-semibold text-[var(--lp-muted)] lg:text-lg">
            Sign in to explore the full LMS — courses, live classes, assessments, progress tracking, AI tutor, and institutional admin.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="landing-btn-primary inline-flex items-center gap-2 rounded-2xl px-12 py-4 text-base font-extrabold text-white"
            >
              {isAuthenticated ? 'Open LMS Dashboard' : `Sign in to ${BRAND_NAME} LMS`}
              <FiArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="landing-btn-outline inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-base font-extrabold"
            >
              Explore features
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
