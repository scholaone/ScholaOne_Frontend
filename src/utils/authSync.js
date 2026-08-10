import { AUTH_LOGOUT_KEY, AUTH_REVISION_KEY, AUTH_STORAGE_KEY } from '@/config/constants'

export const AUTH_SYNC_CHANNEL = 'scholaone-auth-sync'

/** Cross-tab auth events (BroadcastChannel + localStorage fallback). */
export const AuthSyncEvent = {
  LOGIN: 'userLoggedIn',
  LOGOUT: 'userLoggedOut',
  /** Token refresh or profile update */
  UPDATED: 'auth-updated',
}

const TAB_ID =
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`

let channel = null

try {
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(AUTH_SYNC_CHANNEL)
  }
} catch {
  channel = null
}

/** Notify other browser tabs that auth state changed. */
export function notifyAuthSync(event = AuthSyncEvent.UPDATED) {
  // Skip revision bump on logout — storage + channel already signal logout; avoids extra UPDATED noise.
  if (event !== AuthSyncEvent.LOGOUT) {
    try {
      localStorage.setItem(AUTH_REVISION_KEY, String(Date.now()))
    } catch {
      // ignore quota / private mode
    }
  }

  try {
    channel?.postMessage({ event, tabId: TAB_ID, at: Date.now() })
  } catch {
    // ignore
  }
}

/** Listen for auth changes from other tabs (login, logout, token refresh). */
export function subscribeAuthSync(onSync) {
  const handleMessage = (message) => {
    if (message?.data?.tabId === TAB_ID) return
    onSync(message.data)
  }

  const handleStorage = (event) => {
    // Logout flag is SET on sign-out; clearing it on login must not be treated as logout.
    if (event.key === AUTH_LOGOUT_KEY && event.newValue) {
      onSync({ event: AuthSyncEvent.LOGOUT, fromStorage: true })
      return
    }

    if (event.key === AUTH_STORAGE_KEY && event.newValue == null && event.oldValue) {
      onSync({ event: AuthSyncEvent.LOGOUT, fromStorage: true })
      return
    }

    if (event.key === AUTH_STORAGE_KEY && event.newValue) {
      onSync({ event: AuthSyncEvent.LOGIN, fromStorage: true })
      return
    }

    if (event.key === AUTH_REVISION_KEY && event.newValue) {
      onSync({ event: AuthSyncEvent.UPDATED, fromStorage: true })
    }
  }

  channel?.addEventListener('message', handleMessage)
  window.addEventListener('storage', handleStorage)

  return () => {
    channel?.removeEventListener('message', handleMessage)
    window.removeEventListener('storage', handleStorage)
  }
}

export function getTabId() {
  return TAB_ID
}
