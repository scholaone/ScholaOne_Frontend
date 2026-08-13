import axiosInstance from './axios'
import { API_BASE_URL } from '@/config/constants'

export function buildQuery(params = {}) {
  const query = {}
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query[key] = value
    }
  })
  return query
}

export async function apiGet(url, params, config) {
  const { params: configParams, ...restConfig } = config ?? {}
  const mergedParams = buildQuery({ ...(configParams ?? {}), ...(params ?? {}) })
  const response = await axiosInstance.get(url, { params: mergedParams, ...restConfig })
  return response.data
}

export async function apiGetPaginated(url, params, config) {
  const { params: configParams, ...restConfig } = config ?? {}
  const mergedParams = buildQuery({ ...(configParams ?? {}), ...(params ?? {}) })
  const response = await axiosInstance.get(url, { params: mergedParams, ...restConfig })
  return response.data
}

export async function apiPost(url, body, config) {
  const { params: configParams, ...restConfig } = config ?? {}
  const mergedParams = buildQuery(configParams ?? {})
  const response = await axiosInstance.post(url, body, {
    ...restConfig,
    ...(Object.keys(mergedParams).length ? { params: mergedParams } : {}),
  })
  return response.data
}

export async function apiPatch(url, body, config) {
  const response = await axiosInstance.patch(url, body, config)
  return response.data
}

export async function apiPostForm(url, formData, config) {
  const response = await axiosInstance.post(url, formData, {
    ...config,
    headers: {
      ...(config?.headers || {}),
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function apiPatchForm(url, formData, config) {
  const response = await axiosInstance.patch(url, formData, {
    ...config,
    headers: {
      ...(config?.headers || {}),
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function apiPut(url, body, config) {
  const response = await axiosInstance.put(url, body, config)
  return response.data
}

export async function apiDelete(url, config) {
  const response = await axiosInstance.delete(url, config)
  return response.data
}

export async function apiGetBlob(url, params, config) {
  const { params: configParams, ...restConfig } = config ?? {}
  const mergedParams = buildQuery({ ...(configParams ?? {}), ...(params ?? {}) })
  try {
    const response = await axiosInstance.get(url, {
      params: mergedParams,
      responseType: 'blob',
      ...restConfig,
    })
    return response.data
  } catch (error) {
    const data = error?.response?.data
    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      try {
        const text = await data.text()
        try {
          error.response.data = JSON.parse(text)
        } catch {
          error.response.data = { detail: text }
        }
      } catch {
        // keep original blob if parsing fails
      }
    }
    throw error
  }
}

export function unwrapData(response) {
  if (!response || typeof response !== 'object') return response

  // { status, message, data } envelope from api_response()
  if (response.data !== undefined && (response.status !== undefined || response.message !== undefined)) {
    return response.data
  }

  // { success, data } variant
  if (response.success === true && response.data !== undefined) {
    return response.data
  }

  return response
}

export function unwrapList(response) {
  const raw = response?.data !== undefined && response?.results === undefined ? response : unwrapData(response)

  if (Array.isArray(raw)) return { results: raw, count: raw.length }

  // Paginated: { success, count, results } or { count, results }
  if (raw?.results) {
    return {
      results: raw.results,
      count: raw.count ?? raw.results.length,
      next: raw.next,
      previous: raw.previous,
    }
  }

  if (raw?.data?.results) {
    return {
      results: raw.data.results,
      count: raw.data.count ?? raw.data.results.length,
    }
  }

  return { results: [], count: 0 }
}

export function getErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data
  const status = error?.response?.status

  if (typeof data === 'string' && data.trim()) return data

  if (typeof data?.message === 'string' && data.message) {
    // Append first bulk-validation detail when present
    const bulkErrors = data?.data?.errors || data?.errors
    if (Array.isArray(bulkErrors) && bulkErrors[0]?.errors) {
      const fieldErrors = bulkErrors[0].errors
      const key = Object.keys(fieldErrors)[0]
      if (key) {
        const val = fieldErrors[key]
        const msg = Array.isArray(val) ? val[0] : val
        return `${data.message}${msg ? ` (${key}: ${msg})` : ''}`
      }
    }
    return data.message
  }
  if (typeof data?.detail === 'string' && data.detail) return data.detail

  // Backend custom handler: { success: false, error: { message, details } }
  if (typeof data?.error?.message === 'string' && data.error.message) {
    const details = data?.error?.details ?? data?.errors
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      const fileMsg = details.file
      if (Array.isArray(fileMsg) && fileMsg[0]) return String(fileMsg[0])
      if (typeof fileMsg === 'string' && fileMsg) return fileMsg
    }
    return data.error.message
  }

  const nestedDetail = data?.data?.detail ?? data?.errors?.detail
  if (Array.isArray(nestedDetail) && nestedDetail[0]) return String(nestedDetail[0])
  if (typeof nestedDetail === 'string' && nestedDetail) return nestedDetail

  if (status === 403) return 'You do not have permission to access this resource.'
  if (status === 401) return 'Session expired. Please sign in again.'
  if (status === 406) return 'Could not download file — server format mismatch. Refresh and try again.'
  if (status === 405) return 'This action is not allowed on the server route. Restart the backend after updates.'
  if (status === 404) {
    return 'API route not found. Start the Django backend (python manage.py runserver) or check VITE_API_BASE_URL.'
  }

  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    const target = API_BASE_URL || 'http://127.0.0.1:8000'
    return `Cannot reach the backend API at ${target}. Start Django (python manage.py runserver) or update VITE_API_BASE_URL in .env and restart npm run dev.`
  }

  if (typeof data === 'object' && data !== null) {
    const firstKey = Object.keys(data)[0]
    if (firstKey) {
      const val = data[firstKey]
      if (Array.isArray(val) && val[0]) return String(val[0])
      if (typeof val === 'string') return val
    }
  }

  if (error?.message && !error.message.startsWith('Request failed with status code')) {
    return error.message
  }

  return fallback
}
