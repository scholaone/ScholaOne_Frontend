import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { setAuthHandlers } from '@/api/axios'
import { authService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { AuthSyncEvent, notifyAuthSync, subscribeAuthSync } from '@/utils/authSync'
import {
  bootstrapStoredSession,
  hasRefreshableSession,
  hydrateAuthSession,
  persistAuthSession,
  readAuthSession,
  refreshStoredSession,
} from '@/utils/authSession'
import {
  clearAuth,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  loadAuth,
} from '@/utils/storage'
import { isTokenExpired } from '@/utils/jwt'
import { prefetchPostLoginData } from '@/utils/prefetchDashboard'
import { getPostLoginPath, getUserPrimaryRole, isStudentPortalUser, isTeacherPortalUser } from '@/utils/authRoles'

const AuthContext = createContext(null)

const TOKEN_CHECK_MS = 30_000

function buildAuthState(saved, { isHydrated = true, isLoading = false, isLoggingOut = false } = {}) {
  if (!saved?.accessToken) {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      rememberMe: false,
      isAuthenticated: false,
      isLoading,
      isLoggingOut,
      isHydrated,
    }
  }

  return {
    user: saved.user || null,
    accessToken: saved.accessToken,
    refreshToken: saved.refreshToken,
    rememberMe: saved.rememberMe || false,
    isAuthenticated: true,
    isLoading,
    isLoggingOut,
    isHydrated,
  }
}

function initialAuthState() {
  const saved = bootstrapStoredSession()
  if (saved) return buildAuthState(saved)

  if (hasRefreshableSession()) {
    return buildAuthState(null, { isHydrated: false, isLoading: true })
  }

  return buildAuthState(null)
}

