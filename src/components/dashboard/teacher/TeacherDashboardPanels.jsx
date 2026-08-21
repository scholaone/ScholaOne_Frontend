import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiClock,
  FiExternalLink,
  FiLayers,
  FiUsers,
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
import { formatNumber, resolveMediaUrl } from '@/utils/format'
import { dashboardService } from '@/api/services'
import { unwrapData } from '@/api/client'

const CHART_COLORS = {
  purple: '#634bb1',
  yellow: '#ffc107',
  green: '#4caf50',
  pink: '#f06292',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const QUICK_LINK_META = {
  lms: { icon: FiBookOpen, tone: 'purple' },
  assignments: { icon: FiClipboard, tone: 'pink' },
  attendance: { icon: FiCalendar, tone: 'green' },
  timetable: { icon: FiClock, tone: 'yellow' },
  students: { icon: FiUsers, tone: 'blue' },
}

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

function formatActivityDate(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function TeacherStatCards({ statistics = {}, classTeacher = {}, loading = false }) {
  const isClassTeacher = Boolean(statistics.is_class_teacher || classTeacher.is_class_teacher)
  const primarySection = classTeacher.sections?.[0]

  const cards = isClassTeacher
    ? [
        {
          key: 'my-class',
          label: classTeacher.total_classes === 1 && primarySection?.display_name
            ? primarySection.display_name
            : 'My Classes',
          value: classTeacher.total_classes === 1 && primarySection?.display_name
            ? primarySection.student_count ?? 0
            : statistics.class_teacher_classes ?? classTeacher.total_classes ?? 0,
          tone: 'pink',
          icon: FiLayers,
          hint: classTeacher.total_classes === 1 ? 'Students in your class' : 'Classes you lead',
          to: '/dashboard/teacher/my-students',
        },
        {
          key: 'my-students',
          label: 'My Students',
          value: statistics.class_teacher_students ?? classTeacher.total_students ?? 0,
          tone: 'purple',
          icon: FiUsers,
          to: '/dashboard/teacher/my-students',
        },
        {
          key: 'courses',
          label: 'Courses',
          value: statistics.courses ?? 0,
          tone: 'yellow',
          icon: FiBookOpen,
        },
        {
          key: 'plans',
          label: 'Lesson plans',
          value: statistics.lesson_plans ?? 0,
          tone: 'green',
          icon: FiClipboard,
        },
      ]
    : [
        {
          key: 'classes',
          label: 'Classes',
          value: statistics.classes_assigned ?? 0,
          tone: 'pink',
          icon: FiLayers,
        },
        {
          key: 'students',
          label: 'Students',
          value: statistics.students_assigned ?? 0,
          tone: 'purple',
          icon: FiUsers,
        },
        {
          key: 'courses',
          label: 'Courses',
          value: statistics.courses ?? 0,
          tone: 'yellow',
          icon: FiBookOpen,
        },
        {
          key: 'plans',
          label: 'Lesson plans',
          value: statistics.lesson_plans ?? 0,
          tone: 'green',
          icon: FiClipboard,
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
        const content = (
          <>
            <div className="teacher-stat-card__icon">
              <Icon aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="teacher-stat-card__label">{card.label}</p>
              <p className="teacher-stat-card__value">{formatNumber(card.value)}</p>
              {card.hint ? (
                <p className="mt-0.5 text-[10px] text-[var(--td-muted)]">{card.hint}</p>
              ) : null}
            </div>
          </>
        )

        if (card.to) {
          return (
            <Link
              key={card.key}
              to={card.to}
              className={`teacher-stat-card teacher-stat-card--${card.tone} teacher-stat-card--link`}
            >
              {content}
            </Link>
          )
        }

        return (
          <div key={card.key} className={`teacher-stat-card teacher-stat-card--${card.tone}`}>
            {content}
          </div>
        )
      })}
    </div>
  )
}

