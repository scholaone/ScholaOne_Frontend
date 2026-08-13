import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiTrendingUp,
  FiUsers,
  FiBook,
  FiBriefcase,
  FiClipboard,
  FiLayers,
  FiArrowRight,
  FiFileText,
  FiActivity,
  FiBarChart2,
} from 'react-icons/fi'
import { formatNumber } from '@/utils/format'
import { formatDashboardDate, getDisplayName, getTimeGreeting } from '@/utils/greeting'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { resolveActionIcon } from '@/utils/dashboardIcons'

export function ClayStatSkeletonGrid({ count = 4 }) {
  return (
    <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="mt-4 h-9 w-20 rounded bg-muted" />
        </Card>
      ))}
    </div>
  )
}

export function ClayInsightBanner({ userName, message }) {
  const { text: greeting, period, emoji } = getTimeGreeting()
  const displayName = getDisplayName(userName)
  const dates = formatDashboardDate()

  return (
    <Card className="mb-0 overflow-hidden border-border/70 bg-gradient-to-br from-brand-50/90 via-white to-emerald-50/40 p-0">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl shadow-sm ring-1',
              period === 'morning' && 'bg-amber-50 text-amber-700 ring-amber-100',
              period === 'afternoon' && 'bg-sky-50 text-sky-700 ring-sky-100',
              period === 'evening' && 'bg-indigo-50 text-indigo-700 ring-indigo-100',
            )}
            aria-hidden
          >
            {emoji}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{greeting}</p>
            <h2 className="mt-1 break-words text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {displayName}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {message || 'Here is your analytics overview for today.'}
            </p>
          </div>
        </div>
        <div className="shrink-0 rounded-xl bg-white/70 px-4 py-3 text-right ring-1 ring-border/60 backdrop-blur-sm">
          <p className="text-sm font-semibold text-foreground">{dates.weekday}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{dates.full}</p>
        </div>
      </div>
    </Card>
  )
}

export function DashboardWelcomeHeader({ userName, subtitle, fallbackName = 'there' }) {
  const { text: greeting, period, emoji } = getTimeGreeting()
  const displayName = getDisplayName(userName, fallbackName)
  const dates = formatDashboardDate()

  return (
    <header className="teacher-dash__welcome">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <div
          className={cn(
            'teacher-dash__greeting-badge',
            period === 'morning' && 'teacher-dash__greeting-badge--morning',
            period === 'afternoon' && 'teacher-dash__greeting-badge--afternoon',
            period === 'evening' && 'teacher-dash__greeting-badge--evening',
          )}
          aria-hidden
        >
          {emoji}
        </div>
        <div className="min-w-0">
          <p className="teacher-dash__greeting-label">{greeting}</p>
          <h1 className="break-words">{displayName}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="teacher-dash__date-chip">
        <p className="teacher-dash__date-weekday">{dates.weekday}</p>
        <p className="teacher-dash__date-short">{dates.short}</p>
      </div>
    </header>
  )
}

/** @deprecated Use ClayInsightBanner */
export function ClayWelcomeHero({ userName, message }) {
  return <ClayInsightBanner userName={userName} message={message} />
}

