const STATUS_HOURS = {
  present: 8,
  late: 7,
  half_day: 4,
  absent: 0,
  on_leave: 0,
}

export function parseTimeToHours(timeStr) {
  if (!timeStr) return null
  const parts = String(timeStr).split(':')
  const h = Number(parts[0])
  const m = Number(parts[1] || 0)
  if (Number.isNaN(h)) return null
  return h + m / 60
}

export function getRecordWorkHours(record) {
  if (!record) return 0
  const checkIn = parseTimeToHours(record.check_in)
  const checkOut = parseTimeToHours(record.check_out)
  if (checkIn != null && checkOut != null && checkOut > checkIn) {
    return checkOut - checkIn
  }
  return STATUS_HOURS[record.status] ?? 0
}

/** 0 = empty, 1–5 = intensity (maps to dot color) */
export function getAttendanceDotLevel(record) {
  if (!record) return 0
  if (record.status === 'absent') return 0
  if (record.status === 'on_leave') return 0
  const hours = getRecordWorkHours(record)
  if (hours <= 0) return 0
  if (hours < 2) return 1
  if (hours < 4) return 2
  if (hours < 6) return 3
  if (hours < 8) return 4
  return 5
}

export function formatDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Build week columns for a GitHub-style attendance grid (Sun–Sat rows). */
export function buildAttendanceGrid(attendanceRecords = [], weekCount = 16) {
  const byDate = new Map()
  attendanceRecords.forEach((record) => {
    if (record?.date) byDate.set(record.date, record)
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  const start = new Date(today)
  start.setDate(start.getDate() - weekCount * 7 + 1)

  // Align start to Sunday
  start.setDate(start.getDate() - start.getDay())

  const weeks = []
  let cursor = new Date(start)

  while (cursor <= end) {
    const week = []
    for (let day = 0; day < 7; day += 1) {
      const cellDate = new Date(cursor)
      cellDate.setDate(cursor.getDate() + day)
      const key = formatDateKey(cellDate)
      const record = byDate.get(key) || null
      const isFuture = cellDate > today
      week.push({
        date: key,
        label: cellDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        record,
        level: isFuture ? -1 : getAttendanceDotLevel(record),
        hours: record ? getRecordWorkHours(record) : 0,
        status: record?.status || (isFuture ? 'future' : 'none'),
        isFuture,
      })
    }
    weeks.push(week)
    cursor.setDate(cursor.getDate() + 7)
  }

  return weeks
}

export function summarizeAttendance(attendanceRecords = []) {
  const records = attendanceRecords.filter((r) => r?.date)
  if (!records.length) {
    return {
      totalDays: 0,
      presentDays: 0,
      presentRate: 0,
      avgHours: 0,
      avgHoursLabel: '0',
    }
  }

  let presentDays = 0
  let totalHours = 0

  records.forEach((record) => {
    const hours = getRecordWorkHours(record)
    totalHours += hours
    if (['present', 'late', 'half_day'].includes(record.status)) {
      presentDays += 1
    }
  })

  const avgHours = totalHours / records.length
  const presentRate = (presentDays / records.length) * 100

  return {
    totalDays: records.length,
    presentDays,
    presentRate,
    avgHours,
    avgHoursLabel: avgHours.toFixed(1).replace(/\.0$/, ''),
  }
}