export function TeacherCalendarPanel({ enabled = true }) {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedIso, setSelectedIso] = useState(() => toIsoDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate(),
  ))
  const today = new Date()
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth() + 1

  const calendarQuery = useQuery({
    queryKey: ['dashboard', 'teacher', 'calendar', year, month],
    queryFn: () => dashboardService.teacherCalendar({ year, month }),
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
    for (let i = 0; i < startOffset; i += 1) {
      cells.push({ key: `pad-${i}`, day: null })
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ key: `${year}-${month}-${day}`, day })
    }

    return {
      monthLabel: viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      days: cells,
    }
  }, [viewDate, year, month])

  const shiftMonth = (delta) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
  }

  const isSameDay = (day) =>
    day
    && day === today.getDate()
    && month === today.getMonth() + 1
    && year === today.getFullYear()

  const selectedEntries = dayMap[selectedIso] || []
  const monthHolidayCount = (calendar.month_events || []).filter((item) =>
    item.entries?.some((entry) => entry.type === 'public_holiday' || entry.type === 'school_holiday'),
  ).length

  return (
    <div className="teacher-panel">
      <div className="teacher-panel__head">
        <div>
          <h2 className="teacher-panel__title">Calendar &amp; Holidays</h2>
          <p className="teacher-panel__sub">
            School holidays, Google public holidays
            {monthHolidayCount ? ` · ${monthHolidayCount} this month` : ''}
          </p>
        </div>
        {calendar.google_calendar_url ? (
          <a
            href={calendar.google_calendar_url}
            target="_blank"
            rel="noopener noreferrer"
            className="teacher-calendar__google-link inline-flex items-center gap-1"
          >
            Google Calendar
            <FiExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>

      <div className="teacher-calendar__nav">
        <button type="button" className="teacher-calendar__btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
          <FiChevronLeft />
        </button>
        <span className="teacher-calendar__month">{monthLabel}</span>
        <button type="button" className="teacher-calendar__btn" onClick={() => shiftMonth(1)} aria-label="Next month">
          <FiChevronRight />
        </button>
      </div>

      {calendarQuery.isLoading ? (
        <div className="teacher-skeleton mb-3 h-48 w-full rounded-xl" />
      ) : (
        <>
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
                  title={entries.map((entry) => entry.name).join(', ')}
                  aria-label={`${cell.day}${entries.length ? `: ${entries.map((entry) => entry.name).join(', ')}` : ''}`}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>

          <div className="teacher-calendar__legend">
            <span><i style={{ background: CHART_COLORS.green }} /> Today</span>
            <span><i style={{ background: CHART_COLORS.purple }} /> Public holiday (Google)</span>
            <span><i style={{ background: CHART_COLORS.pink }} /> School holiday</span>
            <span><i style={{ background: CHART_COLORS.yellow }} /> School event</span>
            <span><i style={{ background: '#9ca3af' }} /> Sunday</span>
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
                    <p className="text-xs capitalize">
                      {entry.source === 'google' ? 'Google Calendar' : entry.source === 'school' ? 'School calendar' : 'Weekend'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--td-muted)]">No holidays or events on this day.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function TeacherActivitiesPanel({ activities = [], quickLinks = [] }) {
  return (
    <div className="teacher-panel">
      <div className="teacher-panel__head">
        <div>
          <h2 className="teacher-panel__title">Activities Notification</h2>
        </div>
        {quickLinks[0] ? (
          <Link to={quickLinks[0].path} className="teacher-panel__action">
            View All
          </Link>
        ) : null}
      </div>

      {activities.length ? (
        activities.map((item) => {
          const content = (
            <>
              <span className="teacher-activity__dot" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="teacher-activity__title">{item.title}</p>
                <p className="teacher-activity__meta">
                  {item.subtitle}
                  {item.date ? ` · ${formatActivityDate(item.date)}` : ''}
                </p>
                {item.description ? (
                  <p className="teacher-activity__desc">{item.description}</p>
                ) : (
                  <p className="teacher-activity__desc">
                    Stay updated with your latest classroom activity and teaching tasks.
                  </p>
                )}
              </div>
            </>
          )

          if (item.path) {
            return (
              <Link key={item.id} to={item.path} className="teacher-activity hover:opacity-90">
                {content}
              </Link>
            )
          }

          return (
            <div key={item.id} className="teacher-activity">
              {content}
            </div>
          )
        })
      ) : (
        <p className="teacher-empty">No recent activities yet.</p>
      )}
    </div>
  )
}

export function TeacherPerformancePanel({ data = [] }) {
  const chartData = data.map((row) => ({
    ...row,
    fill: CHART_COLORS[row.color] || CHART_COLORS.purple,
  }))

  return (
    <div className="teacher-panel">
      <div className="teacher-panel__head">
        <div>
          <h2 className="teacher-panel__title">Class Performance</h2>
          <p className="teacher-panel__sub">Teaching workload overview</p>
        </div>
      </div>

      <div className="teacher-chart-legend">
        <span><i style={{ background: CHART_COLORS.purple }} /> Courses</span>
        <span><i style={{ background: CHART_COLORS.yellow }} /> Lesson plans</span>
        <span><i style={{ background: CHART_COLORS.green }} /> Pending eval.</span>
      </div>

      {chartData.length ? (
        <div className="h-[250px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="28%" margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'rgba(99, 75, 177, 0.06)' }}
                contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="teacher-empty">Performance data will appear once you have active classes.</p>
      )}
    </div>
  )
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    || '?'
}

export function TeacherTopScorersPanel({ scorers = [], schoolName = '' }) {
  const ordered = [
    scorers.find((s) => s.rank === 2) || scorers[1],
    scorers.find((s) => s.rank === 1) || scorers[0],
    scorers.find((s) => s.rank === 3) || scorers[2],
  ].filter(Boolean)

  const placeholders = [
    { rank: 2, name: '—', school: schoolName || 'Class 10-A', score: '—', tone: 'second' },
    { rank: 1, name: '—', school: schoolName || 'Your school', score: '—', tone: 'first' },
    { rank: 3, name: '—', school: schoolName || 'Class 9-B', score: '—', tone: 'third' },
  ]

  const display = ordered.length >= 3 ? ordered : placeholders

  return (
    <div className="teacher-panel">
      <div className="teacher-panel__head">
        <div>
          <h2 className="teacher-panel__title">Top Scorer</h2>
          <p className="teacher-panel__sub">Highest performers in your classes</p>
        </div>
        <select className="rounded-lg border border-[var(--td-border)] bg-white px-2 py-1 text-xs text-[var(--td-muted)]" defaultValue="current">
          <option value="current">Current year</option>
        </select>
      </div>

      {ordered.length ? (
        <div className="teacher-scorer-grid">
          {display.map((student) => (
            <div
              key={`${student.rank}-${student.name}`}
              className={`teacher-scorer-card teacher-scorer-card--${
                student.rank === 1 ? 'first' : student.rank === 2 ? 'second' : 'third'
              }`}
            >
              <div className="teacher-scorer-card__avatar">{initials(student.name)}</div>
              <p className="teacher-scorer-card__name">{student.name}</p>
              <p className="teacher-scorer-card__school">{student.school || student.class_name || schoolName}</p>
              <p className="teacher-scorer-card__score">{student.score}{student.score !== '—' ? '%' : ''}</p>
              <p className="teacher-scorer-card__rank">
                {student.rank === 1 ? '1st' : student.rank === 2 ? '2nd' : '3rd'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="teacher-scorer-grid opacity-60">
            {placeholders.map((student) => (
              <div
                key={student.rank}
                className={`teacher-scorer-card teacher-scorer-card--${student.tone}`}
              >
                <div className="teacher-scorer-card__avatar">?</div>
                <p className="teacher-scorer-card__name">No data yet</p>
                <p className="teacher-scorer-card__school">{student.school}</p>
                <p className="teacher-scorer-card__score">—</p>
                <p className="teacher-scorer-card__rank">
                  {student.rank === 1 ? '1st' : student.rank === 2 ? '2nd' : '3rd'}
                </p>
              </div>
            ))}
          </div>
          <p className="teacher-empty mt-3 text-xs">Assessment results will show your top students here.</p>
        </>
      )}
    </div>
  )
}

export function TeacherQuickAccessPanel({ links = [] }) {
  if (!links.length) return null

  return (
    <section className="teacher-quick-access teacher-panel">
      <h2 className="teacher-quick-access__title">Quick Access</h2>
      <p className="teacher-quick-access__sub">Jump to your most-used teaching tools</p>
      <div className="teacher-quick-access__grid">
        {links.map((link) => {
          const meta = QUICK_LINK_META[link.key] || { icon: FiLayers, tone: 'purple' }
          const Icon = meta.icon
          return (
            <Link
              key={link.key}
              to={link.path}
              className={`teacher-action-card teacher-action-card--${meta.tone}`}
            >
              <div className="teacher-action-card__icon">
                <Icon aria-hidden />
              </div>
              <p className="teacher-action-card__label">{link.label}</p>
              <p className="teacher-action-card__desc">
                {link.description || `Open ${link.label}`}
              </p>
              <span className="teacher-action-card__cta inline-flex items-center gap-1">
                Open
                <FiArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

/** @deprecated Use TeacherQuickAccessPanel */
export function TeacherQuickLinks({ links = [] }) {
  return <TeacherQuickAccessPanel links={links} />
}

function studentInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    || '?'
}

function StudentRowAvatar({ name, photoUrl, size = 'md' }) {
  const [failed, setFailed] = useState(false)
  const src = useMemo(() => resolveMediaUrl(photoUrl), [photoUrl])
  const sizeClass = size === 'lg' ? 'teacher-class-students__avatar--lg' : size === 'sm' ? 'teacher-class-students__avatar--sm' : ''

  if (!src || failed) {
    return (
      <span className={`teacher-class-students__avatar teacher-class-students__avatar--placeholder ${sizeClass}`.trim()}>
        {studentInitials(name)}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      className={`teacher-class-students__avatar ${sizeClass}`.trim()}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

function formatStudentGender(gender = '') {
  if (!gender) return ''
  const value = String(gender).trim()
  if (value.length <= 1) return value.toUpperCase()
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export function TeacherClassStudentList({ students = [], compact = false, variant = 'table' }) {
  if (!students.length) {
    return <p className="teacher-empty text-sm">No students enrolled in this class yet.</p>
  }

  if (variant === 'cards') {
    return (
      <div className="teacher-student-cards">
        {students.map((student, index) => (
          <article key={student.student_id} className="teacher-student-card">
            <span className="teacher-student-card__index">{index + 1}</span>
            <StudentRowAvatar name={student.full_name} photoUrl={student.photo_url} size="lg" />
            <div className="teacher-student-card__body">
              <p className="teacher-student-card__name">{student.full_name}</p>
              <div className="teacher-student-card__meta">
                <span>Roll {student.roll_number || '—'}</span>
                <span className="teacher-student-card__dot" aria-hidden />
                <span>Adm {student.admission_number || '—'}</span>
                {student.gender ? (
                  <>
                    <span className="teacher-student-card__dot" aria-hidden />
                    <span>{formatStudentGender(student.gender)}</span>
                  </>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className={`teacher-class-students${compact ? ' teacher-class-students--compact' : ''}`}>
      <div className="teacher-class-students__head">
        <span>Roll</span>
        <span>Student</span>
        {!compact ? <span>Admission No.</span> : null}
      </div>
      {students.map((student) => (
        <div key={student.student_id} className="teacher-class-students__row">
          <span className="teacher-class-students__roll">{student.roll_number || '—'}</span>
          <div className="teacher-class-students__name">
            <StudentRowAvatar name={student.full_name} photoUrl={student.photo_url} />
            <span className="truncate">{student.full_name}</span>
          </div>
          {!compact ? (
            <span className="teacher-class-students__adm">{student.admission_number || '—'}</span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function TeacherMyClassPanel({ classTeacher = {}, loading = false }) {
  const sections = classTeacher.sections || []

  if (loading) {
    return (
      <div className="teacher-panel">
        <div className="teacher-skeleton mb-3 h-5 w-40" />
        <div className="teacher-skeleton h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!classTeacher.is_class_teacher) {
    return (
      <div className="teacher-panel">
        <div className="teacher-panel__head">
          <div>
            <h2 className="teacher-panel__title">My Class</h2>
            <p className="teacher-panel__sub">Class teacher assignment</p>
          </div>
        </div>
        <p className="teacher-empty text-xs">
          You are not assigned as a class teacher yet. Contact your school admin to map your class.
        </p>
      </div>
    )
  }

  return (
    <div className="teacher-panel">
      <div className="teacher-panel__head">
        <div>
          <h2 className="teacher-panel__title">My Class</h2>
          <p className="teacher-panel__sub">
            {classTeacher.total_classes} class{classTeacher.total_classes === 1 ? '' : 'es'}
            {' · '}
            {classTeacher.total_students} student{classTeacher.total_students === 1 ? '' : 's'}
          </p>
        </div>
        <Link to="/dashboard/teacher/my-students" className="teacher-panel__action">
          View students
        </Link>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <Link
            key={section.class_section_id}
            to={`/dashboard/teacher/my-students?class=${section.class_section_id}`}
            className="teacher-class-block teacher-class-block--link"
          >
            <div className="teacher-class-block__head">
              <div>
                <p className="teacher-class-block__title">{section.display_name}</p>
                <p className="teacher-class-block__meta">
                  {section.academic_year_name}
                  {' · '}
                  {section.student_count} student{section.student_count === 1 ? '' : 's'}
                </p>
              </div>
              <span className="teacher-class-block__cta">View students</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
