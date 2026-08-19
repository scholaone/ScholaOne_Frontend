import { unwrapMenuModules } from '@/utils/navFromApi'

/** Routes always reachable without an allocated menu entry. */
export const MENU_ACCESS_EXEMPT_PREFIXES = [
  '/dashboard',
  '/profile',
  '/change-password',
  '/notifications',
  '/menus/user-allocation',
  '/school-profile',
  '/school-settings',
]

function normalizePath(path) {
  if (!path) return ''
  const value = String(path).trim()
  if (!value || value === '#') return ''
  const withSlash = value.startsWith('/') ? value : `/${value}`
  if (withSlash.length > 1 && withSlash.endsWith('/')) {
    return withSlash.slice(0, -1)
  }
  return withSlash
}

export function collectMenuPaths(modules = []) {
  const paths = new Set()

  const walk = (menus) => {
    menus?.forEach((menu) => {
      const path = normalizePath(menu.url)
      if (path) paths.add(path)
      walk(menu.children)
    })
  }

  modules.forEach((module) => walk(module.menus))
  return paths
}

export function collectMenuPathsFromPayload(payload) {
  return collectMenuPaths(unwrapMenuModules(payload))
}

export function isMenuAccessExempt(pathname) {
  const path = normalizePath(pathname)
  return MENU_ACCESS_EXEMPT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  )
}

export function isPathAllowedByMenus(pathname, allowedPaths) {
  const path = normalizePath(pathname)
  if (!path) return true
  if (isMenuAccessExempt(path)) return true

  for (const allowed of allowedPaths) {
    if (path === allowed || path.startsWith(`${allowed}/`)) {
      return true
    }
  }
  return false
}
