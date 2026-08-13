/** Time-of-day greeting for dashboards and headers. */

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) {
    return { text: 'Good morning', period: 'morning', emoji: '🌅' }
  }
  if (hour < 17) {
    return { text: 'Good afternoon', period: 'afternoon', emoji: '☀️' }
  }
  return { text: 'Good evening', period: 'evening', emoji: '🌙' }
}

export function formatDashboardDate(date = new Date()) {
  return {
    weekday: date.toLocaleDateString(undefined, { weekday: 'long' }),
    short: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    full: date.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  }
}

export function getFirstName(userName, fallback = 'there') {
  const trimmed = String(userName || '').trim()
  if (!trimmed) return fallback
  return trimmed.split(/\s+/)[0] || fallback
}
