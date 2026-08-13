import { useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import ResourceListPage from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import AcademicBulkActions from '@/pages/academics/AcademicBulkActions'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { ACADEMIC_DEFINITIONS } from '@/config/academicDefinitions'
import { buildDetailFields } from '@/config/formFieldConfig'
import { useScopedFormFields } from '@/hooks/useScopedFormFields'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { academicEntitySupportsBulkImport } from '@/config/academicBulkImport'
import { academicServices, academicYearService, masterServices } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { resolveRecordId } from '@/utils/record'
import { formatDateTime } from '@/utils/format'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'

function resolveService(def) {
  if (def.scope === 'master' || def.masterKey) {
    return masterServices[def.serviceKey]
  }
  return academicServices[def.serviceKey]
}

function useAcademicYearLifecycle(enabled, queryKey) {
  const queryClient = useQueryClient()
  const [cloneOpen, setCloneOpen] = useState(false)
  const [cloneTarget, setCloneTarget] = useState(null)
  const [cloneForm, setCloneForm] = useState({ name: '', start_date: '', end_date: '' })

  const runAction = useMutation({
    mutationFn: async ({ action, id, payload }) => {
      if (action === 'clone') return academicYearService.clone(id, payload)
      return academicYearService[action](id)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      toast.success(
        vars.action === 'clone'
          ? 'Academic year cloned'
          : `Academic year ${vars.action.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
      )
      setCloneOpen(false)
      setCloneTarget(null)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const column = useMemo(() => {
    if (!enabled) return null
    return {
      id: 'lifecycle',
      header: 'Year Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original
        const id = resolveRecordId(item)
        const status = item.status || (item.is_current ? 'active' : 'draft')
        const busy = runAction.isPending
        return (
          <div className="flex flex-wrap gap-1">
            {!item.is_current && status !== 'archived' && (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => runAction.mutate({ action: 'setCurrent', id })}>
                Set Current
              </Button>
            )}
            {status === 'active' && (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => runAction.mutate({ action: 'freeze', id })}>
                Freeze
              </Button>
            )}
            {status === 'frozen' && (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => runAction.mutate({ action: 'unfreeze', id })}>
                Unfreeze
              </Button>
            )}
            {(status === 'active' || status === 'frozen') && (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => runAction.mutate({ action: 'close', id })}>
                Close
              </Button>
            )}
            {status === 'closed' && (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => runAction.mutate({ action: 'archive', id })}>
                Archive
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setCloneTarget(item)
                setCloneForm({
                  name: `${item.name || 'Year'} (Copy)`,
                  start_date: item.start_date || '',
                  end_date: item.end_date || '',
                })
                setCloneOpen(true)
              }}
            >
              Clone
            </Button>
          </div>
        )
      },
    }
  }, [enabled, runAction.isPending, runAction.mutate])

  const modal = enabled ? (
    <Modal open={cloneOpen} onClose={() => setCloneOpen(false)} title="Clone Academic Year" size="md">
      <div className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Name</span>
          <input
            className="w-full rounded-lg border border-border px-3 py-2"
            value={cloneForm.name}
            onChange={(e) => setCloneForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Start Date</span>
          <input
            type="date"
            className="w-full rounded-lg border border-border px-3 py-2"
            value={cloneForm.start_date}
            onChange={(e) => setCloneForm((f) => ({ ...f, start_date: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">End Date</span>
          <input
            type="date"
            className="w-full rounded-lg border border-border px-3 py-2"
            value={cloneForm.end_date}
            onChange={(e) => setCloneForm((f) => ({ ...f, end_date: e.target.value }))}
          />
        </label>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => setCloneOpen(false)}>Cancel</Button>
        <Button
          loading={runAction.isPending}
          onClick={() =>
            runAction.mutate({
              action: 'clone',
              id: resolveRecordId(cloneTarget),
              payload: cloneForm,
            })
          }
        >
          Clone Year
        </Button>
      </div>
    </Modal>
  ) : null

  return { column, modal }
}

export function AcademicList() {
  const { entityKey } = useParams()
  const def = ACADEMIC_DEFINITIONS[entityKey]
  const schoolScope = useSchoolScopedSelection()
  const { viewId, isOpen, openView, closeView } = useListDetailModal()
  const queryKey = `academics-${entityKey || 'unknown'}`
  const { column: yearLifecycleColumn, modal: yearLifecycleModal } = useAcademicYearLifecycle(
    entityKey === 'academic-years',
    queryKey,
  )

  const columns = useMemo(() => {
    if (!def?.columns) return []
    if (!yearLifecycleColumn) return def.columns
    return [...def.columns, yearLifecycleColumn]
  }, [def?.columns, yearLifecycleColumn])

  const service = def ? resolveService(def) : null
  const detailFields = def ? buildDetailFields(def, { formatDate: formatDateTime }) : []

  const listParams = useMemo(
    () => ({
      ...(schoolScope.schoolId ? { school: schoolScope.schoolId } : {}),
      ...(schoolScope.resolvedOrgId ? { organization: schoolScope.resolvedOrgId } : {}),
    }),
    [schoolScope.resolvedOrgId, schoolScope.schoolId],
  )

  const listFn = useMemo(
    () => (params) => service?.list(params, schoolScope.listRequestConfig),
    [service, schoolScope.listRequestConfig],
  )

  if (!def) return <div className="p-8 text-center text-muted">Academic entity not found</div>
  if (def.masterKey) return <Navigate to={`/masters/${def.masterKey}`} replace />

  // Academic years are managed in Admissions → Setup; show read-only view here
  if (entityKey === 'academic-years') {
    return <Navigate to="/academics/admission-setup" replace />
  }

  const schoolFilter = def.scope === 'school' ? (
    <SchoolScopeField
      schoolId={schoolScope.schoolId}
      setSchoolId={schoolScope.setSchoolId}
      schoolOptions={schoolScope.schoolOptions}
      selectedSchoolLabel={schoolScope.selectedSchoolLabel}
      schoolLocked={schoolScope.schoolLocked}
      className="min-w-[220px]"
    />
  ) : null

  const extraActions =
    service.bulkUpload && academicEntitySupportsBulkImport(entityKey) ? (
      <AcademicBulkActions
        entityKey={entityKey}
        service={service}
        queryKey={queryKey}
        label={def.labelPlural}
      />
    ) : null

  return (
    <>
      <ResourceListPage
        title={def.labelPlural}
        subtitle={`Manage ${def.labelPlural.toLowerCase()}`}
        breadcrumb={[
          { label: 'Academic Foundation', href: '/academics' },
          { label: def.labelPlural },
        ]}
        queryKey={queryKey}
        listFn={listFn}
        listParams={listParams}
        deleteFn={service.delete}
        basePath={`/academics/${entityKey}`}
        columns={columns}
        filters={schoolFilter}
        onView={(item) => openView(item, resolveRecordId(item))}
        extraActions={extraActions}
      />

      <ResourceDetailModal
        recordId={viewId}
        open={isOpen}
        onClose={closeView}
        queryKey={queryKey}
        getFn={service.get}
        getTitle={(item) => item.name || item.title || def.label}
        fields={detailFields}
        editPath={(_item, id) => `/academics/${entityKey}/${id}/edit`}
      />
      {yearLifecycleModal}
    </>
  )
}

export function AcademicForm() {
  const { entityKey, id } = useParams()
  const def = ACADEMIC_DEFINITIONS[entityKey]
  const { fields, loading, error, transformLoad } = useScopedFormFields(def)

  if (!def) return <div className="p-8 text-center text-muted">Academic entity not found</div>
  if (def.masterKey) return <Navigate to={`/masters/${def.masterKey}/new`} replace />

  if (entityKey === 'academic-years') {
    return <Navigate to="/academics/admission-setup" replace />
  }

  if (entityKey === 'class-sections' && !id) {
    return <Navigate to="/masters/setup/map" replace />
  }

  if (loading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} />

  const service = resolveService(def)

  return (
    <ResourceFormPage
      title={def.label}
      breadcrumb={[
        { label: 'Academic Foundation', href: '/academics' },
        { label: def.labelPlural, href: `/academics/${entityKey}` },
      ]}
      queryKey={`academics-${entityKey}`}
      getFn={service.get}
      createFn={service.create}
      updateFn={service.update}
      basePath={`/academics/${entityKey}`}
      fields={fields}
      transformLoad={transformLoad}
    />
  )
}
