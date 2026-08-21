import { useMemo } from 'react'
import { buildAttendanceGrid, summarizeAttendance } from './teacherProfileUtils'

const DOT_CLASS = {
  [-1]: 'tp-dot tp-dot--future',
  0: 'tp-dot tp-dot--0',
  1: 'tp-dot tp-dot--1',
  2: 'tp-dot tp-dot--2',
  3: 'tp-dot tp-dot--3',
  4: 'tp-dot tp-dot--4',
  5: 'tp-dot tp-dot--5',
}

const LEGEND = [
  { level: 0, label: 'Absent / no record' },
  { level: 1, label: 'Under 2h' },
  { level: 2, label: '2–4h' },
  { level: 3, label: '4–6h' },
  { level: 4, label: '6–8h' },
  { level: 5, label: '8h+' },
]

export default function TeacherAttendanceDots({ attendanceRecords = [], weekCount = 16 }) {
  const weeks = useMemo(
    () => buildAttendanceGrid(attendanceRecords, weekCount),
    [attendanceRecords, weekCount],
  )
  const summary = useMemo(() => summarizeAttendance(attendanceRecords), [attendanceRecords])

  const rateDelta = summary.presentRate >= 90 ? '+ strong' : summary.presentRate >= 75 ? '+ steady' : ''

  return (
    <div className="tp-attendance-card">
      <div className="tp-attendance-card__head">
        <div>
          <p className="tp-attendance-card__eyebrow">Attendance</p>
          <div className="tp-attendance-card__stat-row">
            <span className="tp-attendance-card__stat">
              {summary.avgHoursLabel}
              <span className="tp-attendance-card__stat-unit"> avg hrs/day</span>
            </span>
            {summary.totalDays > 0 ? (
              <span className="tp-attendance-card__badge">
                {summary.presentRate.toFixed(0)}% present
                {rateDelta ? <small>{rateDelta}</small> : null}
              </span>
            ) : null}
          </div>
        </div>
        <p className="tp-attendance-card__sub">
          Last {weekCount} weeks · {summary.presentDays}/{summary.totalDays || 0} days marked present
        </p>
      </div>

      <div className="tp-attendance-grid-wrap">
        <div className="tp-attendance-grid" role="img" aria-label="Teacher attendance calendar">
          {weeks.map((week, wi) => (
            <div key={`w-${wi}`} className="tp-attendance-grid__col">
              {week.map((cell) => (
                <span
                  key={cell.date}
                  className={DOT_CLASS[cell.level] ?? DOT_CLASS[0]}
                  title={
                    cell.isFuture
                      ? `${cell.label} — upcoming`
                      : cell.record
                        ? `${cell.label}: ${cell.status.replace(/_/g, ' ')}${cell.hours ? ` · ${cell.hours.toFixed(1)}h` : ''}`
                        : `${cell.label}: no record`
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="tp-attendance-legend">
        {LEGEND.map((item) => (
          <span key={item.level} className="tp-attendance-legend__item">
            <span className={DOT_CLASS[item.level]} aria-hidden />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
