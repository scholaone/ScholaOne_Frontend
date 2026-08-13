import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export function formatDate(value, format = 'DD MMM YYYY') {
  if (!value) return '—'
  return dayjs(value).format(format)
}

export function formatDateTime(value) {
  if (!value) return '—'
  return dayjs(value).format('DD MMM YYYY, hh:mm A')
}

/** datetime-local input → ISO UTC string for API (avoids treating local time as UTC). */
export function datetimeLocalToISO(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

/** API ISO datetime → datetime-local input value in user's local timezone. */
export function isoToDatetimeLocal(value) {
  if (!value) return ''
  return dayjs(value).format('YYYY-MM-DDTHH:mm')
}

export function fromNow(value) {
  if (!value) return ''
  return dayjs(value).fromNow()
}

export function formatNumber(value) {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat().format(value)
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function exportToCsv(rows, columns, filename = 'export.csv') {
  const header = columns.map((c) => c.header).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = c.accessor(row)
          const str = val === null || val === undefined ? '' : String(val)
          return `"${str.replace(/"/g, '""')}"`
        })
        .join(','),
    )
    .join('\n')
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

import { API_BASE_URL } from '@/config/constants'

export function resolveMediaUrl(path) {
  if (!path) return null
  if (typeof path === 'object' && path?.url) path = path.url
  const value = String(path).trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  const base = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base.replace(/\/+$/, '')}${value.startsWith('/') ? value : `/${value}`}`
}

export { cn } from '@/lib/utils'
