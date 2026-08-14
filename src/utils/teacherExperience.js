/** Client-side helpers for teacher employment history display. */

export function formatExperiencePeriod(record) {
  if (!record) return '—'
  const from = record.start_date || '—'
  const to = record.is_current || !record.end_date ? 'Present' : record.end_date
  return `${from} to ${to}`
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
