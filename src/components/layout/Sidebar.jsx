import { useState, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiShield,
  FiMenu,
  FiDatabase,
  FiSettings,
  FiFileText,
  FiBell,
  FiLayers,
  FiBook,
  FiClipboard,
  FiUserCheck,
  FiMail,
  FiCpu,
  FiMessageSquare,
  FiZap,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiCreditCard,
  FiTruck,
  FiBookOpen,
  FiBarChart2,
  FiRadio,
  FiGitBranch,
  FiClock,
  FiGlobe,
  FiLayout,
  FiCheckCircle,
} from 'react-icons/fi'
import ScholaOneLogo from '@/components/brand/ScholaOneLogo'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { Avatar } from '@/components/ui/Feedback'
import { menuService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { modulesToNavItems, unwrapMenuModules } from '@/utils/navFromApi'
import { cn } from '@/lib/utils'
import { REPORT_MENU_ITEMS } from '@/config/reportDefinitions'

const reportIconMap = {
  'reports-overview': FiGrid,
  'staff-children': FiUsers,
  'class-wise-students': FiUsers,
  'attendance-reports': FiCalendar,
}

const reportNavChildren = REPORT_MENU_ITEMS.map((item) => ({
  id: item.id,
  label: item.label,
  path: item.path,
  icon: reportIconMap[item.id] || (item.id.startsWith('fee-') ? FiCreditCard : FiBarChart2),
}))

const iconMap = {
  dashboard: FiGrid,
  organizations: FiBriefcase,
  schools: FiBook,
  users: FiUsers,
  roles: FiShield,
  permissions: FiShield,
  menus: FiMenu,
  modules: FiLayers,
  masters: FiDatabase,
  'audit-logs': FiFileText,
  settings: FiSettings,
  notifications: FiBell,
  memberships: FiUsers,
  'user-roles': FiShield,
}

const superAdminNav = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: FiGrid },
  {
    id: 'management',
    label: 'Management',
    icon: FiBriefcase,
    children: [
      { id: 'organizations', label: 'Organizations', path: '/organizations', icon: FiBriefcase },
      { id: 'schools', label: 'Schools', path: '/schools', icon: FiBook },
      { id: 'users', label: 'Users', path: '/users', icon: FiUsers },
      { id: 'memberships', label: 'Memberships', path: '/memberships', icon: FiUsers },
    ],
  },
  {
    id: 'access',
    label: 'Access Control',
    icon: FiShield,
    children: [
      { id: 'roles', label: 'Roles', path: '/roles', icon: FiShield },
      { id: 'permissions', label: 'Permissions', path: '/permissions', icon: FiShield },
      { id: 'user-roles', label: 'User Roles', path: '/user-roles', icon: FiShield },
      { id: 'modules', label: 'Modules', path: '/modules', icon: FiLayers },
      { id: 'menus', label: 'Menus', path: '/menus', icon: FiMenu },
    ],
  },
  {
    id: 'masters',
    label: 'Master Data',
    icon: FiDatabase,
    children: [
      { id: 'masters-hub', label: 'Masters Hub', path: '/masters', icon: FiDatabase },
      { id: 'academics', label: 'Academic Structure', path: '/academics', icon: FiBook },
    ],
  },
  {
    id: 'ai',
    label: 'AI & Automation',
    icon: FiCpu,
    children: [
      { id: 'ai-hub', label: 'AI Hub', path: '/ai-hub', icon: FiCpu },
      { id: 'nexus-ai', label: 'ScholaOne AI', path: '/ai-hub/assistant', icon: FiMessageSquare },
      { id: 'automations', label: 'Automations', path: '/ai-hub/automations', icon: FiZap },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: FiSettings,
    children: [
      { id: 'edu-post', label: 'ScholaOne Post', path: '/scholaone-post', icon: FiMail },
      { id: 'audit', label: 'Audit Logs', path: '/audit-logs', icon: FiFileText },
      { id: 'settings', label: 'Settings', path: '/settings', icon: FiSettings },
      { id: 'notifications', label: 'Notifications', path: '/notifications', icon: FiBell },
    ],
  },
]