function resolveUserId(user) {
  if (!user) return null
  return user.user_id || user.id || user.email || user.username || null
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState(() => initialAuthState())
  const stateRef = useRef(state)
  const remoteLogoutHandledAtRef = useRef(0)
  const refreshInFlightRef = useRef(null)
  stateRef.current = state

  const isLoggedOut = useCallback(() => {
    return !stateRef.current.isAuthenticated && !loadAuth()?.accessToken
  }, [])

  const handleRemoteLogout = useCallback(() => {
    if (isLoggedOut()) return

    const now = Date.now()
    if (now - remoteLogoutHandledAtRef.current < 750) return
    remoteLogoutHandledAtRef.current = now

    clearAuth()
    setState(buildAuthState(null))
    queryClient.clear()
    toast('Signed out — session ended in another tab.')
  }, [queryClient, isLoggedOut])

  const forceLogoutLocal = useCallback(
    (options = {}) => {
      const { broadcast = false, notifyRemote = false, message = null } = options

      if (isLoggedOut()) {
        return
      }

      clearAuth()
      setState(buildAuthState(null))
      queryClient.clear()

      if (broadcast) {
        notifyAuthSync(AuthSyncEvent.LOGOUT)
      }

      if (notifyRemote) {
        toast(message || 'Signed out — session ended in another tab.')
      } else if (message) {
        toast(message)
      }
    },
    [queryClient, isLoggedOut],
  )

  const applyAuthFromStorage = useCallback(
    async (options = {}) => {
      const { silent = false } = options
      let valid = readAuthSession()

      if (!valid && hasRefreshableSession()) {
        valid = await refreshStoredSession()
      }

      if (!valid) {
        const raw = loadAuth()
        if (raw?.accessToken || raw?.refreshToken) {
          forceLogoutLocal({ broadcast: true, message: 'Your session has expired. Please sign in again.' })
          return 'logout'
        }
        setState(buildAuthState(null))
        queryClient.clear()
        return 'logout'
      }

      const nextState = buildAuthState(valid)
      const prevUserId = resolveUserId(stateRef.current.user)
      const nextUserId = resolveUserId(nextState.user)

      setState(nextState)

      if (nextUserId && nextUserId !== prevUserId) {
        queryClient.clear()
        if (!silent) {
          const label =
            nextState.user?.full_name ||
            `${nextState.user?.first_name || ''} ${nextState.user?.last_name || ''}`.trim() ||
            nextState.user?.email ||
            'another account'
          toast(`Session updated — signed in as ${label}`)
        }
      }

      return 'updated'
    },
    [queryClient, forceLogoutLocal],
  )

  useEffect(() => {
    return subscribeAuthSync(({ event }) => {
      if (event === AuthSyncEvent.LOGOUT) {
        handleRemoteLogout()
        return
      }

      if (event === AuthSyncEvent.LOGIN) {
        applyAuthFromStorage({ silent: true })
        return
      }

      applyAuthFromStorage({ silent: false })
    })
  }, [applyAuthFromStorage, handleRemoteLogout])

  const logout = useCallback(async () => {
    if (stateRef.current.isLoggingOut) return

    const refreshToken = stateRef.current.refreshToken || getStoredRefreshToken()
    const accessToken = stateRef.current.accessToken || getStoredAccessToken()

    setState((prev) => ({ ...prev, isLoggingOut: true }))

    // Clear local session immediately so the UI responds without waiting on the network.
    forceLogoutLocal({ broadcast: true })

    if (refreshToken) {
      void authService.logout(refreshToken, accessToken).catch(() => {
        // Server revoke is best-effort after local sign-out.
      })
    }
  }, [forceLogoutLocal])

  const updateTokens = useCallback(
    ({ accessToken, refreshToken }) => {
      if (accessToken && isTokenExpired(accessToken)) {
        forceLogoutLocal({ broadcast: true, message: 'Your session has expired. Please sign in again.' })
        return
      }

      setState((prev) => {
        const next = {
          ...prev,
          accessToken,
          refreshToken: refreshToken || prev.refreshToken,
          isAuthenticated: Boolean(accessToken),
        }
        persistAuthSession(next, prev.rememberMe)
        return next
      })
      notifyAuthSync(AuthSyncEvent.UPDATED)
    },
    [forceLogoutLocal],
  )

  const login = useCallback(
    async (credentials, rememberMe = false) => {
      try {
        const response = await authService.login(credentials)
        const data = unwrapData(response) || response?.data || response
        const user = data?.user
        const accessToken = data?.access_token || data?.access
        const refreshToken = data?.refresh_token || data?.refresh

        if (!accessToken) {
          throw new Error('Login succeeded but no access token was returned.')
        }

        if (isTokenExpired(accessToken)) {
          throw new Error('Login returned an expired access token.')
        }

        const next = {
          user,
          accessToken,
          refreshToken,
          rememberMe,
          isAuthenticated: true,
          isLoading: false,
          isLoggingOut: false,
          isHydrated: true,
        }

        persistAuthSession(next, rememberMe)

        setAuthHandlers({
          getAccessToken: () => accessToken,
          getRefreshToken: () => refreshToken,
          getUser: () => user,
          isSuperAdmin: () => Boolean(user?.is_super_admin),
          onTokensUpdated: updateTokens,
          onUnauthorized: () => forceLogoutLocal({ broadcast: true, message: 'Session expired. Please sign in again.' }),
        })

        // Commit auth before callers navigate — avoids ProtectedRoute bouncing back to /login.
        flushSync(() => {
          setState(next)
        })

        window.setTimeout(() => {
          queryClient.clear()
          notifyAuthSync(AuthSyncEvent.LOGIN)
          void prefetchPostLoginData(queryClient, user).catch(() => {})
        }, 0)

        return next
      } catch (error) {
        throw error
      }
    },
    [updateTokens, forceLogoutLocal, queryClient],
  )

  const refreshProfile = useCallback(async () => {
    const response = await authService.profile()
    const payload = unwrapData(response)
    const user = payload?.user || payload
    setState((prev) => {
      const next = { ...prev, user }
      persistAuthSession(next, prev.rememberMe)
      return next
    })
    notifyAuthSync(AuthSyncEvent.UPDATED)
  }, [])

  useEffect(() => {
    setAuthHandlers({
      getAccessToken: () => state.accessToken || getStoredAccessToken(),
      getRefreshToken: () => state.refreshToken || getStoredRefreshToken(),
      getUser: () => state.user || getStoredUser(),
      isSuperAdmin: () => Boolean(state.user?.is_super_admin),
      onTokensUpdated: updateTokens,
      onUnauthorized: () =>
        forceLogoutLocal({ broadcast: true, message: 'Session expired. Please sign in again.' }),
    })
  }, [state.accessToken, state.refreshToken, state.user, updateTokens, forceLogoutLocal])

  useEffect(() => {
    if (state.isHydrated) return undefined

    let active = true
    ;(async () => {
      const saved = await hydrateAuthSession()
      if (!active) return
      setState(buildAuthState(saved))
      if (saved) notifyAuthSync(AuthSyncEvent.UPDATED)
    })()

    return () => {
      active = false
    }
  }, [state.isHydrated])

  const trySilentRefresh = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current
    }

    const task = (async () => {
      const saved = await refreshStoredSession()
      if (!saved) {
        forceLogoutLocal({
          broadcast: true,
          message: 'Your session has expired. Please sign in again.',
        })
        return false
      }

      setState(buildAuthState(saved))
      notifyAuthSync(AuthSyncEvent.UPDATED)
      return true
    })().finally(() => {
      refreshInFlightRef.current = null
    })

    refreshInFlightRef.current = task
    return task
  }, [forceLogoutLocal])

  useEffect(() => {
    if (!state.isAuthenticated) return undefined

    const checkExpiry = async () => {
      const token = stateRef.current.accessToken || getStoredAccessToken()
      if (!token || !isTokenExpired(token)) return
      await trySilentRefresh()
    }

    void checkExpiry()
    const intervalId = window.setInterval(() => {
      void checkExpiry()
    }, TOKEN_CHECK_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void checkExpiry()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [state.isAuthenticated, trySilentRefresh])

  useEffect(() => {
    const onFocus = () => {
      void applyAuthFromStorage({ silent: true })
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [applyAuthFromStorage])

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      updateTokens,
      refreshProfile,
      isSuperAdmin: Boolean(state.user?.is_super_admin),
      isOrgAdmin: Boolean(state.user?.is_org_admin),
      isSchoolAdmin: Boolean(state.user?.is_school_admin),
      isStudent: isStudentPortalUser(state.user),
      isTeacher: isTeacherPortalUser(state.user),
      primaryRole: getUserPrimaryRole(state.user),
      getDashboardPath: () => getPostLoginPath(state.user),
    }),
    [state, login, logout, updateTokens, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