export function ClayStatGrid({ stats = [], loading = false }) {
  if (loading) return <ClayStatSkeletonGrid count={stats.length || 4} />

  return (
    <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <motion.div key={stat.title} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover className="w-full min-w-0 max-w-full">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-2">
                  <p className="truncate text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="break-words text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  {stat.trend ? (
                    <p className="flex items-center gap-1 text-xs font-medium text-success">
                      <FiTrendingUp className="h-3.5 w-3.5" />
                      {stat.trend}
                    </p>
                  ) : null}
                  {stat.hint ? <p className="text-xs text-muted-foreground">{stat.hint}</p> : null}
                </div>
                {Icon ? (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </div>
                ) : null}
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

export function ClayQuickGrid({ actions = [] }) {
  return (
    <div className="clay-app lms-grid-quick mb-5">
      {actions.slice(0, 12).map((action, i) => {
        const Icon = resolveActionIcon(action)
        return (
          <motion.div
            key={action.key || action.path}
            className="min-w-0"
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
          >
            <Link
              to={action.path}
              className="clay-card clay-card-white flex h-full min-w-0 flex-col items-center gap-2 p-3.5 text-center"
            >
              <div className="clay-icon-3d flex h-10 w-10 items-center justify-center text-[var(--clay-primary)]">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <span className="text-[11px] font-semibold leading-tight text-[var(--clay-text-sharp)]">{action.label}</span>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}

export function ClayRecentList({ title, items = [], emptyMessage }) {
  return (
    <div className="clay-app clay-card clay-card-white clay-chart-panel h-full p-5">
      <h3 className="chart-panel-title mb-3 flex items-center">
        <span className="chart-panel-accent" aria-hidden />
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--clay-primary-soft)]">{emptyMessage || 'No data found'}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 8).map((item) => {
            const Icon = item.icon || FiActivity
            return (
              <div key={item.id} className="clay-list-item clay-list-item-3d flex items-center gap-3 p-3">
                <div className="clay-icon-3d flex h-9 w-9 shrink-0 items-center justify-center text-[var(--clay-primary)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--clay-text-sharp)]">{item.title}</p>
                  <p className="truncate text-xs text-[var(--clay-primary-soft)]">{item.subtitle}</p>
                </div>
                {item.path ? (
                  <Link
                    to={item.path}
                    className="clay-action-btn flex h-8 w-8 items-center justify-center"
                    title="View"
                  >
                    <FiArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ClayAnalyticsSection({ title, children }) {
  return (
    <section className="clay-app clay-analytics-3d mb-5">
      <div className="mb-3 flex items-center gap-2">
        <FiBarChart2 className="h-4 w-4 text-[var(--lms-chart-primary)]" />
        <span className="chart-panel-accent" aria-hidden />
        <h2 className="text-sm font-bold text-[var(--clay-text-sharp)]">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export function ClayChartSkeletonGrid() {
  return (
    <div className="lms-grid-charts">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="clay-app clay-card clay-chart-panel h-[320px] animate-pulse p-5">
          <div className="mb-4 h-4 w-32 rounded bg-muted" />
          <div className="h-[220px] rounded-xl bg-muted/70" />
        </div>
      ))}
    </div>
  )
}

export function formatStatValue(value) {
  if (value == null || value === '—') return '—'
  if (typeof value === 'number') return formatNumber(value)
  return String(value)
}

export function mapGrowthChart(charts) {
  const registrations = charts?.monthly_registrations || []
  if (registrations.length) {
    return registrations.map((row) => ({
      label: row.month,
      value: row.users ?? row.schools ?? 0,
    }))
  }
  const userGrowth = charts?.user_growth || []
  return userGrowth.map((row) => ({ label: row.month, value: row.count ?? 0 }))
}

export function mapDistribution(charts) {
  const dist = charts?.user_distribution
  if (!dist) return []
  if (Array.isArray(dist)) {
    return dist.map((d) => ({ label: d.label || d.name, value: d.value || d.count || 0 }))
  }
  return Object.entries(dist).map(([label, value]) => ({
    label: label.replace(/_/g, ' '),
    value: typeof value === 'number' ? value : 0,
  }))
}

export function mapSchoolEnrollment(statistics = {}) {
  return [
    { label: 'Students', value: statistics.total_students ?? 0 },
    { label: 'Teachers', value: statistics.total_teachers ?? 0 },
    { label: 'Staff', value: statistics.total_staff ?? 0 },
    { label: 'Parents', value: statistics.total_parents ?? 0 },
  ].filter((d) => d.value > 0)
}

export { FiUsers, FiBook, FiBriefcase, FiClipboard, FiLayers, FiFileText }