const orgAdminNav = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: FiGrid },
  {
    id: 'management',
    label: 'Management',
    icon: FiBriefcase,
    children: [
      { id: 'schools', label: 'Schools', path: '/schools', icon: FiBook },
      { id: 'users', label: 'Users', path: '/users', icon: FiUsers },
      { id: 'memberships', label: 'Memberships', path: '/memberships', icon: FiUsers },
    ],
  },
  {
    id: 'access',
    label: 'Access Control',
    icon: FiShield,
    children: [
      { id: 'roles', label: 'Roles', path: '/roles', icon: FiShield },
      { id: 'user-roles', label: 'User Roles', path: '/user-roles', icon: FiShield },
    ],
  },
  {
    id: 'masters',
    label: 'Master Data',
    icon: FiDatabase,
    children: [
      { id: 'masters-hub', label: 'Masters Hub', path: '/masters', icon: FiDatabase },
      { id: 'academics', label: 'Academic Structure', path: '/academics', icon: FiBook },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: FiSettings,
    children: [
      { id: 'audit', label: 'Audit Logs', path: '/audit-logs', icon: FiFileText },
      { id: 'notifications', label: 'Notifications', path: '/notifications', icon: FiBell },
    ],
  },
]

const schoolAdminNav = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: FiGrid },
  {
    id: 'admissions',
    label: 'Admissions',
    icon: FiClipboard,
    children: [
      { id: 'adm-overview', label: 'Overview', path: '/admissions', icon: FiGrid },
      { id: 'adm-setup', label: 'Setup', path: '/admissions/setup', icon: FiSettings },
      { id: 'adm-enquiries', label: 'Enquiries', path: '/admissions/enquiries', icon: FiMessageSquare },
      { id: 'adm-pipeline', label: 'Pipeline', path: '/admissions/pipeline', icon: FiGitBranch },
      { id: 'adm-followups', label: 'Follow-ups', path: '/admissions/follow-ups', icon: FiClock },
      { id: 'adm-internal', label: 'Applications', path: '/admissions/applications/internal', icon: FiFileText },
      { id: 'adm-external', label: 'External Apps', path: '/admissions/applications/external', icon: FiGlobe },
      { id: 'adm-confirmed', label: 'Confirmed', path: '/admissions/confirmed', icon: FiCheckCircle },
      { id: 'adm-conversion', label: 'Conversion', path: '/admissions/conversion', icon: FiUserCheck },
      { id: 'adm-forms', label: 'Form Builder', path: '/form-builder', icon: FiLayout },
    ],
  },
  { id: 'students', label: 'Students', path: '/students', icon: FiUsers },
  { id: 'teachers', label: 'Teachers', path: '/teachers', icon: FiUserCheck },
  { id: 'parents', label: 'Parents', path: '/parents', icon: FiUsers },
  {
    id: 'lms',
    label: 'LMS',
    icon: FiBookOpen,
    children: [
      { id: 'lms-courses', label: 'Courses', path: '/lms/courses', icon: FiBookOpen },
      { id: 'lms-assignments', label: 'Assignments', path: '/lms/assignments', icon: FiClipboard },
    ],
  },
  { id: 'attendance', label: 'Attendance', path: '/attendance', icon: FiCalendar },
  { id: 'timetable', label: 'Timetable', path: '/timetable', icon: FiCalendar },
  { id: 'homework', label: 'Homework', path: '/homework', icon: FiClipboard },
  { id: 'announcements', label: 'Announcements', path: '/announcements', icon: FiRadio },
  { id: 'examinations', label: 'Exams', path: '/examinations', icon: FiFileText },
  { id: 'fees', label: 'Fees', path: '/fees', icon: FiCreditCard },
  { id: 'transport', label: 'Transport', path: '/transport', icon: FiTruck },
  { id: 'library', label: 'Library', path: '/library', icon: FiBook },
  { id: 'documents', label: 'Documents', path: '/documents', icon: FiFileText },
  {
    id: 'reports',
    label: 'Reports',
    icon: FiBarChart2,
    children: reportNavChildren,
  },
  {
    id: 'school',
    label: 'School Admin',
    icon: FiBook,
    children: [
      { id: 'school-profile', label: 'School Profile', path: '/school-profile', icon: FiBook },
      { id: 'school-settings', label: 'School Settings', path: '/school-settings', icon: FiSettings },
      { id: 'school-masters', label: 'School Masters', path: '/school-masters', icon: FiDatabase },
      { id: 'staff', label: 'HRMS', path: '/staff', icon: FiUserCheck },
      { id: 'communications', label: 'Communications', path: '/communications', icon: FiMail },
      { id: 'school-users', label: 'School Users', path: '/school-users', icon: FiUsers },
    ],
  },
  {
    id: 'masters',
    label: 'Master Data',
    icon: FiDatabase,
    children: [
      { id: 'masters-hub', label: 'Masters Hub', path: '/masters', icon: FiDatabase },
      { id: 'academics', label: 'Academic Structure', path: '/academics', icon: FiBook },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: FiSettings,
    children: [
      { id: 'audit', label: 'Audit Logs', path: '/audit-logs', icon: FiFileText },
      { id: 'notifications', label: 'Notifications', path: '/notifications', icon: FiBell },
    ],
  },
]

