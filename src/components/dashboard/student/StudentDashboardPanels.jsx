import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiClock,
  FiExternalLink,
  FiTrendingUp,
} from 'react-icons/fi'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatNumber } from '@/utils/format'
import { dashboardService } from '@/api/services'
import { unwrapData } from '@/api/client'

const CHART_COLORS = {
  purple: '#634bb1',
  pink: '#f06292',
  blue: '#42a5f5',
  green: '#4caf50',
  yellow: '#ffc107',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const EVENT_BADGE_COLORS = {
  public_holiday: CHART_COLORS.purple,
  school_holiday: CHART_COLORS.pink,
  school_event: CHART_COLORS.yellow,
  weekend: '#9ca3af',
}

function toIsoDate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function resolveDayTone(entries = []) {
  if (!entries.length) return ''
  const types = new Set(entries.map((entry) => entry.type))
  if (types.has('public_holiday')) return 'holiday-public'
  if (types.has('school_holiday')) return 'holiday-school'
  if (types.has('school_event')) return 'event'
  if (types.has('weekend')) return 'weekend'
  return ''
}

function formatDisplayDate(iso) {
  const date = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return '—'
  const parts = String(value).split(':')
  if (parts.length < 2) return value
  const date = new Date()
  date.setHours(Number(parts[0]), Number(parts[1]), 0)
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function formatExamDate(iso) {
  if (!iso) return '—'
  return formatDisplayDate(iso)
}

export function StudentStatCards({ statistics = {}, loading = false }) {
  const cards = [
    {
      key: 'courses',
      label: 'My Courses',
      value: statistics.courses_enrolled ?? 0,
      tone: 'purple',
      icon: FiBookOpen,
    },
    {
      key: 'attendance',
      label: 'Attendance',
      value: statistics.attendance_percent != null ? `${statistics.attendance_percent}%` : '—',
      tone: 'pink',
      icon: FiCheckCircle,
    },
    {
      key: 'tasks',
      label: 'Pending Tasks',
      value: statistics.pending_tasks ?? 0,
      tone: 'yellow',
      icon: FiClipboard,
    },
    {
      key: 'progress',
      label: 'Avg Progress',
      value: `${statistics.avg_progress ?? 0}%`,
      tone: 'green',
      icon: FiTrendingUp,
    },
  ]

  if (loading) {
    return (
      <div className="teacher-dash__stats">
        {cards.map((card) => (
          <div key={card.key} className="teacher-stat-card teacher-stat-card--purple">
            <div className="teacher-skeleton h-11 w-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="teacher-skeleton h-3 w-16" />
              <div className="teacher-skeleton h-7 w-12" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="teacher-dash__stats">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.key} className={`teacher-stat-card teacher-stat-card--${card.tone}`}>
            <div className="teacher-stat-card__icon">
              <Icon aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="teacher-stat-card__label">{card.label}</p>
              <p className="teacher-stat-card__value">{typeof card.value === 'number' ? formatNumber(card.value) : card.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function StudentAttendanceChartPanel({ data = [], loading = false }) {
  const chartData = useMemo(
    () =>
      (data || []).map((row) => ({
        ...row,
        name: row.label || row.month,
      })),
    [data],
  )

  return (
    <div className="teacher-panel">
      <div className="teacher-panel__head">
        <div>
          <h2 className="teacher-panel__title">Monthly Attendance</h2>
          <p className="text-xs text-[var(--td-muted)]">Present vs absent — last 6 months</p>
        </div>
      </div>

      {loading ? (
        <div className="teacher-skeleton h-56 w-full rounded-xl" />
      ) : chartData.length ? (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(value, name) => [value, name === 'present' ? 'Present' : 'Absent']}
              />
              <Bar dataKey="present" fill={CHART_COLORS.purple} radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="absent" fill={CHART_COLORS.pink} radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-[var(--td-muted)]">No attendance records yet for this period.</p>
      )}
    </div>
  )
}

export function StudentCalendarPanel({ enabled = true }) {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedIso, setSelectedIso] = useState(() =>
    toIsoDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
  )
  const today = new Date()
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth() + 1

  const calendarQuery = useQuery({
    queryKey: ['dashboard', 'student', 'calendar', year, month],
    queryFn: () => dashboardService.studentCalendar({ year, month }),
    staleTime: 5 * 60 * 1000,
    enabled,
    retry: 1,
  })

  const calendar = unwrapData(calendarQuery.data) || {}
  const dayMap = calendar.days || {}

  const { monthLabel, days } = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const cells = []
    for (let i = 0; i < startOffset; i += 1) cells.push({ key: `pad-${i}`, day: null })
    for (let day = 1; day <= daysInMonth; day += 1) cells.push({ key: `${year}-${month}-${day}`, day })
    return {
      monthLabel: viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      days: cells,
    }
  }, [viewDate, year, month])

  const shiftMonth = (delta) => setViewDate((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1))
  const isSameDay = (day) =>
    day && today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === day
  const selectedEntries = dayMap[selectedIso] || []

  return (
    <div className="teacher-panel teacher-calendar">
      <div className="teacher-panel__head">
        <h2 className="teacher-panel__title">Calendar</h2>
        {calendar.google_calendar_url ? (
          <a
            href={calendar.google_calendar_url}
            target="_blank"
            rel="noopener noreferrer"
            className="teacher-panel__action inline-flex items-center gap-1"
          >
            Google <FiExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>

      {calendarQuery.isLoading ? (
        <div className="teacher-skeleton h-64 w-full rounded-xl" />
      ) : (
        <>
          <div className="teacher-calendar__nav">
            <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <FiChevronLeft />
            </button>
            <span>{monthLabel}</span>
            <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">
              <FiChevronRight />
            </button>
          </div>
          <div className="teacher-calendar__weekdays">
            {WEEKDAYS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="teacher-calendar__days">
            {days.map((cell) => {
              if (!cell.day) {
                return <span key={cell.key} className="teacher-calendar__day teacher-calendar__day--muted" />
              }
              const iso = toIsoDate(year, month, cell.day)
              const entries = dayMap[iso] || []
              const tone = resolveDayTone(entries)
              let className = 'teacher-calendar__day'
              if (isSameDay(cell.day)) className += ' teacher-calendar__day--today'
              else if (tone) className += ` teacher-calendar__day--${tone}`
              if (selectedIso === iso) className += ' ring-2 ring-[var(--td-purple)] ring-offset-1'
              return (
                <button
                  key={cell.key}
                  type="button"
                  className={`teacher-calendar__day-btn ${className}`}
                  onClick={() => setSelectedIso(iso)}
                  title={entries.map((e) => e.name).join(', ')}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>
          <div className="teacher-calendar__legend">
            <span><i style={{ background: CHART_COLORS.green }} /> Today</span>
            <span><i style={{ background: CHART_COLORS.purple }} /> Public holiday</span>
            <span><i style={{ background: CHART_COLORS.pink }} /> School holiday</span>
          </div>
          <div className="teacher-calendar__events">
            <p className="teacher-calendar__events-title">{formatDisplayDate(selectedIso)}</p>
            {selectedEntries.length ? (
              selectedEntries.map((entry, index) => (
                <div key={`${entry.name}-${index}`} className="teacher-calendar__event-item">
                  <span
                    className="teacher-calendar__event-badge"
                    style={{ background: EVENT_BADGE_COLORS[entry.type] || CHART_COLORS.purple }}
                  />
                  <div>
                    <p className="font-semibold text-[var(--td-text)]">{entry.name}</p>
                    <p className="text-xs capitalize">{entry.source === 'google' ? 'Google Calendar' : 'School'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--td-muted)]">No holidays on this day.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function StudentTimetablePanel({ slots = [], classLabel = '' }) {
  const todayName = new Date().toLocaleDateString(undefined, { weekday: 'long' })

  return (
    <div className="teacher-panel">
      <div className="teacher-panel__head">
        <div>
          <h2 className="teacher-panel__title">Today&apos;s Timetable</h2>
          <p className="text-xs text-[var(--td-muted)]">
            {todayName}
            {classLabel ? ` · ${classLabel}` : ''}
          </p>
        </div>
        <Link to="/timetable" className="teacher-panel__action">
          Full schedule
        </Link>
      </div>

      {slots.length ? (
        <ul className="space-y-2">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--td-border)] bg-white px-3 py-2.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--td-purple-soft)] text-sm font-bold text-[var(--td-purple)]">
                {slot.period_number || '•'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--td-text)]">{slot.subject}</p>
                <p className="truncate text-xs text-[var(--td-muted)]">
                  {formatTime(slot.start_time)}
                  {slot.end_time ? ` – ${formatTime(slot.end_time)}` : ''}
                  {slot.room ? ` · ${slot.room}` : ''}
                </p>
              </div>
              {slot.teacher ? (
                <span className="hidden max-w-[88px] truncate text-xs text-[var(--td-muted)] sm:inline">
                  {slot.teacher}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-6 text-center text-sm text-[var(--td-muted)]">No classes scheduled for today.</p>
      )}
    </div>
  )
}

export function StudentExamSchedulePanel({ exams = [] }) {
  return (
    <div className="teacher-panel">
      <div className="teacher-panel__head">
        <div>
          <h2 className="teacher-panel__title">Exam Schedule</h2>
          <p className="text-xs text-[var(--td-muted)]">Upcoming exams for your class</p>
        </div>
        <Link to="/examinations" className="teacher-panel__action">
          View all
        </Link>
      </div>

      {exams.length ? (
        <div className="overflow-x-auto">
          <table className="student-exam-table w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam</th>
                <th>Date</th>
                <th>Time</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="font-medium text-[var(--td-text)]">{exam.subject}</td>
                  <td>{exam.exam_name}</td>
                  <td>{formatExamDate(exam.exam_date)}</td>
                  <td>
                    {formatTime(exam.start_time)}
                    {exam.end_time ? ` – ${formatTime(exam.end_time)}` : ''}
                  </td>
                  <td>{exam.room || '—'}</td>
                  <td>
                    <span className="student-exam-table__pill student-exam-table__pill--upcoming">
                      {exam.status || 'Scheduled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-[var(--td-muted)]">No upcoming exams scheduled.</p>
      )}
    </div>
  )
}

export function StudentNoticesPanel({ notices = [] }) {
  return (
    <div className="teacher-panel">
      <div className="teacher-panel__head">
        <h2 className="teacher-panel__title">Notice Board</h2>
      </div>
      {notices.length ? (
        <ul className="space-y-3">
          {notices.map((item) => (
            <li key={item.id} className="flex gap-3 rounded-xl border border-[var(--td-border)] bg-slate-50/80 p-3">
              <span
                className={`mt-0.5 h-10 w-10 shrink-0 rounded-lg ${
                  item.type === 'exam'
                    ? 'bg-[var(--td-yellow-soft)] text-[var(--td-yellow)]'
                    : item.type === 'assignment'
                      ? 'bg-[var(--td-pink-soft)] text-[var(--td-pink)]'
                      : 'bg-[var(--td-purple-soft)] text-[var(--td-purple)]'
                } flex items-center justify-center`}
              >
                {item.type === 'exam' ? <FiCalendar /> : item.type === 'assignment' ? <FiClipboard /> : <FiBookOpen />}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--td-text)]">{item.title}</p>
                <p className="text-xs text-[var(--td-muted)]">{item.subtitle}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-sm text-[var(--td-muted)]">No notices right now.</p>
      )}
    </div>
  )
}
