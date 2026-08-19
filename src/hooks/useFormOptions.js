import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  organizationService,
  schoolService,
  userService,
  roleService,
  moduleService,
  menuService,
  masterServices,
} from '@/api/services'
import { unwrapList } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import {
  filterSchoolOptionsForUser,
  getUserSchoolId,
  isSchoolAdminUser,
  mapSchoolsToOptions,
} from '@/utils/schoolScope'

const STALE_TIME = 5 * 60 * 1000

function toOptions(results, { valueKey, labelFn }) {
  return (results || []).map((item) => ({
    value: String(item[valueKey] || item.id),
    label: labelFn(item),
  }))
}

export function useOrganizationOptions(enabled = true) {
  const query = useQuery({
    queryKey: ['organizations', 'form-options'],
    queryFn: () => organizationService.list({ page_size: 500, ordering: 'organization_name' }),
    enabled,
    staleTime: STALE_TIME,
  })

  const options = useMemo(() => {
    const { results } = unwrapList(query.data)
    return toOptions(results, {
      valueKey: 'organization_id',
      labelFn: (org) => `${org.organization_name} (${org.organization_code})`,
    })
  }, [query.data])

  return { ...query, options }
}

export function useSchoolOptions(organizationId, enabled = true) {
  const { user } = useAuth()
  const userSchoolId = getUserSchoolId(user)
  const isSchoolAdmin = isSchoolAdminUser(user)

  const query = useQuery({
    queryKey: ['schools', 'form-options', organizationId || 'all', userSchoolId, isSchoolAdmin],
    queryFn: () =>
      schoolService.list({
        page_size: 500,
        ordering: 'school_name',
        ...(organizationId ? { organization: organizationId } : {}),
        ...(isSchoolAdmin && userSchoolId ? { school: userSchoolId } : {}),
      }),
    enabled,
    staleTime: STALE_TIME,
  })

  const options = useMemo(() => {
    const { results } = unwrapList(query.data)
    return filterSchoolOptionsForUser(mapSchoolsToOptions(results), user)
  }, [query.data, user])

  return { ...query, options }
}

export function useUserOptions(organizationId, enabled = true) {
  const query = useQuery({
    queryKey: ['users', 'form-options', organizationId || 'all'],
    queryFn: () =>
      userService.list({
        page_size: 500,
        ordering: 'first_name',
        organization: organizationId || undefined,
      }),
    enabled,
    staleTime: STALE_TIME,
  })

  const options = useMemo(() => {
    const { results } = unwrapList(query.data)
    return (results || []).map((user) => ({
      value: String(user.user_id || user.id),
      label:
        user.full_name ||
        `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
        user.email ||
        user.mobile_number ||
        'User',
      organizationId: user.organization_id ? String(user.organization_id) : '',
    }))
  }, [query.data])

  return { ...query, options }
}

export function useRoleOptions(organizationId, enabled = true) {
  const query = useQuery({
    queryKey: ['roles', 'form-options', organizationId || 'all'],
    queryFn: () =>
      roleService.list({
        page_size: 500,
        ordering: 'role_name',
        organization: organizationId || undefined,
      }),
    enabled: enabled && Boolean(organizationId),
    staleTime: STALE_TIME,
  })

  const options = useMemo(() => {
    const { results } = unwrapList(query.data)
    return toOptions(results, {
      valueKey: 'role_id',
      labelFn: (role) => `${role.role_name} (${role.role_code})`,
    })
  }, [query.data])

  return { ...query, options }
}

export function useModuleOptions(organizationId, enabled = true, extraParams = {}) {
  const useMasterScope = !organizationId || extraParams.scope === 'master'
  const query = useQuery({
    queryKey: ['modules', 'form-options', organizationId || 'master', extraParams.scope || ''],
    queryFn: () =>
      moduleService.list({
        page_size: 500,
        ordering: 'module_name',
        ...(useMasterScope ? { scope: 'master' } : { organization: organizationId }),
        ...extraParams,
      }),
    enabled,
    staleTime: STALE_TIME,
  })

  const options = useMemo(() => {
    const { results } = unwrapList(query.data)
    return (results || []).map((mod) => ({
      value: String(mod.module_id || mod.id),
      label: `${mod.module_name} (${mod.module_code})`,
      organizationId: mod.organization_id ? String(mod.organization_id) : '',
    }))
  }, [query.data])

  const filteredOptions = useMemo(() => {
    if (!organizationId || useMasterScope) return options
    return options.filter((opt) => !opt.organizationId || opt.organizationId === String(organizationId))
  }, [options, organizationId, useMasterScope])

  return { ...query, options: filteredOptions }
}

export function useMenuOptions(moduleId, enabled = true) {
  const query = useQuery({
    queryKey: ['menus', 'form-options', moduleId || 'all'],
    queryFn: () =>
      menuService.list({
        page_size: 500,
        ordering: 'menu_name',
        module: moduleId || undefined,
      }),
    enabled: enabled && Boolean(moduleId),
    staleTime: STALE_TIME,
  })

  const options = useMemo(() => {
    const { results } = unwrapList(query.data)
    return toOptions(results, {
      valueKey: 'menu_id',
      labelFn: (menu) => `${menu.menu_name} (${menu.menu_code})`,
    })
  }, [query.data])

  return { ...query, options }
}

export function useMasterRecordOptions(serviceKey, organizationId, enabled = true) {
  const service = masterServices[serviceKey]
  const query = useQuery({
    queryKey: ['masters', serviceKey, 'form-options', organizationId || 'all'],
    queryFn: () =>
      service.list({
        page_size: 500,
        ordering: 'name',
        organization: organizationId || undefined,
      }),
    enabled: enabled && Boolean(service),
    staleTime: STALE_TIME,
  })

  const options = useMemo(() => {
    const { results } = unwrapList(query.data)
    return (results || []).map((item) => ({
      value: String(item.id),
      label: item.name ? `${item.name}${item.code ? ` (${item.code})` : ''}` : String(item.id),
      organizationId: item.organization_id
        ? String(item.organization_id)
        : item.organization
          ? String(item.organization)
          : '',
      schoolId: item.school_id ? String(item.school_id) : item.school ? String(item.school) : '',
      countryId: item.country ? String(item.country) : item.country_id ? String(item.country_id) : '',
      stateId: item.state ? String(item.state) : item.state_id ? String(item.state_id) : '',
    }))
  }, [query.data])

  const filteredOptions = useMemo(() => {
    if (!organizationId) return options
    return options.filter((opt) => !opt.organizationId || opt.organizationId === String(organizationId))
  }, [options, organizationId])

  return { ...query, options: filteredOptions }
}
