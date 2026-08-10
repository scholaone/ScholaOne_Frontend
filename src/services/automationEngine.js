import toast from 'react-hot-toast'
import { generateAiTip } from '@/services/nexusAiService'
import { markAutomationRun, markSessionRun, wasRunThisSession } from '@/utils/automationStorage'

export async function runAutomationActions(automation, { navigate, mailComposeState }) {
  for (const action of automation.actions || []) {
    switch (action.type) {
      case 'toast':
        toast(action.payload?.message || automation.name, { icon: '⚡' })
        break
      case 'navigate':
        if (action.payload?.path && navigate) navigate(action.payload.path)
        break
      case 'ai_tip': {
        const tip = await generateAiTip(action.payload?.context || 'dashboard')
        toast(tip.content.slice(0, 200), { icon: '🤖', duration: 6000 })
        break
      }
      case 'compose_mail':
        if (navigate) {
          navigate('/scholaone-post', {
            state: {
              compose: true,
              draft: {
                subject: action.payload?.subject || '',
                body: action.payload?.body || '',
                to: action.payload?.to || '',
              },
            },
          })
        }
        break
      default:
        break
    }
  }

  markAutomationRun(automation.id)
}

export function shouldRunAutomation(automation, { intervalTick = false } = {}) {
  if (!automation.enabled) return false

  const trigger = automation.trigger?.type || 'manual'
  if (trigger === 'manual') return false
  if (trigger === 'app_load') return !wasRunThisSession(automation.id)
  if (trigger === 'interval') {
    if (!intervalTick) return false
    const minutes = automation.trigger?.minutes || 30
    const last = automation.lastRun ? new Date(automation.lastRun).getTime() : 0
    return Date.now() - last >= minutes * 60 * 1000
  }
  return false
}

export async function runAutomationIfDue(automation, ctx) {
  if (!shouldRunAutomation(automation, ctx)) return false
  await runAutomationActions(automation, ctx)
  if (automation.trigger?.type === 'app_load') markSessionRun(automation.id)
  return true
}