function resolveNav({ isSuperAdmin, isOrgAdmin, isSchoolAdmin }) {
  if (isSuperAdmin) return superAdminNav
  if (isSchoolAdmin) return schoolAdminNav
  if (isOrgAdmin) return orgAdminNav
  return schoolAdminNav
}

function isNavItemActive(pathname, itemPath) {
  if (itemPath === '/ai-hub') return pathname === '/ai-hub'
  if (itemPath === '/admissions') {
    return pathname === '/admissions'
  }
  if (itemPath === '/lms/courses') {
    return pathname === '/lms/courses' || pathname.startsWith('/lms/courses/')
  }
  if (itemPath === '/lms/assignments') {
    return pathname === '/lms/assignments' || pathname.startsWith('/lms/assignments/')
  }
  if (itemPath === '/school-profile') {
    return pathname === '/school-profile' || /^\/schools\/[^/]+\/profile/.test(pathname)
  }
  if (itemPath === '/school-settings') {
    return pathname === '/school-settings' || pathname.startsWith('/school-settings/')
  }
  if (itemPath === '/schools') {
    return pathname.startsWith('/schools') && !/^\/schools\/[^/]+\/profile/.test(pathname)
  }
  if (itemPath === '/academics') {
    return pathname === '/academics' || pathname.startsWith('/academics/')
  }
  if (itemPath === '/school-users') {
    return pathname === '/school-users' || pathname.startsWith('/school-users/')
  }
  if (itemPath === '/admissions/enquiries') {
    return pathname.startsWith('/admissions/enquiries') || pathname.startsWith('/admissions/leads')
  }
  if (itemPath === '/admissions/applications/internal') {
    return (
      pathname.startsWith('/admissions/applications/internal') ||
      (pathname.startsWith('/admissions/applications') &&
        !pathname.startsWith('/admissions/applications/external'))
    )
  }
  if (itemPath === '/students') {
    return (
      (pathname === '/students' || pathname.startsWith('/students/'))
      && !pathname.startsWith('/students/reports/')
    )
  }
  if (itemPath === '/teachers') {
    return pathname === '/teachers' || pathname.startsWith('/teachers/')
  }
  if (itemPath === '/parents') {
    return pathname === '/parents' || pathname.startsWith('/parents/')
  }
  if (itemPath === '/staff') {
    return pathname === '/staff' || pathname.startsWith('/staff/')
  }
  if (itemPath === '/school-masters') {
    return pathname === '/school-masters' || pathname.startsWith('/school-masters/')
  }
  if (itemPath === '/communications') {
    return pathname === '/communications' || pathname.startsWith('/communications/')
  }
  if (itemPath === '/documents') {
    return pathname === '/documents' || pathname.startsWith('/documents/')
  }
  if (itemPath === '/reports') {
    return pathname === '/reports'
  }
  if (itemPath === '/fees') {
    return (
      (pathname === '/fees' || pathname.startsWith('/fees/'))
      && !pathname.startsWith('/fees/reports')
      && pathname !== '/fees/defaulters'
    )
  }
  if (itemPath === '/attendance') {
    return (
      (pathname === '/attendance' || pathname.startsWith('/attendance/'))
      && !pathname.startsWith('/attendance/reports')
    )
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}

function groupHasActiveChild(pathname, item) {
  if (!item.children) return isNavItemActive(pathname, item.path)
  return item.children.some((child) => isNavItemActive(pathname, child.path))
}

function SidebarNav({ items, collapsed, onNavigate }) {
  const location = useLocation()
  const [expanded, setExpanded] = useState(() =>
    items.filter((item) => item.children && groupHasActiveChild(location.pathname, item)).map((item) => item.id),
  )

  const toggleExpand = (id) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const Icon = item.icon || iconMap[item.path?.slice(1)] || FiGrid
        const hasChildren = item.children?.length > 0
        const active = hasChildren
          ? groupHasActiveChild(location.pathname, item)
          : isNavItemActive(location.pathname, item.path)
        const isExpanded = expanded.includes(item.id) || active

        if (hasChildren) {
          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <FiChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                  </>
                )}
              </button>
              {!collapsed && isExpanded && (
                <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-border pl-3">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon || FiGrid
                    return (
                      <NavLink
                        key={child.id}
                        to={child.path}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                            isActive || isNavItemActive(location.pathname, child.path)
                              ? 'bg-brand-50 font-medium text-brand-700'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          )
                        }
                      >
                        <ChildIcon className="h-4 w-4 shrink-0" />
                        {child.label}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        }

        return (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive || isNavItemActive(location.pathname, item.path)
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="flex-1">{item.label}</span>}
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function Sidebar({ mobile, onClose }) {
  const { user, isSuperAdmin, isOrgAdmin, isSchoolAdmin } = useAuth()
  const { sidebarCollapsed, toggleSidebar } = useUI()

  const usesDynamicSchoolNav = Boolean(
    isSchoolAdmin || (user?.school_id && !isSuperAdmin && !isOrgAdmin),
  )

  const dynamicMenusQuery = useQuery({
    queryKey: ['menus', 'my-menus', user?.id, user?.school_id || user?.school],
    queryFn: () => menuService.myMenus(),
    enabled: Boolean(usesDynamicSchoolNav && user?.id),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: 2,
  })

  const navItems = useMemo(() => {
    if (isSuperAdmin) return superAdminNav
    if (isOrgAdmin) return orgAdminNav
    if (usesDynamicSchoolNav) {
      if (dynamicMenusQuery.isSuccess) {
        const modules = unwrapMenuModules(unwrapData(dynamicMenusQuery.data))
        const items = modulesToNavItems(modules)
        if (items.length) return items
      }
      if (dynamicMenusQuery.isLoading) return []
      if (dynamicMenusQuery.isError) return schoolAdminNav
      return schoolAdminNav
    }
    return schoolAdminNav
  }, [
    isSuperAdmin,
    isOrgAdmin,
    usesDynamicSchoolNav,
    dynamicMenusQuery.isSuccess,
    dynamicMenusQuery.isLoading,
    dynamicMenusQuery.isError,
    dynamicMenusQuery.data,
  ])

  const collapsed = !mobile && sidebarCollapsed

  const displayName =
    user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'User'

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 flex-col border-r border-border bg-card transition-all duration-300',
        mobile ? 'w-72' : collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div
        className={cn(
          'border-b border-border',
          collapsed ? 'flex flex-col items-center gap-2 px-2 py-3' : 'flex h-16 items-center gap-3 px-4',
        )}
      >
        <ScholaOneLogo size={collapsed ? 'xs' : 'sm'} variant={collapsed ? 'icon' : 'full'} className={collapsed ? 'mx-auto' : undefined} />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">School ERP + LMS</p>
          </div>
        )}
        {!mobile && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <FiChevronRight className="h-4 w-4" /> : <FiChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <SidebarNav items={navItems} collapsed={collapsed} onNavigate={onClose} />
      </div>

      {!collapsed && (
        <div className="border-t border-border p-4">
          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-3">
              <Avatar name={displayName} src={user?.profile_image} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
