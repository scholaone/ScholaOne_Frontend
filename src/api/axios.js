import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT, TENANT_STORAGE_KEY } from '@/config/constants'
import { getStoredAccessToken, getStoredRefreshToken, getStoredUser } from '@/utils/storage'

if (import.meta.env.DEV) {
  console.info('[ScholaOne] API base:', API_BASE_URL || '(vite proxy → /api)')
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

let authHandlers = null

export function setAuthHandlers(handlers) {
  authHandlers = handlers
}

export function getAuthHandlers() {
  return authHandlers
}

let isRefreshing = false
let refreshQueue = []

function processRefreshQueue(token) {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

const PUBLIC_PATHS = ['/api/auth/login/', '/api/auth/refresh/', '/api/v1/public/forms/']

function isPublicAuthRequest(url) {
  return PUBLIC_PATHS.some((path) => url?.includes(path))
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i

function resolveAccessToken() {
  return authHandlers?.getAccessToken?.() || getStoredAccessToken()
}

function resolveRefreshToken() {
  return authHandlers?.getRefreshToken?.() || getStoredRefreshToken()
}

function resolveTenantHeader() {
  const user = authHandlers?.getUser?.() || getStoredUser()
  const fromUser = user?.organization_id || user?.organization
  if (fromUser) {
    const id = typeof fromUser === 'object' ? fromUser?.id : fromUser
    if (typeof id === 'string' && UUID_RE.test(id)) return id
  }

  try {
    const raw = localStorage.getItem(TENANT_STORAGE_KEY)
    if (raw) {
      const tenant = JSON.parse(raw)
      const tenantId = tenant?.organizationId
      if (typeof tenantId === 'string' && UUID_RE.test(tenantId)) return tenantId
    }
  } catch {
    // ignore malformed tenant storage
  }

  const schoolOrgId = user?.school?.organization || user?.school?.organization_id
  if (schoolOrgId) {
    const id = typeof schoolOrgId === 'object' ? schoolOrgId?.id : schoolOrgId
    if (typeof id === 'string' && UUID_RE.test(id)) return id
  }

  return null
}

function setAuthHeader(config, token) {
  if (!token) return
  if (config.headers?.set) {
    config.headers.set('Authorization', `Bearer ${token}`)
  } else {
    config.headers.Authorization = `Bearer ${token}`
  }
}

axiosInstance.interceptors.request.use((config) => {
  if (!isPublicAuthRequest(config.url)) {
    const token = resolveAccessToken()
    setAuthHeader(config, token)
  }

  const user = authHandlers?.getUser?.() || getStoredUser()
  const isSuperAdmin = user?.is_super_admin === true
  if (!isSuperAdmin) {
    const tenantId = resolveTenantHeader()
    if (tenantId) {
      if (config.headers?.set) {
        config.headers.set('X-Tenant-ID', tenantId)
      } else {
        config.headers['X-Tenant-ID'] = tenantId
      }
    }
  }

  if (config.data instanceof FormData) {
    if (config.headers?.delete) {
      config.headers.delete('Content-Type')
    } else if (config.headers) {
      delete config.headers['Content-Type']
    }
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest || originalRequest._retry || originalRequest.skipAuthRefresh) {
      return Promise.reject(error)
    }
    if (error.response?.status !== 401 || isPublicAuthRequest(originalRequest.url)) {
      return Promise.reject(error)
    }

    const refreshToken = resolveRefreshToken()
    if (!refreshToken) {
      authHandlers?.onUnauthorized?.()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error)
            return
          }
          setAuthHeader(originalRequest, token)
          resolve(axiosInstance(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/refresh/`,
        { refresh: refreshToken },
      )
      const body = response.data
      const inner = body?.data || body
      const accessToken = inner.access_token || inner.access
      const newRefresh = inner.refresh_token || inner.refresh || refreshToken
      if (!accessToken) throw new Error('Refresh failed')

      authHandlers?.onTokensUpdated?.({ accessToken, refreshToken: newRefresh })
      processRefreshQueue(accessToken)
      setAuthHeader(originalRequest, accessToken)
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processRefreshQueue(null)
      authHandlers?.onUnauthorized?.()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default axiosInstance
