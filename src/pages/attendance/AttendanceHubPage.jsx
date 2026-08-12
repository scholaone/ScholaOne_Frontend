import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiBarChart2,
  FiClipboard,
  FiSettings,
  FiDownload,
  FiSearch,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PageLoader, TableSkeleton } from '@/components/ui/Feedback'
import { attendanceService } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import { cn, downloadBlob, formatDateTime } from '@/utils/format'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const STATUS_TONE = {
  present: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  absent: 'bg-rose-50 text-rose-700 ring-rose-200',
  late: 'bg-amber-50 text-amber-700 ring-amber-200',
  half_day: 'bg-orange-50 text-orange-700 ring-orange-200',
  leave: 'bg-sky-50 text-sky-700 ring-sky-200',
  medical_leave: 'bg-sky-50 text-sky-700 ring-sky-200',
}

function StatusChip({ status, label }) {
  const key = String(status || '').toLowerCase()
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        STATUS_TONE[key] || 'bg-slate-100 text-slate-700 ring-slate-200',
      )}
    >
      {label || status || '—'}
    </span>
  )
}

function ReportTable({ columns, rows, emptyMessage, loading, getRowKey }) {
  if (loading) return <TableSkeleton rows={6} cols={columns.length} />

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-sm">
        <thead>
          <tr className="border-b border-border bg-slate-50/80 text-left text-xs uppercase tracking-wide text-muted">
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3 font-semibold', col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={getRowKey(row, index)} className="hover:bg-muted/10">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 align-top text-text', col.className)}>
                    {col.render ? col.render(row, index) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

const QUICK_LINKS = [
  { to: '/attendance/mark', label: 'Mark Attendance', icon: FiClipboard, desc: 'Class-wise daily register' },
  { to: '/attendance/reports', label: 'Daily Reports', icon: FiBarChart2, desc: 'Registers & percentages' },
  { to: '/students', label: 'Students', icon: FiUsers, desc: 'SIS identity SoT' },
  { to: '/staff', label: 'HRMS Employees', icon: FiUserCheck, desc: 'Employee punch & shifts' },
]

export default function AttendanceHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const today = new Date().toISOString().slice(0, 10)
  const [dashDate, setDashDate] = useState(today)

  const dashQuery = useQuery({
    queryKey: ['attendance-dashboard', schoolId, dashDate],
    queryFn: () => attendanceService.dashboard({
      ...(schoolId ? { school: schoolId } : {}),
      date: dashDate,
    }),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Engine"
        description="Reusable platform for student, teacher & employee attendance — not timetable, leave, or payroll"
        actions={
          <div className="flex flex-wrap gap-2">
            <Input type="date" value={dashDate} onChange={(e) => setDashDate(e.target.value)} />
            <Link to="/attendance/mark">
              <Button variant="primary"><FiClipboard className="h-4 w-4" /> Mark class attendance</Button>
            </Link>
            <Button
              variant="excel"
              onClick={async () => {
                const blob = await attendanceService.export(schoolId ? { school: schoolId } : {})
                downloadBlob(blob, 'attendance-export.csv')
                toast.success('Export downloaded')
              }}
            >
              <FiDownload className="h-4 w-4" /> Export
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Marked Today" value={String(dash.total_marked ?? dash.total ?? '—')} icon={FiCalendar} />
        <StatCard title="Present" value={String(dash.present ?? '—')} icon={FiUserCheck} color="success" />
        <StatCard title="Absent" value={String(dash.absent ?? '—')} icon={FiUsers} color="warning" />
        <StatCard title="Rate %" value={dash.attendance_rate != null ? String(dash.attendance_rate) : (dash.attendance_percent != null ? String(dash.attendance_percent) : '—')} icon={FiBarChart2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Late" value={String(dash.late ?? '—')} icon={FiSettings} />
        <StatCard title="Calendar" value={String(dash.day_calendar ?? dash.day_status ?? '—')} icon={FiCalendar} />
        {Object.entries(dash.by_subject_type || {}).slice(0, 2).map(([k, v]) => (
          <StatCard key={k} title={k} value={String(v)} icon={FiUsers} />
        ))}
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Quick links</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-xl border border-border p-4 transition hover:border-primary/40 hover:bg-muted/40"
            >
              <item.icon className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted">{item.desc}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function AttendanceReportsPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [registerSearch, setRegisterSearch] = useState('')
  const [defaulterSearch, setDefaulterSearch] = useState('')
  const [activeTab, setActiveTab] = useState('register')

  const reportQuery = useQuery({
    queryKey: ['attendance-daily-report', schoolId, date],
    queryFn: () => attendanceService.reportDaily({
      ...(schoolId ? { school: schoolId } : {}),
      date,
    }),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const defaultersQuery = useQuery({
    queryKey: ['attendance-defaulters', schoolId],
    queryFn: () => attendanceService.defaulters(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const report = unwrap(reportQuery.data)
  const summary = report.summary || {}
  const registerRows = report.results || []
  const defaulters = unwrap(defaultersQuery.data)?.results || []

  const filteredRegisterRows = useMemo(() => {
    const q = registerSearch.trim().toLowerCase()
    if (!q) return registerRows
    return registerRows.filter((row) => {
      const haystack = [
        row.subject_type,
        row.status,
        row.status_display,
        row.class_section_name,
        row.subject_name,
        row.external_label,
        row.remarks,
        row.mode,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [registerRows, registerSearch])

  const filteredDefaulters = useMemo(() => {
    const q = defaulterSearch.trim().toLowerCase()
    if (!q) return defaulters
    return defaulters.filter((row) => {
      const haystack = [row.name, row.label, row.subject_type].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [defaulters, defaulterSearch])

  const registerColumns = [
    {
      key: 'index',
      label: '#',
      className: 'w-12',
      render: (_row, index) => index + 1,
    },
    {
      key: 'subject_type',
      label: 'Type',
      render: (row) => <span className="capitalize">{row.subject_type || '—'}</span>,
    },
    {
      key: 'class_section_name',
      label: 'Class / Section',
      render: (row) => row.class_section_name || '—',
    },
    {
      key: 'subject_name',
      label: 'Subject',
      render: (row) => row.subject_name || '—',
    },
    {
      key: 'period_number',
      label: 'Period',
      render: (row) => row.period_number ?? '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusChip status={row.status} label={row.status_display || row.status} />,
    },
    {
      key: 'mode',
      label: 'Mode',
      render: (row) => row.mode || '—',
    },
    {
      key: 'check_in',
      label: 'Check in / out',
      render: (row) => {
        if (!row.check_in && !row.check_out) return '—'
        return (
          <span className="whitespace-nowrap text-xs">
            {row.check_in ? formatDateTime(row.check_in) : '—'}
            {row.check_out ? ` → ${formatDateTime(row.check_out)}` : ''}
          </span>
        )
      },
    },
    {
      key: 'external_label',
      label: 'Person / Ref',
      render: (row) => row.external_label || row.external_ref_id || '—',
    },
    {
      key: 'remarks',
      label: 'Remarks',
      className: 'max-w-[220px]',
      render: (row) => <span className="break-words">{row.remarks || '—'}</span>,
    },
    {
      key: 'is_approved',
      label: 'Approved',
      render: (row) => (row.is_approved ? 'Yes' : 'No'),
    },
  ]

  const defaulterColumns = [
    {
      key: 'index',
      label: '#',
      className: 'w-12',
      render: (_row, index) => index + 1,
    },
    {
      key: 'label',
      label: 'ID',
      render: (row) => row.label || '—',
    },
    {
      key: 'name',
      label: 'Name',
      render: (row) => <span className="font-medium">{row.name || '—'}</span>,
    },
    {
      key: 'subject_type',
      label: 'Type',
      render: (row) => <span className="capitalize">{row.subject_type || '—'}</span>,
    },
    {
      key: 'attendance_percent',
      label: 'Attendance %',
      render: (row) => (
        <span className="font-semibold text-rose-600">{row.attendance_percent ?? '—'}%</span>
      ),
    },
    {
      key: 'present_count',
      label: 'Present',
      render: (row) => row.present_count ?? '—',
    },
    {
      key: 'absent_count',
      label: 'Absent',
      render: (row) => row.absent_count ?? '—',
    },
    {
      key: 'working_days',
      label: 'Working days',
      render: (row) => row.working_days ?? '—',
    },
    {
      key: 'threshold',
      label: 'Threshold',
      render: (row) => (row.threshold != null ? `${row.threshold}%` : '—'),
    },
  ]

  const isInitialLoading =
    (reportQuery.isLoading && !registerRows.length) || (defaultersQuery.isLoading && !defaulters.length)

  if (isInitialLoading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Reports"
        description="Daily registers, percentages & defaulters"
        actions={
          <>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Link to="/attendance">
              <Button variant="outline">Hub</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Marked" value={String(summary.total_marked ?? summary.total ?? '—')} icon={FiCalendar} />
        <StatCard title="Present" value={String(summary.present ?? '—')} icon={FiUserCheck} color="success" />
        <StatCard title="Absent" value={String(summary.absent ?? '—')} icon={FiUsers} color="warning" />
        <StatCard
          title="Rate %"
          value={
            summary.attendance_rate != null
              ? String(summary.attendance_rate)
              : summary.attendance_percent != null
                ? String(summary.attendance_percent)
                : '—'
          }
          icon={FiBarChart2}
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap gap-2 border-b border-border bg-slate-50/60 px-4 py-3">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition',
              activeTab === 'register'
                ? 'bg-white text-text shadow-sm ring-1 ring-border'
                : 'text-muted hover:bg-white/70',
            )}
          >
            Daily register ({filteredRegisterRows.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('defaulters')}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition',
              activeTab === 'defaulters'
                ? 'bg-white text-text shadow-sm ring-1 ring-border'
                : 'text-muted hover:bg-white/70',
            )}
          >
            Defaulters ({filteredDefaulters.length})
          </button>
        </div>

        {activeTab === 'register' ? (
          <>
            <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text">Daily register — {date}</h3>
                <p className="text-xs text-muted">
                  {registerRows.length} record{registerRows.length === 1 ? '' : 's'} for selected date
                </p>
              </div>
              <div className="relative min-w-0 sm:max-w-xs sm:flex-1 sm:justify-end">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={registerSearch}
                  onChange={(e) => setRegisterSearch(e.target.value)}
                  placeholder="Search register..."
                  className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <ReportTable
              columns={registerColumns}
              rows={filteredRegisterRows}
              loading={reportQuery.isFetching && !registerRows.length}
              emptyMessage="No attendance records found for this date."
              getRowKey={(row) => row.record_id || `${row.attendance_date}-${row.external_ref_id}-${row.status}`}
            />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text">Low attendance (defaulters)</h3>
                <p className="text-xs text-muted">Students below the configured attendance threshold</p>
              </div>
              <div className="relative min-w-0 sm:max-w-xs sm:flex-1 sm:justify-end">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={defaulterSearch}
                  onChange={(e) => setDefaulterSearch(e.target.value)}
                  placeholder="Search defaulters..."
                  className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <ReportTable
              columns={defaulterColumns}
              rows={filteredDefaulters}
              loading={defaultersQuery.isFetching && !defaulters.length}
              emptyMessage="No defaulters in range."
              getRowKey={(row) => row.id || row.label || row.name}
            />
          </>
        )}
      </Card>
    </div>
  )
}
