import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUserPlus,
  FiUsers,
  FiClipboard,
  FiDollarSign,
  FiPercent,
  FiTruck,
  FiHome,
  FiTrendingUp,
  FiTrendingDown,
  FiBell,
  FiCalendar,
  FiBriefcase,
  FiBook,
  FiLayers,
  FiFileText,
  FiSettings,
  FiRefreshCw,
} from 'react-icons/fi'
import { APP_NAME } from '@/config/constants'
import { formatNumber } from '@/utils/format'

const ICON_MAP = {
  staff: FiUsers,
  student: FiUserPlus,
  students: FiUsers,
  teacher: FiUsers,
  attendance: FiClipboard,
  fees: FiDollarSign,
  discount: FiPercent,
  transport: FiTruck,
  boarding: FiHome,
  income: FiTrendingUp,
  expense: FiTrendingDown,
  notice: FiBell,
  admissions: FiFileText,
  organization: FiBriefcase,
  school: FiBook,
  user: FiUsers,
  audit: FiFileText,
  masters: FiLayers,
  settings: FiSettings,
  default: FiCalendar,
}

export const DEFAULT_SCHOOL_QUICK_ACTIONS = [
  { key: 'add-staff', label: 'Add Staff', path: '/staff/new', icon: 'staff' },
  { key: 'add-student', label: 'Add Student', path: '/students/new', icon: 'student' },
  { key: 'admissions', label: 'Admissions', path: '/admissions', icon: 'admissions' },
  { key: 'add-teacher', label: 'Add Teacher', path: '/teachers/new', icon: 'teacher' },
  { key: 'parents', label: 'Add Parent', path: '/parents/new', icon: 'user' },
  { key: 'communications', label: 'Add Notice', path: '/communications/messages/new', icon: 'notice' },
  { key: 'academics', label: 'Classes', path: '/academics', icon: 'school' },
  { key: 'school-masters', label: 'Masters', path: '/school-masters', icon: 'masters' },
  { key: 'school-settings', label: 'Settings', path: '/school-settings', icon: 'settings' },
  { key: 'audit', label: 'Audit Logs', path: '/audit-logs', icon: 'audit' },
  { key: 'students', label: 'Students', path: '/students', icon: 'students' },
  { key: 'staff-list', label: 'Staff List', path: '/staff', icon: 'staff' },
]

export const DEFAULT_PLATFORM_QUICK_ACTIONS = [
  { key: 'org', label: 'Add Organization', path: '/organizations/new', icon: 'organization' },
  { key: 'school', label: 'Add School', path: '/schools/new', icon: 'school' },
  { key: 'user', label: 'Add User', path: '/users/new', icon: 'user' },
  { key: 'roles', label: 'Roles', path: '/roles', icon: 'settings' },
  { key: 'masters', label: 'Masters', path: '/masters', icon: 'masters' },
  { key: 'academics', label: 'Academics', path: '/academics', icon: 'school' },
  { key: 'audit', label: 'Audit Logs', path: '/audit-logs', icon: 'audit' },
  { key: 'settings', label: 'Settings', path: '/settings', icon: 'settings' },
  { key: 'ai-hub', label: 'AI Hub', path: '/ai-hub', icon: 'notice' },
  { key: 'post', label: 'ScholaOne Post', path: '/scholaone-post', icon: 'notice' },
  { key: 'orgs', label: 'Organizations', path: '/organizations', icon: 'organization' },
  { key: 'schools', label: 'Schools', path: '/schools', icon: 'school' },
]

function resolveIcon(action) {
  const key = action.icon || action.key || 'default'
  return ICON_MAP[key] || ICON_MAP.default
}

function brandParts(name = APP_NAME) {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return { first: name, rest: '' }
  return { first: parts[0], rest: parts.slice(1).join(' ') }
}

export function PremiumBrandHeader({ subtitle }) {
  const { first, rest } = brandParts(APP_NAME)

  return (
    <div className="premium-dashboard mb-8 text-center">
      <div className="relative inline-flex items-center justify-center gap-1">
        <h1 className="premium-brand-title text-4xl font-bold text-[#1a3a8a] md:text-5xl">
          {first}
          {rest ? (
            <>
              {' '}
              <span className="text-[#1a3a8a]">{rest}</span>
            </>
          ) : null}
        </h1>
        <svg
          className="absolute -right-7 -top-3 h-8 w-8 text-[#1a3a8a]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 3L1 9l4 2v6c0 2.5 3.5 4 7 4s7-1.5 7-4v-6l4-2L12 3zm0 2.2l6.8 3.4L12 12 5.2 8.6 12 5.2z" />
        </svg>
      </div>
      {subtitle ? <p className="mt-2 text-sm font-medium text-slate-500">{subtitle}</p> : null}
    </div>
  )
}

