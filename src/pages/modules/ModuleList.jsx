import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { moduleService } from '@/api/services'
import { unwrapList, getErrorMessage } from '@/api/client'
import { resolveRecordId } from '@/utils/record'
import { resolveNavIcon } from '@/utils/navFromApi'
import { confirmDelete } from '@/utils/confirm'
import { removeFromListCache } from '@/utils/listCache'
import { Card } from '@/components/ui/Card'
import { ErrorState, PageLoader } from '@/components/ui/Feedback'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import {
  NavPageShell,
  NavAdminHeader,
  NavStatPill,
  StatusBadge,
  SearchField,
  EmptyNavState,
  IconActionLink,
  Button,
  Link,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
} from '@/components/navigation/NavAdminUi'
import { cn } from '@/lib/utils'

const DETAIL_FIELDS = [
  { key: 'module_name', label: 'Module Name' },
  { key: 'module_code', label: 'Code' },
  { key: 'icon', label: 'Icon' },
  { key: 'sequence', label: 'Order' },
  { key: 'description', label: 'Description', fullWidth: true },
  { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
]

function ModuleCard({ module, onView, onDelete, deleting }) {
  const id = resolveRecordId(module)
  const Icon = resolveNavIcon(module.icon)
  const active = module.is_active !== false

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        !active && 'opacity-75',
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 to-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
            active ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400',
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{module.module_name}</h3>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{module.module_code}</p>
            </div>
            <StatusBadge active={active} />
          </div>
          <div className="mt-3 inline-flex items-center rounded-lg bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Order
            {' '}
            <span className="ml-1 tabular-nums text-foreground">{module.sequence ?? '—'}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-1 border-t border-border/60 bg-muted/20 px-3 py-2">
        <IconActionLink to={`/modules/${id}/edit`} variant="primary" title="Edit">
          <FiEdit2 className="h-4 w-4" />
        </IconActionLink>
        <button
          type="button"
          onClick={() => onView(module)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          title="View details"
        >
          <FiEye className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => onDelete(module)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          title="Delete"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  )
}

export default function ModuleList() {
  const queryClient = useQueryClient()
  const { viewId, isOpen, openView, closeView } = useListDetailModal()
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const listQueryKey = useMemo(() => ['modules', 'list', 'master'], [])

  const listQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: () => moduleService.list({ scope: 'master', page_size: 500 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => moduleService.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(listQueryKey, (old) => removeFromListCache(old, id))
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Module deleted')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to delete module')),
    onSettled: () => setDeletingId(null),
  })

  const modules = useMemo(() => {
    const list = unwrapList(listQuery.data).results || []
    const term = search.trim().toLowerCase()
    const filtered = term
      ? list.filter(
          (m) =>
            m.module_name?.toLowerCase().includes(term) ||
            m.module_code?.toLowerCase().includes(term),
        )
      : list
    return [...filtered].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
  }, [listQuery.data, search])

  const stats = useMemo(() => {
    const all = unwrapList(listQuery.data).results || []
    return {
      total: all.length,
      active: all.filter((m) => m.is_active !== false).length,
    }
  }, [listQuery.data])

  const handleDelete = async (module) => {
    const id = resolveRecordId(module)
    if (!id) return
    const ok = await confirmDelete(module.module_name || 'this module')
    if (!ok) return
    setDeletingId(id)
    deleteMutation.mutate(id)
  }

  return (
    <NavPageShell breadcrumb={[{ label: 'Modules' }]}>
      <NavAdminHeader
        activeTab="modules"
        actions={(
          <Link to="/modules/new">
            <Button variant="create">
              <FiPlus className="mr-1.5 h-4 w-4" />
              Add Module
            </Button>
          </Link>
        )}
      />

      {listQuery.isLoading ? (
        <PageLoader />
      ) : listQuery.isError ? (
        <ErrorState message={getErrorMessage(listQuery.error)} onRetry={listQuery.refetch} />
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
              <NavStatPill label="Total modules" value={stats.total} />
              <NavStatPill label="Active" value={stats.active} tone="success" />
            </div>
            <SearchField value={search} onChange={setSearch} placeholder="Search modules…" />
          </div>

          {modules.length === 0 ? (
            <EmptyNavState
              title={search ? 'No matching modules' : 'No modules yet'}
              description={
                search
                  ? 'Try a different search term or clear the filter.'
                  : 'Create your first module to build the ERP navigation master catalog.'
              }
              action={
                !search ? (
                  <Link to="/modules/new">
                    <Button variant="create">
                      <FiPlus className="mr-1.5 h-4 w-4" />
                      Add Module
                    </Button>
                  </Link>
                ) : null
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {modules.map((module) => {
                const id = resolveRecordId(module)
                return (
                  <ModuleCard
                    key={id}
                    module={module}
                    onView={(item) => openView(item, resolveRecordId(item))}
                    onDelete={handleDelete}
                    deleting={deletingId === id}
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      <ResourceDetailModal
        recordId={viewId}
        open={isOpen}
        onClose={closeView}
        queryKey="modules"
        getFn={moduleService.get}
        getTitle={(item) => item.module_name}
        fields={DETAIL_FIELDS}
        editPath={(item, id) => `/modules/${item.module_id || item.id || id}/edit`}
      />
    </NavPageShell>
  )
}
