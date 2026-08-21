import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { FiChevronDown, FiChevronUp, FiMinus } from 'react-icons/fi'
import { cn } from '@/utils/format'
import { TableSkeleton, EmptyState } from '@/components/ui/Feedback'

export default function DataTable({
  columns,
  data = [],
  loading,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  enableSelection = false,
  stickyHeader = true,
  onRowClick,
}) {
  const table = useReactTable({
    data,
    columns: enableSelection
      ? [
          {
            id: 'select',
            header: ({ table: t }) => (
              <input
                type="checkbox"
                checked={t.getIsAllPageRowsSelected()}
                onChange={t.getToggleAllPageRowsSelectedHandler()}
                className="rounded border-[var(--clay-border)] text-[var(--clay-teal)] focus:ring-[var(--clay-accent)]/25"
              />
            ),
            cell: ({ row }) => (
              <input
                type="checkbox"
                checked={row.getIsSelected()}
                onChange={row.getToggleSelectedHandler()}
                className="rounded border-[var(--clay-border)] text-[var(--clay-teal)] focus:ring-[var(--clay-accent)]/25"
              />
            ),
            size: 40,
          },
          ...columns,
        ]
      : columns,
    state: { sorting, rowSelection },
    onSortingChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: enableSelection,
  })

  if (loading) return <TableSkeleton />

  if (!data.length) {
    return (
      <EmptyState
        title="No data found"
        description="There is no data to display yet. Try adjusting your search or filters, or add a new record."
      />
    )
  }

  return (
    <div className="lms-table-wrap">
      <table>
        <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-left"
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder ? null : (
                    <button
                      type="button"
                      className={cn(
                        'flex items-center gap-1',
                        header.column.getCanSort() && 'cursor-pointer hover:text-text',
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-muted">
                          {header.column.getIsSorted() === 'asc' ? (
                            <FiChevronUp />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <FiChevronDown />
                          ) : (
                            <FiMinus className="opacity-40" />
                          )}
                        </span>
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : undefined}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn(cell.column.columnDef.meta?.wrap && 'whitespace-normal break-words align-top max-w-md')}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.ceil(total / pageSize) || 1

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
      <p className="text-sm text-muted">
        Showing page {page} of {totalPages} ({total} total)
      </p>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-[var(--clay-glass-edge)] bg-white/90 backdrop-blur-md px-2 py-1.5 text-sm text-[var(--clay-text-sharp)]"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="lms-btn-previous rounded-lg px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="lms-btn-next rounded-lg px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder = 'Search...' }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="lms-search w-full sm:w-72"
    />
  )
}
