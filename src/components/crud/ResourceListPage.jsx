import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiDownload, FiRefreshCw } from 'react-icons/fi'
import DataTable, { Pagination, SearchBox } from '@/components/data/DataTable'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import IconActionButton from '@/components/ui/IconActionButton'
import { StatusBadge } from '@/components/ui/Feedback'
import { usePagination, useDebounce } from '@/hooks/usePagination'
import { unwrapList, getErrorMessage } from '@/api/client'
import { confirmDelete } from '@/utils/confirm'
import { exportToCsv } from '@/utils/format'
import { markInactiveInListCache, removeFromListCache } from '@/utils/listCache'

import { resolveRecordId } from '@/utils/record'

export default function ResourceListPage({
  title,
  subtitle,
  breadcrumb,
  queryKey,
  listFn,
  deleteFn,
  basePath,
  columns,
  exportColumns,
  enableBulkDelete = false,
  bulkDeleteFn,
  extraActions,
  filters,
  listParams = {},
  onView,
  createPath,
  deleteSuccessMessage = 'Deleted successfully',
  deleteBehavior = 'remove',
  readOnly = false,
  hideCreate = false,
  onRowClick,
  /** When true, hide breadcrumb + page header (used inside LMS module shells) */
  embedded = false,
}) {
  const queryClient = useQueryClient()
  const pagination = usePagination()
  const debouncedSearch = useDebounce(pagination.search)
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState([])

  const ordering = sorting[0] ? `${sorting[0].desc ? '-' : ''}${sorting[0].id}` : undefined

  const listQueryKey = useMemo(
    () => [
      queryKey,
      'list',
      pagination.page,
      pagination.pageSize,
      debouncedSearch,
      ordering,
      pagination.filters,
      listParams,
    ],
    [queryKey, pagination.page, pagination.pageSize, debouncedSearch, ordering, pagination.filters, listParams],
  )

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: listQueryKey,
    queryFn: () =>
      listFn({
        ...pagination.queryParams,
        search: debouncedSearch || undefined,
        ordering,
        ...listParams,
      }),
    placeholderData: keepPreviousData,
    // Soft-fail: empty / failed load → show "No data found" table, not a hard error page
    retry: 1,
    throwOnError: false,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFn(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(listQueryKey, (old) =>
        deleteBehavior === 'deactivate'
          ? markInactiveInListCache(old, deletedId)
          : removeFromListCache(old, deletedId),
      )
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      toast.success(deleteSuccessMessage)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const list = unwrapList(data)
  const rows = list.results || []
  const total = list.count || 0

  const tableColumns = useMemo(
    () => [
      ...columns,
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original
          const id = resolveRecordId(item)
          return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {onView ? (
                <IconActionButton
                  variant="view"
                  onClick={() => onView(item, id)}
                  title="View details"
                >
                  <FiEye className="h-4 w-4" />
                </IconActionButton>
              ) : (
                <IconActionButton variant="view" href={`${basePath}/${id}`} title="View details">
                  <FiEye className="h-4 w-4" />
                </IconActionButton>
              )}
              {!readOnly &&
              !basePath.includes('/audit-logs') &&
              !basePath.includes('/notifications') ? (
                <>
                  <IconActionButton variant="edit" href={`${basePath}/${id}/edit`} title="Edit">
                    <FiEdit2 className="h-4 w-4" />
                  </IconActionButton>
                  {deleteFn && (
                    <IconActionButton
                      variant="delete"
                      title="Delete"
                      onClick={async () => {
                        if (await confirmDelete()) deleteMutation.mutate(id)
                      }}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </IconActionButton>
                  )}
                </>
              ) : null}
            </div>
          )
        },
      },
    ],
    [columns, basePath, deleteMutation, onView, readOnly, deleteFn],
  )

  const selectedIds = Object.keys(rowSelection).map((idx) => resolveRecordId(rows[Number(idx)])).filter(Boolean)

  const handleExport = () => {
    const cols = exportColumns || columns.filter((c) => c.accessorKey || c.id !== 'actions')
    exportToCsv(
      rows,
      cols.map((c) => ({
        header: typeof c.header === 'string' ? c.header : c.accessorKey,
        accessor: (row) => {
          const key = c.accessorKey || c.id
          const val = row[key]
          if (c.cell && typeof c.cell !== 'function') return val
          if (typeof val === 'boolean') return val ? 'Active' : 'Inactive'
          return val ?? ''
        },
      })),
      `${queryKey}-export.csv`,
    )
    toast.success('Export downloaded')
  }

  const headerActions = (
    <>
      <Button variant="refresh" onClick={() => refetch()} loading={isFetching}>
        <FiRefreshCw /> Refresh
      </Button>
      <Button variant="excel" onClick={handleExport}>
        <FiDownload /> Export Excel
      </Button>
      {extraActions}
      {!readOnly &&
        !hideCreate &&
        !basePath.includes('/audit-logs') &&
        !basePath.includes('/notifications') && (
        <Link to={createPath || `${basePath}/new`}>
          <Button variant="create"><FiPlus /> Add New</Button>
        </Link>
      )}
    </>
  )

  return (
    <div className="lms-page w-full min-w-0">
      {!embedded ? (
        <>
          <Breadcrumb items={breadcrumb || [{ label: title }]} />
          <PageHeader title={title} subtitle={subtitle} actions={headerActions} />
        </>
      ) : (
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2">{headerActions}</div>
      )}

      <Card padding={false} className="relative p-4 lms-form-card">
        {isFetching && !isLoading && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden rounded-t-xl bg-[var(--clay-mint-light)]">
            <div className="h-full w-1/3 animate-pulse bg-[var(--clay-accent)]" />
          </div>
        )}
        {error && !isLoading ? (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <span className="min-w-0 break-words">
              Could not load data. Showing empty list. {getErrorMessage(error)}
            </span>
            <Button variant="refresh" className="shrink-0" onClick={() => refetch()}>
              <FiRefreshCw /> Retry
            </Button>
          </div>
        ) : null}
        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBox value={pagination.search} onChange={pagination.setSearch} />
          {filters}
          {enableBulkDelete && selectedIds.length > 0 && bulkDeleteFn && (
            <Button
              variant="danger"
              onClick={async () => {
                if (await confirmDelete(`${selectedIds.length} items`)) {
                  await bulkDeleteFn(selectedIds)
                  queryClient.invalidateQueries({ queryKey: [queryKey] })
                  setRowSelection({})
                  toast.success('Bulk delete completed')
                }
              }}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </div>

        <DataTable
          columns={tableColumns}
          data={rows}
          loading={isLoading && !data}
          sorting={sorting}
          onSortingChange={setSorting}
          enableSelection={enableBulkDelete}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          onRowClick={onRowClick}
        />

        <div className="px-2 pb-2">
          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={total}
            onPageChange={pagination.setPage}
            onPageSizeChange={(size) => {
              pagination.setPageSize(size)
              pagination.setPage(1)
            }}
          />
        </div>
      </Card>
    </div>
  )
}

export { StatusBadge }
