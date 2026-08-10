import { motion } from 'framer-motion'
import {
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCheckSquare,
  FiVideo,
  FiZap,
} from 'react-icons/fi'
import { FEATURES } from '../content'

const ICONS = {
  courses: FiBookOpen,
  classroom: FiVideo,
  assessment: FiCheckSquare,
  progress: FiBarChart2,
  certificate: FiAward,
  ai: FiZap,
}

export default function FeaturesSection() {
  return (
    <section id="features" className="landing-section-glass relative w-full py-24 sm:py-32">
      <div className="landing-wrap">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl"
        >
          <span className="landing-tag">LMS capabilities</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight landing-text-primary sm:text-4xl lg:text-5xl xl:text-6xl">
            Everything to deliver, measure &{' '}
            <span className="landing-gradient-text">scale learning</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg font-semibold landing-text-muted">
            From course authoring to certificates — a complete ScholaOne LMS layered on institutional-grade admin.
          </p>
        </motion.div>

        <div className="mt-16 grid w-full auto-rows-[minmax(200px,auto)] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const Icon = ICONS[feature.icon] || FiBookOpen
            const isLarge = feature.span === 'large'

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.06, duration: 0.5 }}
                className={`landing-card group relative overflow-hidden p-8 ${
                  isLarge ? 'xl:col-span-2' : ''
                }`}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#3b82f6]/08 opacity-60 transition group-hover:scale-125" />

                <span className="landing-tag">{feature.highlight}</span>

                <div className="landing-icon-box-filled relative mt-6 p-4">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className={`relative mt-5 font-extrabold landing-text-primary ${isLarge ? 'text-2xl' : 'text-xl'}`}>
                  {feature.title}
                </h3>
                <p className={`relative mt-3 font-semibold leading-relaxed landing-text-muted ${isLarge ? 'max-w-lg text-base' : 'text-sm'}`}>
                  {feature.description}
                </p>

                {isLarge && feature.icon === 'courses' && (
                  <div className="relative mt-8 grid grid-cols-3 gap-3">
                    {['Modules', 'Lessons', 'Media'].map((label) => (
                      <div key={label} className="landing-course-card p-3 text-center">
                        <p className="text-lg font-extrabold landing-text-accent">✓</p>
                        <p className="text-[10px] font-bold landing-text-muted">{label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {isLarge && feature.icon === 'ai' && (
                  <div className="relative mt-8 flex flex-wrap gap-2">
                    {['Study plans', 'Q&A', 'Summaries', 'Automations'].map((tag) => (
                      <span key={tag} className="landing-tag normal-case tracking-normal">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
