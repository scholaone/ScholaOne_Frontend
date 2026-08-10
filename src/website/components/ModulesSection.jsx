import { motion } from 'framer-motion'
import { BRAND_AI_NAME, BRAND_MAIL_NAME } from '@/config/brand'
import { MODULES } from '../content'

const HIGHLIGHTS = [
  {
    title: 'Course-first navigation',
    desc: 'Learners land on enrolled courses; educators jump straight to authoring and grading.',
    icon: '📚',
  },
  {
    title: 'Live + async learning',
    desc: 'Blend recorded lessons, live virtual classes, and self-paced modules seamlessly.',
    icon: '🎥',
  },
  {
    title: 'AI study companion',
    desc: `${BRAND_AI_NAME} tutors learners, assists educators, and automates admin workflows.`,
    icon: '✨',
  },
]

export default function ModulesSection() {
  return (
    <section id="modules" className="landing-section-glass landing-band-light relative w-full py-24 sm:py-32">
      <div className="landing-wrap">
        <div className="grid w-full items-start gap-16 xl:grid-cols-2 xl:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="landing-tag">Complete module suite</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight landing-text-primary sm:text-4xl lg:text-5xl xl:text-6xl">
              LMS + admin —{' '}
              <span className="landing-gradient-text">beautifully unified</span>
            </h2>
            <p className="mt-5 max-w-xl text-lg font-semibold landing-text-muted">
              Every module follows ScholaOne patterns: search, export, smart forms, and role-aware access.
            </p>

            <div className="mt-10 space-y-4">
              {HIGHLIGHTS.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="landing-card flex w-full gap-4 p-5"
                >
                  <span className="landing-icon-box flex h-12 w-12 shrink-0 items-center justify-center text-xl">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold landing-text-primary lg:text-base">{item.title}</p>
                    <p className="mt-1 text-sm font-semibold landing-text-muted">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="landing-glass w-full rounded-3xl p-8 lg:p-10"
          >
            <p className="text-xs font-extrabold uppercase tracking-wider landing-text-muted">All LMS & admin modules</p>
            <div className="mt-6 flex w-full flex-wrap gap-2.5">
              {MODULES.map((name, i) => (
                <motion.span
                  key={name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                  className="landing-pill"
                >
                  {name}
                </motion.span>
              ))}
            </div>

            <div className="landing-glass-dark mt-8 w-full rounded-2xl p-6 lg:p-8">
              <p className="text-xs font-extrabold uppercase tracking-wider landing-text-muted">Institutional backbone</p>
              <p className="mt-3 text-sm font-semibold leading-relaxed landing-text-muted lg:text-base">
                Multi-tenant <strong className="landing-text-primary">organizations & schools</strong>, granular{' '}
                <strong className="landing-text-primary">roles & permissions</strong>, master data, audit logs, and{' '}
                <strong className="landing-text-primary">{BRAND_MAIL_NAME}</strong> — the ERP layer your LMS runs on.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
