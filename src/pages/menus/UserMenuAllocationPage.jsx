import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { menuService, schoolUserService } from '@/api/services'
import { unwrapData, getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { getUserOrganizationId, getUserSchoolId } from '@/utils/schoolScope'
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
  SearchField,
} from '@/components/navigation/NavAdminUi'

const USER_TYPE_OPTIONS = [
  { value: '', label: 'All user types' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'student', label: 'Students' },
  { value: 'parent', label: 'Parents' },
  { value: 'staff', label: 'Staff' },
]

export default function UserMenuAllocationPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const organizationId = getUserOrganizationId(user)
  const schoolId = getUserSchoolId(user)
  const [mode, setMode] = useState('individual')
  const [userType, setUserType] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [search, setSearch] = useState('')
  const [modules, setModules] = useState([])

  const usersQuery = useQuery({
    queryKey: ['school-users', 'menu-allocation', schoolId, userType, search],
    queryFn: () => schoolUserService.list({
      school: schoolId,
      search,
      page_size: 200,
      ...(userType ? { staff_role: userType } : {}),
    }),
    enabled: Boolean(schoolId),
  })

  const users = usersQuery.data?.results || unwrapData(usersQuery.data)?.results || []
  const activeUserId = mode === 'individual' ? selectedUserId : selectedUserIds[0]

  const treeQuery = useQuery({
    queryKey: ['menus', 'user-allocation', organizationId, schoolId, activeUserId],
    queryFn: () => menuService.userAllocationTree({
      organization: organizationId,
      school: schoolId,
      user: activeUserId,
    }),
    enabled: Boolean(organizationId && schoolId && activeUserId),
  })

  useEffect(() => {
    setSelectedUserId('')
    setSelectedUserIds([])
  }, [userType, mode])

  useEffect(() => {
    const payload = unwrapData(treeQuery.data)
    setModules(cloneModules(payload?.modules || []))
  }, [treeQuery.data])

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = buildSyncPayload(modules)
      return menuService.syncUserAllocation({
        organization: organizationId,
        school: schoolId,
        user_ids: mode === 'bulk' ? selectedUserIds : [selectedUserId],
        menus: payload.menus,
      })
    },
    onSuccess: () => {
      toast.success('User menu allocation saved.')
      queryClient.invalidateQueries({ queryKey: ['menus', 'user-allocation'] })
      queryClient.invalidateQueries({ queryKey: ['menus', 'my-menus'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const enabledCount = useMemo(
    () => modules.reduce((acc, module) => {
      const walk = (items) => items?.forEach((item) => {
        if (item.is_enabled !== false && item.in_school_scope !== false) acc += 1
        walk(item.children)
      })
      walk(module.menus)
      return acc
    }, 0),
    [modules],
  )

  const toggleBulkUser = (userId) => {
    setSelectedUserIds((current) => (
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    ))
  }

  const selectAllVisibleUsers = () => {
    setSelectedUserIds(users.map((entry) => entry.id))
  }

  const clearSelectedUsers = () => {
    setSelectedUserIds([])
  }

  if (!organizationId || !schoolId) {
    return (
      <NavPageShell>
        <NavAdminHeader activeTab="user-allocation" variant="school" />
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Your account is not linked to a school. Contact your organization administrator.
        </div>
      </NavPageShell>
    )
  }

  return (
    <NavPageShell>
      <NavAdminHeader activeTab="user-allocation" variant="school" />

      <NavScopeBar hint="Allocate menus to individual users or bulk-assign the same menu set to multiple users. Only menus already granted to this school are available.">
        <SelectField
          label="User type"
          value={userType}
          onChange={(event) => setUserType(event.target.value)}
          options={USER_TYPE_OPTIONS}
        />
        <SelectField
          label="Mode"
          value={mode}
          onChange={(event) => {
            setMode(event.target.value)
            setSelectedUserIds([])
            setSelectedUserId('')
          }}
          options={[
            { value: 'individual', label: 'Individual allocation' },
            { value: 'bulk', label: 'Bulk allocation' },
          ]}
        />
        <NavStatPill label="Enabled menus" value={enabledCount} tone="success" />
      </NavScopeBar>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3 rounded-xl border border-border/70 bg-white p-4 shadow-sm">
          <SearchField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users…" />
          {mode === 'bulk' ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={!users.length} onClick={selectAllVisibleUsers}>
                Select all visible
              </Button>
              <Button variant="outline" size="sm" disabled={!selectedUserIds.length} onClick={clearSelectedUsers}>
                Clear selection
              </Button>
            </div>
          ) : null}
          <div className="max-h-[520px] space-y-2 overflow-auto">
            {usersQuery.isLoading ? <PageLoader /> : null}
            {usersQuery.isError ? <ErrorState onRetry={usersQuery.refetch} /> : null}
            {!usersQuery.isLoading && !users.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No users found for this filter.
              </p>
            ) : null}
            {users.map((entry) => {
              const isSelected = mode === 'bulk'
                ? selectedUserIds.includes(entry.id)
                : selectedUserId === entry.id
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    if (mode === 'bulk') toggleBulkUser(entry.id)
                    else setSelectedUserId(entry.id)
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-border hover:bg-muted/40'}`}
                >
                  <div className="font-medium">{entry.full_name || entry.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {entry.staff_role_name || entry.staff_role || entry.email}
                  </div>
                </button>
              )
            })}
          </div>
          {mode === 'bulk' ? (
            <div className="text-xs text-muted-foreground">{selectedUserIds.length} user(s) selected</div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={!modules.length} onClick={() => setModules(selectAllModules(modules, true))}>
              Select all
            </Button>
            <Button variant="outline" size="sm" disabled={!modules.length} onClick={() => setModules(selectAllModules(modules, false))}>
              Deselect all
            </Button>
            <Button
              disabled={
                saveMutation.isPending
                || (mode === 'bulk' ? !selectedUserIds.length : !selectedUserId)
              }
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? 'Saving…' : 'Save user allocation'}
            </Button>
          </div>

          {!activeUserId ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Select a user to manage their menu access.
            </div>
          ) : null}
          {activeUserId && treeQuery.isLoading ? <PageLoader /> : null}
          {activeUserId && treeQuery.isError ? <ErrorState onRetry={treeQuery.refetch} /> : null}
          {activeUserId && !treeQuery.isLoading && !treeQuery.isError ? (
            <MenuAllocationTree modules={modules} onChange={setModules} />
          ) : null}
        </div>
      </div>
    </NavPageShell>
  )
}
