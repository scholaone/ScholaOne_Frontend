/** Shared helpers for class / teacher weekly timetable grids. */

export const TIMETABLE_WEEKDAYS = [
  { value: 0, label: 'Monday', short: 'Mon' },
  { value: 1, label: 'Tuesday', short: 'Tue' },
  { value: 2, label: 'Wednesday', short: 'Wed' },
  { value: 3, label: 'Thursday', short: 'Thu' },
  { value: 4, label: 'Friday', short: 'Fri' },
  { value: 5, label: 'Saturday', short: 'Sat' },
]

export function unwrapTimetablePayload(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

export function formatTimetableTime(value) {
  if (!value) return ''
  const parts = String(value).split(':')
  if (parts.length < 2) return value
  const date = new Date()
  date.setHours(Number(parts[0]), Number(parts[1]), 0)
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatTimetableTimeRange(start, end) {
  const startLabel = formatTimetableTime(start)
  const endLabel = formatTimetableTime(end)
  if (startLabel && endLabel) return `${startLabel}–${endLabel}`
  return startLabel || endLabel || ''
}

function isLunchColumn(period) {
  const kind = period?.period_kind || period?.period_type
  return kind === 'lunch' || kind === 'break'
}

/** Build grid columns from configured periods, falling back to slot period numbers. */
export function buildTimetableColumns(periods = [], slots = []) {
  let source = [...(periods || [])].sort(
    (a, b) => Number(a.period_number || 0) - Number(b.period_number || 0),
  )

  if (!source.length && slots?.length) {
    const numbers = [
      ...new Set(slots.map((slot) => Number(slot.period_number)).filter(Boolean)),
    ].sort((a, b) => a - b)
    source = numbers.map((periodNumber) => ({
      period_number: periodNumber,
      name: `Period ${periodNumber}`,
      period_type: 'regular',
    }))
  }

  if (!source.length) {
    source = [1, 2, 3, 4, 5, 6, 7].map((periodNumber) => ({
      period_number: periodNumber,
      name: `Period ${periodNumber}`,
      period_type: periodNumber === 5 ? 'lunch' : 'regular',
    }))
  }

  return source.map((period) => {
    const lunch = isLunchColumn(period)
    return {
      key: lunch ? 'lunch' : `p${period.period_number}`,
      period_number: period.period_number,
      label: lunch ? 'Lunch Break' : period.name || `Period ${period.period_number}`,
      isLunch: lunch,
      start_time: period.start_time,
      end_time: period.end_time,
    }
  })
}

export function buildSlotLookup(slots = []) {
  const map = new Map()
  for (const slot of slots || []) {
    if (!slot || slot.period_kind === 'lunch' || slot.period_kind === 'break') continue
    const weekday = Number(slot.weekday)
    const periodNumber = Number(slot.period_number)
    if (Number.isNaN(weekday) || Number.isNaN(periodNumber)) continue
    map.set(`${weekday}:${periodNumber}`, slot)
  }
  return map
}

export function getSlotForCell(lookup, weekday, column) {
  if (column.isLunch) return null
  return lookup.get(`${weekday}:${column.period_number}`) || null
}

export function formatExamDayName(examDate) {
  if (!examDate) return '—'
  const date = new Date(`${examDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { weekday: 'long' })
}

export function formatExamDuration(startTime, endTime) {
  if (!startTime || !endTime) return '—'
  const [sh, sm] = String(startTime).split(':').map(Number)
  const [eh, em] = String(endTime).split(':').map(Number)
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return '—'
  const minutes = (eh * 60 + em) - (sh * 60 + sm)
  if (minutes <= 0) return '—'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours && mins) return `${hours} Hour${hours > 1 ? 's' : ''} ${mins} min`
  if (hours) return `${hours} Hour${hours > 1 ? 's' : ''}`
  return `${mins} min`
}