export function PremiumQuickActions({ actions = [] }) {
  const items = actions.length ? actions : DEFAULT_SCHOOL_QUICK_ACTIONS

  return (
    <div className="premium-dashboard mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
      {items.slice(0, 12).map((action, i) => {
        const Icon = resolveIcon(action)
        const gold = i % 2 === 0
        return (
          <motion.div
            key={action.key || action.path}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              to={action.path}
              className="premium-action-card flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  gold ? 'bg-[#fff8e1] text-[#f5b800]' : 'bg-[#e8eeff] text-[#1a3a8a]'
                }`}
              >
                <Icon className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <span className="text-xs font-semibold leading-tight text-[#1a3a8a]">{action.label}</span>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}

export function PremiumStatRow({ stats = [] }) {
  return (
    <div className="premium-dashboard mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        const gold = i % 2 === 0
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="premium-stat-card flex items-center gap-4 p-5"
          >
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                gold ? 'bg-[#fff8e1] text-[#f5b800]' : 'bg-[#e8eeff] text-[#1a3a8a]'
              }`}
            >
              <Icon className="h-8 w-8" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{stat.title}</p>
              <p className="mt-1 truncate text-2xl font-bold text-[#1a3a8a]">{stat.value}</p>
              {stat.hint ? <p className="mt-0.5 text-[10px] text-slate-400">{stat.hint}</p> : null}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function parseEventDate(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function PremiumCalendar({ events = [], monthOffset = 0 }) {
  const today = new Date()
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDay = new Date(year, month, 1).getDay()

  const eventDays = new Map()
  events.forEach((event, index) => {
    const date = parseEventDate(event.start_date || event.date || event.timestamp)
    if (!date || date.getMonth() !== month || date.getFullYear() !== year) return
    const day = date.getDate()
    if (!eventDays.has(day)) {
      eventDays.set(day, index % 2 === 0 ? 'gold' : 'blue')
    }
  })

  const cells = []
  for (let i = 0; i < startDay; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)

  return (
    <div className="premium-dashboard premium-panel p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1a3a8a]">Calendar</h3>
        <div className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-[#1a3a8a]">
          {MONTHS[month]} {year}
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-slate-400">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, i) => {
          if (day == null) return <div key={`empty-${i}`} />
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const eventType = eventDays.get(day)
          return (
            <div
              key={day}
              className={`premium-calendar-day flex items-center justify-center ${
                isToday
                  ? 'is-today'
                  : eventType === 'gold'
                    ? 'has-event-gold'
                    : eventType === 'blue'
                      ? 'has-event-blue'
                      : 'text-slate-600'
              }`}
            >
              {day}
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#f5b800]" /> Events
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#1a3a8a]" /> Academic
        </span>
      </div>
    </div>
  )
}

export function PremiumNoticeBoard({ notices = [] }) {
  if (!notices.length) {
    return (
      <div className="premium-dashboard premium-panel flex h-full min-h-[320px] flex-col items-center justify-center p-6 text-center">
        <FiBell className="mb-3 h-10 w-10 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">No notices yet</p>
        <p className="mt-1 text-xs text-slate-400">Announcements and events will appear here</p>
      </div>
    )
  }

  return (
    <div className="premium-dashboard flex h-full flex-col gap-4">
      {notices.slice(0, 4).map((notice, i) => {
        const gold = i % 2 === 0
        const date = notice.date || notice.start_date || notice.timestamp
        const parsed = parseEventDate(date)
        const dateLabel = parsed
          ? parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
          : 'Upcoming'

        return (
          <motion.div
            key={notice.id || i}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${
              gold ? 'premium-notice-gold text-[#1a3a8a]' : 'premium-notice-blue'
            }`}
          >
            <div className="relative z-10 max-w-[70%]">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                {notice.type || (gold ? 'Notice' : 'Event')}
              </p>
              <h4 className="mt-1 text-lg font-bold leading-snug">{notice.title}</h4>
              <p className="mt-2 text-sm font-semibold opacity-90">{dateLabel}</p>
              {notice.message || notice.body ? (
                <p className="mt-1 line-clamp-2 text-xs opacity-80">{notice.message || notice.body}</p>
              ) : null}
            </div>
            <div className="pointer-events-none absolute -right-2 bottom-0 opacity-30">
              <svg width="100" height="80" viewBox="0 0 100 80" aria-hidden>
                <circle cx="70" cy="50" r="24" fill="currentColor" />
                <rect x="20" y="30" width="30" height="40" rx="8" fill="currentColor" />
              </svg>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export function PremiumDashboardToolbar({ onRefresh, loading, label = 'Dashboard' }) {
  return (
    <div className="premium-dashboard mb-6 flex items-center justify-between">
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#1a3a8a] shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      ) : null}
    </div>
  )
}

export function buildNotices({ announcements = [], calendarEvents = [], recentAdmissions = [] }) {
  const items = []

  announcements.forEach((item) => {
    items.push({ ...item, type: 'Announcement' })
  })

  calendarEvents.forEach((item) => {
    items.push({
      id: item.id,
      title: item.title,
      date: item.start_date,
      type: item.is_current ? 'Current Term' : 'Academic',
      message: item.school_name,
    })
  })

  recentAdmissions.forEach((item) => {
    items.push({
      id: item.id || item.admission_id,
      title: item.title || item.student_name || 'New Admission',
      date: item.timestamp || item.created_at,
      type: 'Admission',
    })
  })

  return items
}

export function formatStatValue(value) {
  if (value == null || value === '—') return '—'
  if (typeof value === 'number') return formatNumber(value)
  return String(value)
}
