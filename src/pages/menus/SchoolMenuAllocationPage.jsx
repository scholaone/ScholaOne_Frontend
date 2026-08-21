import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { menuService, schoolService } from '@/api/services'
import { unwrapData, getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganizationOptions } from '@/hooks/useFormOptions'
import { getUserOrganizationId } from '@/utils/schoolScope'
import { resolveRecordId } from '@/utils/record'
import Button from '@/components/ui/Button'
import { ErrorState, PageLoader } from '@/components/ui/Feedback'
import MenuAllocationTree, { selectAllModules } from '@/components/menus/MenuAllocationTree'
import { buildSyncPayload, cloneModules } from '@/components/menus/menuAllocationUtils'
import {
  NavAdminHeader,
  NavPageShell,
  NavScopeBar,
  NavStatPill,
  SelectField,
} from '@/components/navigation/NavAdminUi'

const CATEGORY_TABS = [
  { code: 'school_admin', label: 'School Admin' },
  { code: 'teacher', label: 'Teacher' },
  { code: 'student', label: 'Student' },
  { code: 'parent', label: 'Parent' },
]

export default function SchoolMenuAllocationPage() {
  const { user, isSuperAdmin } = useAuth()
  const queryClient = useQueryClient()
  const userOrganizationId = getUserOrganizationId(user)
  const orgQuery = useOrganizationOptions(isSuperAdmin)
  const [organizationId, setOrganizationId] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [userCategory, setUserCategory] = useState('school_admin')
  const [modules, setModules] = useState([])

  const allocationOrganizationId = isSuperAdmin ? organizationId : userOrganizationId

  useEffect(() => {
    if (isSuperAdmin || organizationId) return
    if (userOrganizationId) setOrganizationId(userOrganizationId)
    else if (orgQuery.options.length > 0) setOrganizationId(orgQuery.options[0].value)
  }, [isSuperAdmin, organizationId, userOrganizationId, orgQuery.options])

  useEffect(() => {
    setSchoolId('')
    setModules([])
  }, [allocationOrganizationId])

  const schoolsQuery = useQuery({
    queryKey: ['schools', 'allocation', allocationOrganizationId],
    queryFn: () => schoolService.list({ organization: allocationOrganizationId, page_size: 500 }),
    enabled: Boolean(allocationOrganizationId),
  })

  const schools = schoolsQuery.data?.results || unwrapData(schoolsQuery.data)?.results || []

  const treeQuery = useQuery({
    queryKey: ['menus', 'school-allocation', allocationOrganizationId, schoolId, userCategory],
    queryFn: () => menuService.schoolAllocationTree({
      organization: allocationOrganizationId,
      school: schoolId,
      user_category: userCategory,
    }),
    enabled: Boolean(allocationOrganizationId && schoolId),
  })

  useEffect(() => {
    const payload = unwrapData(treeQuery.data)
    setModules(cloneModules(payload?.modules || []))
  }, [treeQuery.data])

  const saveMutation = useMutation({
    mutationFn: () => menuService.syncSchoolAllocation({
      organization: allocationOrganizationId,
      school: schoolId,
      user_category: userCategory,
      ...buildSyncPayload(modules),
    }),
    onSuccess: () => {
      toast.success('School menu allocation saved.')
      queryClient.invalidateQueries({ queryKey: ['menus', 'school-allocation'] })
      queryClient.invalidateQueries({ queryKey: ['menus', 'my-menus'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const stats = useMemo(() => ({
    modules: modules.filter((module) => module.is_enabled !== false).length,
    menus: modules.reduce((acc, module) => {
      let count = 0
      const walk = (items) => items?.forEach((item) => {
        if (item.is_enabled !== false) count += 1
        walk(item.children)
      })
      walk(module.menus)
      return acc + count
    }, 0),
  }), [modules])

  return (
    <NavPageShell>
      <NavAdminHeader activeTab="school-allocation" />

      <NavScopeBar hint="Select an organization and school, then assign master-catalog modules and menus to each user category. This screen does not modify the Menu Master itself.">
        {isSuperAdmin ? (
          <SelectField
            label="Organization"
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
            options={[
              { value: '', label: 'Select organization…' },
              ...orgQuery.options,
            ]}
          />
        ) : null}
        <SelectField
          label="School"
          value={schoolId}
          onChange={(event) => setSchoolId(event.target.value)}
          disabled={!allocationOrganizationId || schoolsQuery.isLoading}
          options={[
            { value: '', label: allocationOrganizationId ? 'Select school…' : 'Select organization first…' },
            ...schools.map((school) => ({
              value: String(resolveRecordId(school) || school.id),
              label: school.school_name,
            })),
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <NavStatPill label="Enabled modules" value={stats.modules} />
          <NavStatPill label="Enabled menus" value={stats.menus} tone="success" />
        </div>
      </NavScopeBar>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => (
          <Button
            key={tab.code}
            variant={userCategory === tab.code ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUserCategory(tab.code)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={!modules.length} onClick={() => setModules(selectAllModules(modules, true))}>
          Select all
        </Button>
        <Button variant="outline" size="sm" disabled={!modules.length} onClick={() => setModules(selectAllModules(modules, false))}>
          Deselect all
        </Button>
        <Button
          disabled={!schoolId || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? 'Saving…' : 'Save allocation'}
        </Button>
      </div>

      {!allocationOrganizationId ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Select an organization to begin allocating menus.
        </div>
      ) : null}
      {allocationOrganizationId && !schoolId ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Select a school to begin allocating menus.
        </div>
      ) : null}

      {schoolId && treeQuery.isLoading ? <PageLoader /> : null}
      {schoolId && treeQuery.isError ? <ErrorState onRetry={treeQuery.refetch} /> : null}
      {schoolId && !treeQuery.isLoading && !treeQuery.isError ? (
        <MenuAllocationTree modules={modules} onChange={setModules} />
      ) : null}
    </NavPageShell>
  )
}
