const STORAGE_KEY = 'scholaone-post-mail'

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { messages: [] }
    const parsed = JSON.parse(raw)
    return { messages: Array.isArray(parsed.messages) ? parsed.messages : [] }
  } catch {
    return { messages: [] }
  }
}

function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function listMailMessages(folder) {
  const { messages } = readStore()
  return messages
    .filter((msg) => msg.folder === folder)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getMailMessage(id) {
  const { messages } = readStore()
  return messages.find((msg) => msg.id === id) || null
}

export function saveMailMessage(message) {
  const store = readStore()
  const index = store.messages.findIndex((msg) => msg.id === message.id)
  if (index >= 0) {
    store.messages[index] = message
  } else {
    store.messages.unshift(message)
  }
  writeStore(store)
  return message
}

export function deleteMailMessage(id) {
  const store = readStore()
  store.messages = store.messages.filter((msg) => msg.id !== id)
  writeStore(store)
}

export function toggleMailStar(id) {
  const store = readStore()
  store.messages = store.messages.map((msg) =>
    msg.id === id ? { ...msg, starred: !msg.starred } : msg,
  )
  writeStore(store)
  return store.messages.find((msg) => msg.id === id) || null
}

export function createMailId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `mail-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatMailListTime(isoDate) {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  const now = new Date()
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (sameDay) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const sameYear = date.getFullYear() === now.getFullYear()
  return date.toLocaleDateString([], sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' })
}
