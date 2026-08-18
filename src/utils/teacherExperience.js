/** Client-side helpers for teacher employment history display. */

import dayjs from 'dayjs'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const DAYS_PER_YEAR = 365.25

function parseDateOnly(value) {
  if (!value) return null
  const [year, month, day] = String(value).split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/** Duration in years (one decimal), aligned with backend experience calculation. */
export function calculateExperienceDurationYears(record) {
  if (!record?.start_date) return null

  const start = parseDateOnly(record.start_date)
  const end = record.is_current || !record.end_date ? startOfToday() : parseDateOnly(record.end_date)
  if (!start || !end || end < start) return null

  const days = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1
  return Math.round((days / DAYS_PER_YEAR) * 10) / 10
}

export function formatExperienceDuration(record) {
  const years = calculateExperienceDurationYears(record)
  if (years == null) return ''

  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12))
    return months === 1 ? '1 month' : `${months} months`
  }

  const label = formatTotalExperienceYears(years)
  const unit = Number(label) === 1 ? 'year' : 'years'
  return `${label} ${unit}`
}

/** Format API date (YYYY-MM-DD) as dd/mm/yy for display. */
export function formatExperienceDate(value) {
  if (!value) return '—'
  return dayjs(value).format('DD/MM/YY')
}

export function formatExperiencePeriod(record) {
  if (!record) return '—'
  const from = formatExperienceDate(record.start_date)
  const to = record.is_current || !record.end_date ? 'Present' : formatExperienceDate(record.end_date)
  return `${from} to ${to}`
}

/** Date range plus calculated duration, e.g. "20/05/00 to 20/05/09 · 9 years" */
export function formatExperienceSummary(record) {
  const period = formatExperiencePeriod(record)
  const duration = formatExperienceDuration(record)
  if (!duration) return period
  return `${period} · ${duration}`
}

export function formatTotalExperienceYears(value) {
  if (value == null || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return Number.isInteger(num) ? String(num) : num.toFixed(1).replace(/\.0$/, '')
}

export function buildExperiencePayload(form) {
  const isCurrent = Boolean(form.is_current)
  return {
    organization_name: form.organization_name?.trim(),
    role: form.role?.trim() || '',
    start_date: form.start_date,
    end_date: isCurrent ? null : form.end_date || null,
    is_current: isCurrent,
    description: form.description?.trim() || '',
  }
}

export function validateExperienceForm(form) {
  if (!form.organization_name?.trim()) {
    return 'Organization is required.'
  }
  if (!form.start_date) {
    return 'From date is required.'
  }
  if (!form.is_current && !form.end_date) {
    return 'To date is required, or mark as Present.'
  }
  if (!form.is_current && form.end_date && form.end_date < form.start_date) {
    return 'To date must be on or after from date.'
  }
  return null
}

export const EMPTY_EXPERIENCE_FORM = {
  organization_name: '',
  role: '',
  start_date: '',
  end_date: '',
  is_current: false,
  description: '',
}

export function experienceToForm(record) {
  if (!record) return { ...EMPTY_EXPERIENCE_FORM }
  return {
    organization_name: record.organization_name || '',
    role: record.role || '',
    start_date: record.start_date || '',
    end_date: record.end_date || '',
    is_current: Boolean(record.is_current),
    description: record.description || '',
  }
}
