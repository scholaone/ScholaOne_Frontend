import axios from 'axios'
import { API_BASE_URL } from '@/config/constants'
import { unwrapData } from '@/api/client'
import { clearAuth, getStoredAccessToken, loadAuth, saveAuth } from '@/utils/storage'
import { isRefreshTokenExpired, isTokenExpired } from '@/utils/jwt'

/** Sync token check for route guards — avoids a context/state timing gap right after login. */
export function hasValidStoredAccessToken() {
  const token = getStoredAccessToken()
  return Boolean(token && !isTokenExpired(token))
}

/** Validate persisted session when access token is still valid. */
export function validateStoredSession(saved) {
  if (!saved?.accessToken) return null
  if (isTokenExpired(saved.accessToken)) return null
  return saved
}

/** Synchronous bootstrap — valid access token only (refresh handled on hydrate). */
export function bootstrapStoredSession() {
  return validateStoredSession(loadAuth())
}

export function persistAuthSession(auth, rememberMe) {
  saveAuth(
    {
      user: auth.user,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      rememberMe,
    },
    rememberMe,
  )
}

export function readAuthSession() {
  return validateStoredSession(loadAuth())
}

/** Exchange refresh token for a new access token (and rotated refresh when enabled). */
export async function refreshStoredSession(saved = loadAuth()) {
  if (!saved?.refreshToken) {
    clearAuth()
    return null
  }

  if (isRefreshTokenExpired(saved.refreshToken)) {
    clearAuth()
    return null
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/refresh/`,
      { refresh: saved.refreshToken },
      {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 30000,
      },
    )

    const data = unwrapData(response.data) || response.data?.data || response.data
    const accessToken = data?.access_token || data?.access
    const refreshToken = data?.refresh_token || data?.refresh || saved.refreshToken

    if (!accessToken || isTokenExpired(accessToken)) {
      throw new Error('Refresh returned an invalid access token')
    }

    const next = {
      ...saved,
      accessToken,
      refreshToken,
    }
    persistAuthSession(next, saved.rememberMe)
    return next
  } catch {
    clearAuth()
    return null
  }
}

/**
 * Restore session on app load — uses valid access token or silently refreshes.
 */
export async function hydrateAuthSession() {
  const raw = loadAuth()
  if (!raw) return null

  if (raw.accessToken && !isTokenExpired(raw.accessToken)) {
    return raw
  }

  return refreshStoredSession(raw)
}

/** True when storage has a refresh token that may restore the session. */
export function hasRefreshableSession() {
  const raw = loadAuth()
  return Boolean(raw?.refreshToken && !isRefreshTokenExpired(raw.refreshToken))
}
