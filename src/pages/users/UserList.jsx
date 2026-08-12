import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiEdit2, FiKey } from 'react-icons/fi'
import ResourceListPage, { StatusBadge } from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import UserPasswordModal from '@/components/users/UserPasswordModal'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { userService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { ROLE_TYPES } from '@/config/constants'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganizationOptions, useSchoolOptions } from '@/hooks/useFormOptions'
import { getUserOrganizationId } from '@/utils/schoolScope'
import { downloadBlob } from '@/utils/format'
import { resolveRecordId } from '@/utils/record'
import { confirmDialog } from '@/utils/confirm'

const ROLE_LABELS = Object.fromEntries(ROLE_TYPES.map((role) => [role.value, role.label]))

const USER_ROLE_FILTER_OPTIONS = [
  { label: 'All roles', value: '' },
  ...ROLE_TYPES,
]

function formatRoleType(item) {
  if (item.role_name) return item.role_name
  if (item.role_type) return ROLE_LABELS[item.role_type] || item.role_type
  if (item.is_super_admin) return 'Super Admin'
  if (item.is_org_admin) return 'Organization Admin'
  if (item.is_school_admin) return 'School Admin'
  return 'User'
}

function getUserDisplayName(user) {
  return (
    user?.full_name ||
    `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
    user?.email ||
    user?.mobile_number ||
    'User'
  )
}

function buildColumns(onPasswordClick) {
  return [
    {
      id: 'name',
      header: 'Name',
      accessorFn: (row) => getUserDisplayName(row),
      cell: ({ row }) => (
        <span className="font-medium text-text">{getUserDisplayName(row.original)}</span>
      ),
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile_number', header: 'Mobile' },
    { accessorKey: 'organization_name', header: 'Organization' },
    { accessorKey: 'school_name', header: 'School' },
    {
      id: 'role_type',
      header: 'Role',
      accessorFn: (row) => formatRoleType(row),
      cell: ({ row }) => formatRoleType(row.original),
    },
    { accessorKey: 'is_active', header: 'Status', cell: ({ getValue }) => <StatusBadge active={getValue()} /> },
    {
      id: 'password',
      header: 'Password',
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="view"
          size="sm"
          onClick={() => onPasswordClick(row.original)}
          title="View password"
        >
          <FiKey className="h-4 w-4" />
          Password
        </Button>
      ),
    },
  ]
}

const DETAIL_FIELDS = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobile_number', label: 'Mobile' },
  { key: 'organization_name', label: 'Organization' },
  { key: 'school_name', label: 'School' },
  { key: 'role_type', label: 'Role Type', render: (item) => formatRoleType(item) },
  { key: 'is_super_admin', label: 'Super Admin', render: (item) => (item.is_super_admin || item.role_type === 'super_admin' ? 'Yes' : 'No') },
  { key: 'is_org_admin', label: 'Org Admin', render: (item) => (item.is_org_admin || item.role_type === 'org_admin' ? 'Yes' : 'No') },
  { key: 'is_school_admin', label: 'School Admin', render: (item) => (item.is_school_admin || item.role_type === 'school_admin' ? 'Yes' : 'No') },
  { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
]

function UserDetailModal({ userId, open, onClose, onViewPassword }) {
  const queryClient = useQueryClient()
  const id = userId

  const activateMutation = useMutation({
    mutationFn: () => userService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User activated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => userService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deactivated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (password) => userService.resetPassword(id, password),
    onSuccess: () => toast.success('Password reset successfully'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const handleResetPassword = async () => {
    const confirmed = await confirmDialog({
      title: 'Reset Password',
      input: 'text',
      inputPlaceholder: 'Enter new password',
      inputAttributes: { minlength: 8 },
    })
    if (confirmed?.value) resetPasswordMutation.mutate(confirmed.value)
  }

  return (
    <ResourceDetailModal
      recordId={id}
      open={open}
      onClose={onClose}
      queryKey="users"
      getFn={userService.get}
      getTitle={(item) => item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email}
      fields={DETAIL_FIELDS}
      renderFooter={(item, recordId, close) => {
        const userRecordId = item.id || item.user_id || recordId
        return (
          <>
            <Button variant="cancel" onClick={close}>Close</Button>
            <Button variant="view" onClick={() => { onViewPassword?.(item); close() }}>
              <FiKey className="h-4 w-4" /> View Password
            </Button>
            <Link to={`/users/${userRecordId}/edit`} onClick={close}>
              <Button variant="edit"><FiEdit2 className="h-4 w-4" /> Edit</Button>
            </Link>
            <Button variant="secondary" onClick={handleResetPassword} loading={resetPasswordMutation.isPending}>
              Reset Password
            </Button>
            {item.is_active ? (
              <Button variant="danger" loading={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate()}>
                Deactivate
              </Button>
            ) : (
              <Button variant="success" loading={activateMutation.isPending} onClick={() => activateMutation.mutate()}>
                Activate
              </Button>
            )}
          </>
        )
      }}
    />
  )
}

export default function UserList() {
  const { user, isSuperAdmin, isOrgAdmin } = useAuth()
  const { viewId, isOpen, openView, closeView } = useListDetailModal()
  const [passwordUser, setPasswordUser] = useState(null)
  const [roleType, setRoleType] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [schoolId, setSchoolId] = useState('')

  const orgQuery = useOrganizationOptions(isSuperAdmin)
  const userOrgId = getUserOrganizationId(user)
  const effectiveOrgId = isSuperAdmin ? organizationId : userOrgId
  const schoolQuery = useSchoolOptions(effectiveOrgId || undefined, Boolean(effectiveOrgId))

  useEffect(() => {
    if (isSuperAdmin || organizationId) return
    if (userOrgId) setOrganizationId(userOrgId)
  }, [isSuperAdmin, organizationId, userOrgId])

  useEffect(() => {
    setSchoolId('')
  }, [organizationId])

  const listParams = useMemo(() => {
    const params = {}
    if (roleType) params.role_type = roleType
    if (isSuperAdmin && organizationId) params.organization = organizationId
    if (schoolId) params.school = schoolId
    return params
  }, [roleType, isSuperAdmin, organizationId, schoolId])

  const columns = buildColumns((userRow) => setPasswordUser(userRow))

  const showOrgFilter = isSuperAdmin && orgQuery.options.length > 0
  const showSchoolFilter = Boolean(effectiveOrgId) && schoolQuery.options.length > 0

  const filters = (
    <div className="flex flex-wrap items-center gap-2">
      <SelectField
        value={roleType}
        onChange={(e) => setRoleType(e.target.value)}
        options={USER_ROLE_FILTER_OPTIONS}
        className="min-w-[190px]"
        aria-label="Filter by role"
      />
      {showOrgFilter ? (
        <SelectField
          value={organizationId}
          onChange={(e) => setOrganizationId(e.target.value)}
          options={[{ label: 'All organizations', value: '' }, ...orgQuery.options]}
          className="min-w-[220px]"
          aria-label="Filter by organization"
        />
      ) : null}
      {showSchoolFilter ? (
        <SelectField
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          options={[{ label: 'All schools', value: '' }, ...schoolQuery.options]}
          className="min-w-[220px]"
          aria-label="Filter by school"
          disabled={!effectiveOrgId}
        />
      ) : null}
    </div>
  )

  return (
    <>
      <ResourceListPage
        title="Users"
        subtitle={
          isOrgAdmin && !isSuperAdmin
            ? 'Manage users in your organization — filter by role or school'
            : 'Manage platform users — filter by role, organization, or school'
        }
        queryKey="users"
        listFn={userService.list}
        listParams={listParams}
        deleteFn={userService.delete}
        deleteSuccessMessage="User deleted"
        deleteBehavior="remove"
        basePath="/users"
        columns={columns}
        filters={filters}
        enableBulkDelete
        bulkDeleteFn={async (ids) => userService.bulkAction(ids, 'delete')}
        onView={(item) => openView(item, resolveRecordId(item))}
        extraActions={
          <Button
            variant="excel"
            onClick={async () => {
              const blob = await userService.export(listParams)
              downloadBlob(blob, 'users-export.csv')
              toast.success('Export downloaded')
            }}
          >
            Export Excel
          </Button>
        }
      />

      <UserDetailModal
        userId={viewId}
        open={isOpen}
        onClose={closeView}
        onViewPassword={setPasswordUser}
      />

      <UserPasswordModal
        user={passwordUser}
        userId={passwordUser ? resolveRecordId(passwordUser) : null}
        open={Boolean(passwordUser)}
        onClose={() => setPasswordUser(null)}
      />
    </>
  )
}
