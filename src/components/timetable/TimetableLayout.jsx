import { Link, useLocation } from 'react-router-dom'
import {
  FiCalendar,
  FiClock,
  FiAlertTriangle,
  FiLayers,
  FiRefreshCw,
  FiCpu,
  FiBookOpen,
  FiUsers,
  FiFileText,
} from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
import {
  MAPPING_COLUMN_STACK,
  MAPPING_COLUMNS_GRID,
} from '@/components/academics/TeacherMappingPicker'
import { ScopeFilterCard } from '@/components/academics/MappingFormLayout'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { SelectField } from '@/components/ui/Input'

const NAV_ITEMS = [
  { to: '/timetable', label: 'Overview', icon: FiCalendar, exact: true },
  { to: '/timetable/manual', label: 'Manual Creator', icon: FiLayers },
  { to: '/timetable/ai-generator', label: 'AI Generator', icon: FiCpu },
  { to: '/timetable/substitutions', label: 'Substitutions', icon: FiRefreshCw },
]

export function TimetableNav() {
  const { pathname } = useLocation()

  return (
    <nav className="flex flex-wrap gap-2">
      {NAV_ITEMS.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to)
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition',
              active
                ? 'border-primary/30 bg-primary/10 text-primary shadow-sm'
                : 'border-border bg-card text-muted hover:border-primary/20 hover:text-text',
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function TimetableStatsRow({ stats = {} }) {
  const items = [
    { label: 'Timetable sets', value: stats.timetable_sets ?? '—', icon: FiCalendar },
    { label: 'Published', value: stats.published_versions ?? '—', icon: FiClock, tone: 'success' },
    { label: 'Drafts', value: stats.draft_versions ?? '—', icon: FiLayers },
    { label: 'Open conflicts', value: stats.open_conflicts ?? '—', icon: FiAlertTriangle, tone: 'warning' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
        >
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              item.tone === 'success' && 'bg-emerald-50 text-emerald-600',
              item.tone === 'warning' && 'bg-amber-50 text-amber-600',
              !item.tone && 'bg-primary/10 text-primary',
            )}
          >
            <item.icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{item.label}</p>
            <p className="text-xl font-semibold text-text">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const VIEW_TABS = [
  { key: 'class', label: 'Class', icon: FiBookOpen },
  { key: 'teacher', label: 'Teacher', icon: FiUsers },
  { key: 'exam', label: 'Exam', icon: FiFileText },
]

export function TimetableViewTabs({ activeTab, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border px-4 pt-3 sm:px-6">
      {VIEW_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            'inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition -mb-px',
            activeTab === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-text',
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function TimetableContentCard({ children, tabs, activeTab, onTabChange }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {tabs ? <TimetableViewTabs activeTab={activeTab} onChange={onTabChange} /> : null}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  )
}

/** Compact filter bar for view panels (class / teacher / exam). */
export function TimetableViewFilters({
  schoolId,
  setSchoolId,
  schoolOptions,
  selectedSchoolLabel,
  schoolLocked,
  yearId,
  setYearId,
  yearOptions,
  yearsLoading,
  secondaryField,
  statusBadge,
}) {
  return (
    <ScopeFilterCard>
      <div className={MAPPING_COLUMNS_GRID}>
        <div className={MAPPING_COLUMN_STACK}>
          <SchoolScopeField
            schoolId={schoolId}
            setSchoolId={setSchoolId}
            schoolOptions={schoolOptions}
            selectedSchoolLabel={selectedSchoolLabel}
            schoolLocked={schoolLocked}
          />
          <SelectField
            label="Academic year"
            required
            value={yearId}
            onChange={(e) => setYearId(e.target.value)}
            options={yearOptions}
            placeholder={yearsLoading ? 'Loading years...' : 'Select year...'}
            disabled={yearsLoading || !schoolId}
          />
        </div>
        <div className={MAPPING_COLUMN_STACK}>
          {secondaryField}
          {statusBadge ? (
            <div className="flex items-end pb-1">{statusBadge}</div>
          ) : null}
        </div>
      </div>
    </ScopeFilterCard>
  )
}

export function TimetableStatusBadge({ label, variant = 'default' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        variant === 'success' && 'bg-emerald-50 text-emerald-700',
        variant === 'warning' && 'bg-amber-50 text-amber-800',
        variant === 'default' && 'bg-muted text-muted-foreground',
      )}
    >
      {label}
    </span>
  )
}

export function TimetableEmptyState({ icon: Icon = FiCalendar, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-14 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="text-base font-semibold text-text">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function TimetableGridSection({ title, subtitle, actions, children }) {
  return (
    <div className="space-y-4">
      {(title || actions) ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-base font-semibold text-text">{title}</h3> : null}
            {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export function TimetablePageShell({ title, description, actions, children }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} actions={actions} />
      <TimetableNav />
      {children}
    </div>
  )
}

export function TimetableSectionChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
        selected
          ? 'border-primary bg-primary text-white shadow-sm'
          : 'border-border bg-card text-muted hover:border-primary/30 hover:text-text',
      )}
    >
      {label}
    </button>
  )
}

export function TimetableActionCard({ to, icon: Icon, title, description, accent = 'primary' }) {
  return (
    <Link
      to={to}
      className="group block rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
    >
      <span
        className={cn(
          'mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition group-hover:scale-105',
          accent === 'primary' && 'bg-primary/10 text-primary',
          accent === 'violet' && 'bg-violet-50 text-violet-600',
          accent === 'amber' && 'bg-amber-50 text-amber-600',
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-semibold text-text">{title}</h3>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </Link>
  )
}
