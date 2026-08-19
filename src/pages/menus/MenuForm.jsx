import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { menuService } from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { useModuleOptions } from '@/hooks/useFormOptions'

const BASE_FIELDS = [
  { name: 'menu_name', label: 'Menu Name', type: 'text', required: true },
  { name: 'menu_code', label: 'Menu Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'url', label: 'URL', type: 'text' },
  { name: 'icon', label: 'Icon', type: 'text' },
  { name: 'sequence', label: 'Sequence', type: 'number' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
]

function transformMenuLoad(item) {
  return {
    module: item.module ? String(item.module) : item.module_id ? String(item.module_id) : '',
    menu_name: item.menu_name || '',
    menu_code: item.menu_code || '',
    url: item.url || '',
    icon: item.icon || '',
    sequence: item.sequence ?? '',
    parent: item.parent ? String(item.parent) : item.parent_id ? String(item.parent_id) : '',
    is_active: item.is_active ?? true,
  }
}

export default function MenuForm() {
  const [searchParams] = useSearchParams()
  const presetModule = searchParams.get('module') || ''
  const presetParent = searchParams.get('parent') || ''

  const moduleQuery = useModuleOptions()

  const allMenusQuery = useQuery({
    queryKey: ['menus', 'menu-form-master'],
    queryFn: () =>
      menuService.list({
        scope: 'master',
        page_size: 500,
        ordering: 'menu_name',
      }),
    staleTime: 5 * 60 * 1000,
  })

  const menusByModule = useMemo(() => {
    const { results } = unwrapList(allMenusQuery.data)
    const map = {}
    results.forEach((menu) => {
      const moduleId = String(menu.module_id || menu.module || '')
      if (!moduleId) return
      if (!map[moduleId]) map[moduleId] = []
      map[moduleId].push({
        value: String(menu.menu_id || menu.id),
        label: `${menu.menu_name} (${menu.menu_code})`,
      })
    })
    return map
  }, [allMenusQuery.data])

  const presetParentLabel = useMemo(() => {
    if (!presetParent) return ''
    const { results } = unwrapList(allMenusQuery.data)
    const parent = results.find((menu) => String(menu.menu_id || menu.id) === presetParent)
    return parent?.menu_name || ''
  }, [allMenusQuery.data, presetParent])

  const fields = useMemo(
    () => [
      {
        name: 'module',
        label: 'Module',
        type: 'select',
        required: true,
        options: moduleQuery.options,
        placeholder: 'Select module',
      },
      ...BASE_FIELDS.slice(0, 4),
      {
        name: 'parent',
        label: 'Parent Menu',
        type: 'select',
        dependsOn: 'module',
        placeholder: 'No parent (top level under module)',
        disabled: (values) => !values?.module,
        getOptions: (values) => menusByModule[String(values?.module)] || [],
      },
      ...BASE_FIELDS.slice(4),
    ],
    [moduleQuery.options, menusByModule, presetParent, presetParentLabel],
  )

  const getCreateDefaults = useMemo(
    () => () => ({
      ...(presetModule ? { module: presetModule } : {}),
      ...(presetParent ? { parent: presetParent } : {}),
      is_active: true,
    }),
    [presetModule, presetParent],
  )

  const formTitle = presetParent ? 'Sub-menu' : 'Menu'

  if (moduleQuery.isLoading || allMenusQuery.isLoading) return <PageLoader />
  if (moduleQuery.error) {
    return (
      <ErrorState
        message={getErrorMessage(moduleQuery.error, 'Failed to load modules')}
        onRetry={moduleQuery.refetch}
      />
    )
  }

  return (
    <ResourceFormPage
      title={formTitle}
      queryKey="menus"
      getFn={menuService.get}
      createFn={menuService.create}
      updateFn={menuService.update}
      basePath="/menus"
      fields={fields}
      transformLoad={transformMenuLoad}
      getCreateDefaults={getCreateDefaults}
      transformSubmit={(data) => {
        const payload = { ...data }
        if (!payload.parent) delete payload.parent
        return payload
      }}
      renderTop={({ isEdit }) =>
        !isEdit ? (
          <p className="text-sm text-muted-foreground">
            {presetParent
              ? `Creating a sub-menu under "${presetParentLabel || 'selected parent'}".`
              : 'This menu will be added to the ERP master catalog.'}
            {' '}
            Use School Menu Allocation to grant it to organizations and schools.
          </p>
        ) : null
      }
    />
  )
}
