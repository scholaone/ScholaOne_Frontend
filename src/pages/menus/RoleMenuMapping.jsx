import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { menuService } from '@/api/services'
import { unwrapData, getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { getUserOrganizationId, getUserSchoolId } from '@/utils/schoolScope'
import { resolveNavIcon } from '@/utils/navFromApi'
import { Card } from '@/components/ui/Card'
import { ErrorState, PageLoader } from '@/components/ui/Feedback'
import { cn } from '@/lib/utils'
import {
  NavPageShell,
  NavScopeBar,
  NavStatPill,
  ToggleSwitch,
  StatusBadge,
  SequenceStepper,
  SequenceInput,
  EmptyNavState,
  Button,
  SelectField,
  FiChevronDown,
  FiChevronUp,
  FiLink,
} from '@/components/navigation/NavAdminUi'

function countMenus(menus = []) {
  return menus.reduce((acc, menu) => acc + 1 + countMenus(menu.children), 0)
}

function MenuTreeRows({
  menus,
  depth = 0,
  showRoleControls,
  onToggle,
  onSequenceChange,
  togglingMenuId,
  savingMenuId,
}) {
  if (!menus?.length) return null

  return (
    <div className="relative">
      {menus.map((menu) => {
        const menuId = menu.menu_id || menu.id
        const isToggling = togglingMenuId === menuId
        const isSaving = savingMenuId === menuId
        const disabled = showRoleControls && !menu.school_role_menu_id
        const active = menu.is_enabled !== false

        return (
          <div key={menuId || menu.menu_code} className="relative">
            {depth > 0 && (
              <span
                className="pointer-events-none absolute bottom-0 top-0 w-px bg-border/80"
                style={{ left: `${12 + (depth - 1) * 24}px` }}
              />
            )}
            <div
              className={cn(
                'group flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-3 transition-colors last:border-b-0',
                showRoleControls && !active && 'bg-muted/30',
                'hover:bg-muted/20',
              )}
              style={{ paddingLeft: `${16 + depth * 24}px` }}
            >
              {showRoleControls ? (
                <SequenceInput
                  value={menu.sequence}
                  disabled={disabled || isSaving}
                  onSave={(sequence) => onSequenceChange(menu, { sequence })}
                />
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60 text-xs font-semibold tabular-nums text-muted-foreground">
                  {menu.sequence}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{menu.menu_name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="font-mono">{menu.menu_code}</span>
                  {menu.url ? (
                    <span className="inline-flex max-w-[220px] items-center gap-1 truncate">
                      <FiLink className="h-3 w-3 shrink-0" />
                      {menu.url}
                    </span>
                  ) : null}
                </div>
              </div>

              {showRoleControls && (
                <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 rounded-lg bg-background px-2 py-1 ring-1 ring-border/60">
                    <ToggleSwitch
                      checked={Boolean(menu.is_enabled)}
                      disabled={disabled || isToggling}
                      onChange={(checked) => onToggle(menu, checked)}
                      label={`Toggle ${menu.menu_name}`}
                    />
                    <StatusBadge active={active} size="sm" />
                  </div>
                </div>
              )}
            </div>

            <MenuTreeRows
              menus={menu.children}
              depth={depth + 1}
              showRoleControls={showRoleControls}
              onToggle={onToggle}
              onSequenceChange={onSequenceChange}
              togglingMenuId={togglingMenuId}
              savingMenuId={savingMenuId}
            />
          </div>
        )
      })}
    </div>
  )
}

function ModuleAccordion({
  module,
  moduleIndex,
  modulesLength,
  showRoleControls,
  expanded,
  onToggleExpand,
  onModuleToggle,
  onModuleUpdate,
  onModuleMove,
  onMenuToggle,
  onMenuSequenceChange,
  togglingModuleId,
  savingModuleId,
  togglingMenuId,
  savingMenuId,
}) {
  const Icon = resolveNavIcon(module.icon)
  const moduleId = module.module_id || module.id
  const moduleDisabled = showRoleControls && !module.school_role_module_id
  const moduleSaving = savingModuleId === moduleId
  const moduleToggling = togglingModuleId === moduleId
  const active = module.is_enabled !== false
  const menuCount = countMenus(module.menus)

  return (
    <Card
      padding={false}
      className={cn(
        'overflow-hidden transition-shadow',
        showRoleControls && !active && 'opacity-90',
      )}
    >
      <div
        className={cn(
          'flex cursor-pointer flex-wrap items-center gap-3 px-4 py-4 transition-colors sm:px-5',
          expanded ? 'bg-gradient-to-r from-brand-50/80 to-emerald-50/40' : 'bg-muted/20 hover:bg-muted/40',
        )}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggleExpand()
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm',
            active ? 'bg-white text-brand-600 ring-1 ring-brand-100' : 'bg-slate-100 text-slate-400',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{module.module_name}</h3>
            <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border/60">
              {menuCount}
              {' '}
              {menuCount === 1 ? 'menu' : 'menus'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{module.module_code}</p>
        </div>

        {showRoleControls && (
          <div
            className="flex flex-wrap items-center gap-2"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <SequenceStepper
              value={module.sequence}
              disabled={moduleDisabled || moduleSaving}
              onSave={(sequence) => onModuleUpdate(module, { sequence })}
              onMoveUp={() => onModuleMove(module, 'up')}
              onMoveDown={() => onModuleMove(module, 'down')}
              canMoveUp={!moduleDisabled && moduleIndex > 0}
              canMoveDown={!moduleDisabled && moduleIndex < modulesLength - 1}
            />
            <div className="flex items-center gap-2 rounded-lg bg-background px-2 py-1 ring-1 ring-border/60">
              <ToggleSwitch
                checked={Boolean(module.is_enabled)}
                disabled={moduleDisabled || moduleToggling}
                onChange={(checked) => onModuleToggle(module, checked)}
                label={`Toggle ${module.module_name}`}
              />
              <StatusBadge active={active} size="sm" />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand()
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          title={expanded ? 'Collapse module' : 'Expand module'}
          aria-label={expanded ? 'Collapse module' : 'Expand module'}
          aria-expanded={expanded}
        >
          {expanded ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border/50">
          {module.menus?.length ? (
            <MenuTreeRows
              menus={module.menus}
              showRoleControls={showRoleControls}
              onToggle={onMenuToggle}
              onSequenceChange={onMenuSequenceChange}
              togglingMenuId={togglingMenuId}
              savingMenuId={savingMenuId}
            />
          ) : (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No menus in this module.
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default function RoleMenuMapping() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userOrgId = getUserOrganizationId(user)
  const userSchoolId = getUserSchoolId(user)
  const [organizationId, setOrganizationId] = useState(userOrgId)
  const [schoolId, setSchoolId] = useState(userSchoolId)
  const [roleId, setRoleId] = useState('')
  const [expandedModules, setExpandedModules] = useState({})
  const [togglingMenuId, setTogglingMenuId] = useState(null)
  const [togglingModuleId, setTogglingModuleId] = useState(null)
  const [savingMenuId, setSavingMenuId] = useState(null)
  const [savingModuleId, setSavingModuleId] = useState(null)

  useEffect(() => {
    if (userOrgId) setOrganizationId(userOrgId)
    if (userSchoolId) setSchoolId(userSchoolId)
  }, [userOrgId, userSchoolId])

  const rolesQuery = useQuery({
    queryKey: ['menus', 'portal-roles', organizationId],
    queryFn: () => menuService.portalRoles({ organization: organizationId }),
    enabled: Boolean(organizationId),
  })

  const roleOptions = useMemo(() => {
    const roles = unwrapData(rolesQuery.data)?.roles ?? []
    return roles.map((role) => ({
      label: role.role_name,
      value: role.id,
    }))
  }, [rolesQuery.data])

  useEffect(() => {
    setRoleId('')
    setExpandedModules({})
  }, [schoolId])

  useEffect(() => {
    if (roleId) return
    if (roleOptions.length === 1) setRoleId(roleOptions[0].value)
  }, [roleId, roleOptions])

  const treeQuery = useQuery({
    queryKey: ['menus', 'school-role-tree', organizationId, schoolId, roleId],
    queryFn: () =>
      menuService.schoolRoleTree({
        organization: organizationId,
        school: schoolId,
        role: roleId,
      }),
    enabled: Boolean(organizationId && schoolId && roleId),
  })

  const invalidateRoleNav = () => {
    queryClient.invalidateQueries({ queryKey: ['menus', 'school-role-tree'] })
    queryClient.invalidateQueries({ queryKey: ['menus', 'my-menus'] })
  }

  const menuMutation = useMutation({
    mutationFn: (payload) => menuService.updateSchoolRoleMapping(payload),
    onSuccess: () => {
      invalidateRoleNav()
      toast.success('Menu updated for this user type')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to update menu')),
    onSettled: () => {
      setTogglingMenuId(null)
      setSavingMenuId(null)
    },
  })

  const moduleMutation = useMutation({
    mutationFn: (payload) => menuService.updateSchoolRoleModule(payload),
    onSuccess: () => {
      invalidateRoleNav()
      toast.success('Module updated for this user type')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to update module')),
    onSettled: () => {
      setTogglingModuleId(null)
      setSavingModuleId(null)
    },
  })

  const treePayload = useMemo(() => unwrapData(treeQuery.data), [treeQuery.data])
  const modules = useMemo(() => {
    const list = treePayload?.modules ?? []
    return [...list].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
  }, [treePayload?.modules])
  const showRoleControls = Boolean(schoolId && roleId)

  useEffect(() => {
    if (!modules.length) return
    setExpandedModules((prev) => {
      const next = { ...prev }
      modules.slice(0, 3).forEach((m) => {
        const id = String(m.module_id || m.id)
        if (next[id] === undefined) next[id] = true
      })
      return next
    })
  }, [modules])

  const stats = useMemo(() => {
    const totalMenus = modules.reduce((acc, m) => acc + countMenus(m.menus), 0)
    const activeMenus = modules.reduce((acc, module) => {
      const countActive = (menus) =>
        menus.reduce((sum, menu) => {
          let n = menu.is_enabled !== false ? 1 : 0
          if (menu.children?.length) n += countActive(menu.children)
          return sum + n
        }, 0)
      return acc + countActive(module.menus || [])
    }, 0)
    const activeModules = modules.filter((m) => m.is_enabled !== false).length
    return { modules: modules.length, menus: totalMenus, activeMenus, activeModules }
  }, [modules])

  const handleMenuToggle = (menu, isEnabled) => {
    if (!schoolId || !roleId) return
    setTogglingMenuId(menu.menu_id || menu.id)
    menuMutation.mutate({
      school: schoolId,
      role: roleId,
      menu: menu.menu_id || menu.id,
      is_enabled: isEnabled,
      organization: organizationId,
    })
  }

  const handleMenuUpdate = (menu, updates) => {
    if (!schoolId || !roleId) return
    setSavingMenuId(menu.menu_id || menu.id)
    menuMutation.mutate({
      school: schoolId,
      role: roleId,
      menu: menu.menu_id || menu.id,
      organization: organizationId,
      ...updates,
    })
  }

  const handleModuleToggle = (module, isEnabled) => {
    if (!schoolId || !roleId) return
    setTogglingModuleId(module.module_id || module.id)
    moduleMutation.mutate({
      school: schoolId,
      role: roleId,
      module: module.module_id || module.id,
      is_enabled: isEnabled,
      organization: organizationId,
    })
  }

  const handleModuleUpdate = (module, updates) => {
    if (!schoolId || !roleId) return
    setSavingModuleId(module.module_id || module.id)
    moduleMutation.mutate({
      school: schoolId,
      role: roleId,
      module: module.module_id || module.id,
      organization: organizationId,
      ...updates,
    })
  }

  const handleModuleMove = (module, direction) => {
    if (!schoolId || !roleId || !modules.length) return
    const moduleId = module.module_id || module.id
    const sorted = [...modules].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
    const index = sorted.findIndex((item) => (item.module_id || item.id) === moduleId)
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return

    const other = sorted[swapIndex]
    const moduleSeq = module.sequence ?? index + 1
    const otherSeq = other.sequence ?? swapIndex + 1

    setSavingModuleId(moduleId)
    moduleMutation.mutate({
      school: schoolId,
      role: roleId,
      module: moduleId,
      sequence: otherSeq,
      organization: organizationId,
    })
    moduleMutation.mutate({
      school: schoolId,
      role: roleId,
      module: other.module_id || other.id,
      sequence: moduleSeq,
      organization: organizationId,
    })
  }

  const toggleModuleExpand = (moduleId) => {
    const key = String(moduleId)
    setExpandedModules((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const isModuleExpanded = (moduleId) => Boolean(expandedModules[String(moduleId)])

  if (!organizationId || !schoolId) return <PageLoader />

  const selectedRoleLabel = roleOptions.find((r) => r.value === roleId)?.label
  const schoolLabel = user?.school_name || user?.school?.school_name || treePayload?.school_name || 'Your school'

  return (
    <NavPageShell breadcrumb={[{ label: 'Role Menu Mapping' }]}>
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-white px-6 py-6 text-foreground shadow-sm sm:px-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-50 blur-2xl" />
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">School admin</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Portal Menu Mapping</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Choose which modules and menus teachers, students, and parents see in their sidebar for
            {' '}
            <span className="font-medium text-foreground">{schoolLabel}</span>
            .
          </p>
        </div>
      </div>

      <NavScopeBar
        hint={
          showRoleControls
            ? `Mapping menus for ${selectedRoleLabel || 'selected user type'}. Only enabled items appear in that user type's sidebar.`
            : 'Select a user type below to configure their portal navigation.'
        }
      >
        <SelectField
          label="User type"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          options={[{ label: 'Select user type…', value: '' }, ...roleOptions]}
          disabled={rolesQuery.isLoading}
        />
      </NavScopeBar>

      {!roleId ? (
        <EmptyNavState
          title="Select a user type"
          description="Choose Teacher, Student, or Parent to map modules and menus for your school."
        />
      ) : treeQuery.isLoading ? (
        <PageLoader />
      ) : treeQuery.isError ? (
        <ErrorState message={getErrorMessage(treeQuery.error)} onRetry={treeQuery.refetch} />
      ) : !modules.length ? (
        <EmptyNavState
          title="No navigation catalog"
          description="Contact your organization administrator if modules are missing from this list."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-3xl">
            <NavStatPill label="Modules" value={stats.modules} />
            <NavStatPill label="Menus" value={stats.menus} />
            <NavStatPill label="Active modules" value={stats.activeModules} tone="success" />
            <NavStatPill label="Active menus" value={stats.activeMenus} tone="success" />
          </div>

          <div className="space-y-3">
            {modules.map((module, moduleIndex) => {
              const moduleId = module.module_id || module.id
              return (
                <ModuleAccordion
                  key={moduleId}
                  module={module}
                  moduleIndex={moduleIndex}
                  modulesLength={modules.length}
                  showRoleControls={showRoleControls}
                  expanded={isModuleExpanded(moduleId)}
                  onToggleExpand={() => toggleModuleExpand(moduleId)}
                  onModuleToggle={handleModuleToggle}
                  onModuleUpdate={handleModuleUpdate}
                  onModuleMove={handleModuleMove}
                  onMenuToggle={handleMenuToggle}
                  onMenuSequenceChange={handleMenuUpdate}
                  togglingModuleId={togglingModuleId}
                  savingModuleId={savingModuleId}
                  togglingMenuId={togglingMenuId}
                  savingMenuId={savingMenuId}
                />
              )
            })}
          </div>
        </>
      )}
    </NavPageShell>
  )
}
