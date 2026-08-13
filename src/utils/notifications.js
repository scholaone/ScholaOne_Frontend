import { unwrapList } from '@/api/client'

export function getUnreadCountFromResponse(response) {
  if (!response) return 0
  if (typeof response.count === 'number') return response.count
  if (typeof response.data?.count === 'number') return response.data.count
  return 0
}

export function getNotificationListFromResponse(response) {
  return unwrapList(response).results
}

export function resolveNotificationLink(notification) {
  if (!notification) return null

  const metadata = notification.metadata || {}
  const messageId = metadata.communication_message_id || metadata.message_id
  if (messageId) {
    return `/communications/messages/${messageId}`
  }

  if (metadata.path) return metadata.path
  if (metadata.url) return metadata.url

  if (notification.notification_type === 'announcement') {
    return '/announcements'
  }

  return '/notifications'
}

export async function ensureBrowserNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

export function showBrowserNotification(title, options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return null
  if (Notification.permission !== 'granted') return null

  try {
    const notification = new Notification(title, {
      body: options.body || '',
      icon: options.icon || '/favicon.ico',
      tag: options.tag || undefined,
    })
    if (typeof options.onClick === 'function') {
      notification.onclick = (event) => {
        event.preventDefault()
        window.focus()
        options.onClick()
        notification.close()
      }
    }
    return notification
  } catch {
    return null
  }
}
