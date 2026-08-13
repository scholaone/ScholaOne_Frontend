import {
  FiBarChart2,
  FiBell,
  FiBook,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiCreditCard,
  FiDatabase,
  FiFileText,
  FiGitBranch,
  FiGlobe,
  FiGrid,
  FiLayout,
  FiLayers,
  FiMail,
  FiMessageSquare,
  FiRadio,
  FiSettings,
  FiTruck,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi'
import { unwrapData } from '@/api/client'

const ICON_MAP = {
  grid: FiGrid,
  clipboard: FiClipboard,
  users: FiUsers,
  'user-check': FiUserCheck,
  'book-open': FiBookOpen,
  calendar: FiCalendar,
  radio: FiRadio,
  'file-text': FiFileText,
  'credit-card': FiCreditCard,
  truck: FiTruck,
  book: FiBook,
  'bar-chart-2': FiBarChart2,
  database: FiDatabase,
  settings: FiSettings,
  'message-square': FiMessageSquare,
  'git-branch': FiGitBranch,
  clock: FiClock,
  globe: FiGlobe,
  'check-circle': FiCheckCircle,
  layout: FiLayout,
  layers: FiLayers,
  mail: FiMail,
  bell: FiBell,
}

export function resolveNavIcon(name) {
  if (!name) return FiGrid
  return ICON_MAP[String(name).toLowerCase()] || FiGrid
}

function mapMenuNode(menu) {
  const children = (menu.children || []).map(mapMenuNode)
  if (children.length) {
    return {
      id: menu.menu_code || menu.menu_id,
      label: menu.menu_name,
      path: menu.url || undefined,
      icon: resolveNavIcon(menu.icon),
      children: children.map((child) => ({
        id: child.id,
        label: child.label,
        path: child.path,
        icon: child.icon,
      })),
    }
  }
  return {
    id: menu.menu_code || menu.menu_id,
    label: menu.menu_name,
    path: menu.url || undefined,
    icon: resolveNavIcon(menu.icon),
  }
}

/** Convert my-menus / school-admin-tree API modules into Sidebar nav items. */
export function modulesToNavItems(modules = []) {
  const sorted = [...modules].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
  const items = []

  sorted.forEach((module) => {
    const roots = module.menus || []
    if (!roots.length) return

    if (roots.length === 1) {
      const mapped = mapMenuNode(roots[0])
      if (mapped.children?.length) {
        items.push({
          id: module.module_code || module.module_id,
          label: mapped.label || module.module_name,
          icon: mapped.icon || resolveNavIcon(module.icon),
          children: mapped.children,
        })
      } else if (mapped.path) {
        items.push({
          id: mapped.id,
          label: mapped.label,
          path: mapped.path,
          icon: mapped.icon,
        })
      }
      return
    }

    items.push({
      id: module.module_code || module.module_id,
      label: module.module_name,
      icon: resolveNavIcon(module.icon),
      children: roots.map((root) => {
        const mapped = mapMenuNode(root)
        return {
          id: mapped.id,
          label: mapped.label,
          path: mapped.path,
          icon: mapped.icon,
          children: mapped.children,
        }
      }).filter((entry) => entry.path || entry.children?.length),
    })
  })

  return items
}

export function unwrapMenuModules(payload) {
  if (!payload) return []
  const unwrapped = unwrapData(payload)
  if (Array.isArray(unwrapped?.modules)) return unwrapped.modules
  if (Array.isArray(unwrapped?.data?.modules)) return unwrapped.data.modules
  if (Array.isArray(payload?.modules)) return payload.modules
  if (Array.isArray(payload?.data?.modules)) return payload.data.modules
  return []
}
