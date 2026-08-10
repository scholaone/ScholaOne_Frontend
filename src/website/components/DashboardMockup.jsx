import { motion } from 'framer-motion'
import { FiAward, FiBarChart2, FiBookOpen, FiGrid, FiUsers, FiVideo, FiZap } from 'react-icons/fi'

const SIDEBAR = [
  { icon: FiGrid, label: 'Home', active: false },
  { icon: FiBookOpen, label: 'Courses', active: true },
  { icon: FiVideo, label: 'Live', active: false },
  { icon: FiUsers, label: 'Learners', active: false },
  { icon: FiZap, label: 'AI', active: false },
]

const COURSES = [
  { name: 'Mathematics XII', progress: 78, students: 142 },
  { name: 'English Lit.', progress: 92, students: 98 },
  { name: 'CS Fundamentals', progress: 65, students: 210 },
]

export default function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="landing-float-slow relative w-full"
    >
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-sky-400/25 via-indigo-400/20 to-violet-400/25 blur-3xl sm:-inset-8" />

      <div className="landing-glass relative w-full overflow-hidden rounded-2xl border border-[var(--lp-glass-border)] shadow-2xl shadow-blue-500/10 xl:rounded-3xl">
        <div className="flex items-center gap-2 border-b border-slate-200/60 bg-slate-50/90 px-5 py-3.5">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400/90" />
            <span className="h-3 w-3 rounded-full bg-amber-400/90" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
          </div>
          <div className="mx-auto flex h-8 flex-1 max-w-md items-center justify-center rounded-lg border border-slate-200 bg-white/90 px-4 text-[11px] font-bold text-slate-500">
            learn.scholaone.in/courses
          </div>
        </div>

        <div className="flex min-h-[360px] bg-white/95 sm:min-h-[400px]">
          <div className="hidden w-20 shrink-0 border-r border-slate-200 bg-slate-50/90 p-2.5 sm:block lg:w-24">
            {SIDEBAR.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`mb-1.5 flex flex-col items-center gap-1 rounded-xl px-1 py-3 ${
                    item.active
                      ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-indigo-300/40'
                      : 'text-slate-400'
                  }`}
                >
                  <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="text-[8px] font-bold leading-none lg:text-[9px]">{item.label}</span>
                </div>
              )
            })}
          </div>

          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:text-xs">LMS Dashboard</p>
                <p className="text-base font-extrabold text-slate-900 lg:text-xl">Course overview</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold text-emerald-600 sm:inline">
                  3 live now
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-[10px] font-bold text-white lg:h-10 lg:w-10">
                  EN
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
              {[
                { label: 'Courses', value: '48', icon: FiBookOpen, color: 'from-sky-500 to-cyan-500' },
                { label: 'Learners', value: '2.4k', icon: FiUsers, color: 'from-indigo-500 to-violet-500' },
                { label: 'Certs issued', value: '312', icon: FiAward, color: 'from-emerald-500 to-teal-500' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-bold text-slate-500 lg:text-[10px]">{stat.label}</p>
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <p className={`mt-1 bg-gradient-to-r ${stat.color} bg-clip-text text-xl font-extrabold text-transparent lg:text-2xl`}>
                      {stat.value}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 space-y-2.5 lg:mt-5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 lg:text-xs">Active courses</p>
              {COURSES.map((course) => (
                <div key={course.name} className="landing-course-card flex items-center gap-3 p-3 lg:p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-sky-100 text-indigo-600 lg:h-10 lg:w-10">
                    <FiBookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-extrabold text-slate-800 lg:text-sm">{course.name}</p>
                      <p className="shrink-0 text-[10px] font-bold text-indigo-600">{course.progress}%</p>
                    </div>
                    <div className="landing-progress-bar mt-1.5">
                      <div className="landing-progress-fill" style={{ width: `${course.progress}%` }} />
                    </div>
                    <p className="mt-1 text-[9px] font-semibold text-slate-400">{course.students} learners enrolled</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 hidden rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 lg:block">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-extrabold text-slate-700">Engagement trend</p>
                <FiBarChart2 className="h-4 w-4 text-[#2563eb]" />
              </div>
              <div className="flex h-14 items-end gap-1.5">
                {[45, 70, 55, 85, 60, 95, 75, 100, 68, 90, 82, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md opacity-90"
                    style={{
                      height: `${h}%`,
                      background: `linear-gradient(to top, #1d4ed8, ${['#2563eb', '#0ea5e9', '#16a34a', '#0891b2', '#7c3aed', '#0f766e'][i % 6]})`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        className="landing-float landing-float-delay absolute -right-2 top-16 hidden rounded-2xl border border-[var(--lp-glass-border)] bg-white/95 p-4 shadow-xl sm:block lg:-right-6 xl:-right-10"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <FiZap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900">AI Tutor</p>
            <p className="text-[10px] font-semibold text-slate-500">24 questions answered today</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="landing-float absolute -left-2 bottom-20 hidden rounded-2xl border border-[var(--lp-glass-border)] bg-white/95 p-4 shadow-xl sm:block lg:-left-6 xl:-left-10"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <FiAward className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900">Certificate earned</p>
            <p className="text-[10px] font-semibold text-slate-500">Physics — Grade 12</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
