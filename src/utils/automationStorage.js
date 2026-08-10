import { AUTOMATION_TEMPLATES } from '@/config/automationTemplates'

const STORAGE_KEY = 'scholaone-automations'
const SESSION_KEY = 'scholaone-automation-session'
const DISABLED_AUTO_TIP_KEY = 'scholaone-automations-no-default-tip'

function disableDefaultDashboardTip(automations) {
  if (localStorage.getItem(DISABLED_AUTO_TIP_KEY)) return automations
  localStorage.setItem(DISABLED_AUTO_TIP_KEY, '1')
  const next = automations.map((a) =>
    a.templateId === 'ai_dashboard_tip' ? { ...a, enabled: false } : a,
  )
  writeStore({ automations: next })
  return next
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { automations: seedDefaults() }
    const parsed = JSON.parse(raw)
    const automations = Array.isArray(parsed.automations) ? parsed.automations : seedDefaults()
    return { automations: disableDefaultDashboardTip(automations) }
  } catch {
    return { automations: seedDefaults() }
  }
}

function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function seedDefaults() {
  return AUTOMATION_TEMPLATES.map((tpl) => ({
    id: `auto-${tpl.id}`,
    templateId: tpl.id,
    name: tpl.name,
    description: tpl.description,
    enabled: false,
    trigger: tpl.trigger,
    actions: tpl.actions,
    lastRun: null,
    runCount: 0,
    createdAt: new Date().toISOString(),
  }))
}

export function listAutomations() {
  return readStore().automations
}

export function saveAutomation(automation) {
  const store = readStore()
  const index = store.automations.findIndex((a) => a.id === automation.id)
  if (index >= 0) store.automations[index] = automation
  else store.automations.unshift(automation)
  writeStore(store)
  return automation
}

export function deleteAutomation(id) {
  const store = readStore()
  store.automations = store.automations.filter((a) => a.id !== id)
  writeStore(store)
}

export function toggleAutomation(id, enabled) {
  const store = readStore()
  store.automations = store.automations.map((a) =>
    a.id === id ? { ...a, enabled } : a,
  )
  writeStore(store)
  return store.automations.find((a) => a.id === id)
}

export function markAutomationRun(id) {
  const store = readStore()
  store.automations = store.automations.map((a) =>
    a.id === id
      ? { ...a, lastRun: new Date().toISOString(), runCount: (a.runCount || 0) + 1 }
      : a,
  )
  writeStore(store)
}

export function createAutomationId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `auto-${Date.now()}`
}

export function getSessionRuns() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}')
  } catch {
    return {}
  }
}

export function markSessionRun(automationId) {
  const runs = getSessionRuns()
  runs[automationId] = Date.now()
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(runs))
}

export function wasRunThisSession(automationId) {
  return Boolean(getSessionRuns()[automationId])
}
