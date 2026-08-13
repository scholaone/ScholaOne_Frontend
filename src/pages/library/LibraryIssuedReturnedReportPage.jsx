import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiDownload, FiRefreshCw } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { HubPageShell, HubStatGrid } from '@/components/hub/HubWidgets'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { libraryService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { exportToCsv } from '@/utils/format'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Issued', value: 'issued' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Returned', value: 'returned' },
  { label: 'Lost', value: 'lost' },
]

const DATE_MODE_OPTIONS = [
  { label: 'Issued date', value: 'issued' },
  { label: 'Return date', value: 'returned' },
  { label: 'Due date', value: 'due' },
]

const STATUS_STYLES = {
  issued: 'bg-sky-100 text-sky-800',
  overdue: 'bg-rose-100 text-rose-800',
  returned: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-slate-200 text-slate-700',
}

const BORROWER_LABELS = {
  student: 'Student',
  teacher: 'Teacher',
  staff: 'Staff',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function buildReportParams({ schoolId, status, dateMode, fromDate, toDate, search }) {
  const params = {
    school: schoolId,
    page_size: 500,
    ordering: '-issued_at',
  }
  if (status) params.status = status
  if (search.trim()) params.search = search.trim()
  if (fromDate) {
    if (dateMode === 'issued') params.issued_from = fromDate
    if (dateMode === 'returned') params.returned_from = fromDate
    if (dateMode === 'due') params.due_from = fromDate
  }
  if (toDate) {
    if (dateMode === 'issued') params.issued_to = toDate
    if (dateMode === 'returned') params.returned_to = toDate
    if (dateMode === 'due') params.due_to = toDate
  }
  return params
}

export default function LibraryIssuedReturnedReportPage() {
  const { user } = useAuth()
  const schoolScope = useSchoolScopedSelection()
  const { schoolId } = schoolScope
  const [status, setStatus] = useState('')
  const [dateMode, setDateMode] = useState('issued')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [search, setSearch] = useState('')

  const reportParams = useMemo(
    () => buildReportParams({ schoolId, status, dateMode, fromDate, toDate, search }),
    [schoolId, status, dateMode, fromDate, toDate, search],
  )

  const reportQuery = useQuery({
    queryKey: ['library-issued-returned-report', reportParams],
    queryFn: () => libraryService.issues.report(reportParams),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const report = unwrapData(reportQuery.data) || {}
  const summary = report.summary || {}
  const rows = report.results || []

  const handleExport = () => {
    if (!rows.length) {
      toast.error('No records to export')
      return
    }
    exportToCsv(
      rows,
      [
        { header: 'Book Title', accessor: (r) => r.book_title || '' },
        { header: 'Author', accessor: (r) => r.book_author || '' },
        { header: 'ISBN', accessor: (r) => r.isbn || '' },
        { header: 'Borrower', accessor: (r) => r.student_name || '' },
        { header: 'Borrower ID', accessor: (r) => r.admission_number || '' },
        { header: 'Borrower Type', accessor: (r) => BORROWER_LABELS[r.borrower_type] || r.borrower_type || '' },
        { header: 'Issued Date', accessor: (r) => formatDate(r.issued_at) },
        { header: 'Due Date', accessor: (r) => formatDate(r.due_date) },
        { header: 'Return Date', accessor: (r) => formatDate(r.returned_at) },
        { header: 'Status', accessor: (r) => r.status || '' },
        { header: 'Fine (₹)', accessor: (r) => r.fine_amount || '' },
        { header: 'Issued By', accessor: (r) => r.issued_by_name || '' },
      ],
      'library-issued-returned-report.csv',
    )
    toast.success('Report exported')
  }

  if (!schoolId && !user?.is_super_admin && !user?.is_org_admin) {
    return <ErrorState message="Choose a school to view the library report." />
  }

  return (
    <HubPageShell className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Library', href: '/library' },
          { label: 'Issued & Returned Report' },
        ]}
      />
      <PageHeader
        title="Issued & Returned Report"
        subtitle="School-wide library circulation — filter by status, dates, and export to Excel"
        actions={(
          <div className="flex flex-wrap gap-2">
            <Button variant="refresh" onClick={() => reportQuery.refetch()} disabled={reportQuery.isFetching}>
              <FiRefreshCw className={cn(reportQuery.isFetching && 'animate-spin')} /> Refresh
            </Button>
            <Button variant="excel" onClick={handleExport} disabled={!rows.length}>
              <FiDownload /> Export Excel
            </Button>
            <Link to="/library/circulation">
              <Button variant="secondary">Issue & Return</Button>
            </Link>
          </div>
        )}
      />

      <Card className="lms-form-card p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(!schoolScope.schoolLocked && schoolScope.schoolOptions.length > 1) ? (
            <SchoolScopeField
              schoolId={schoolScope.schoolId}
              setSchoolId={schoolScope.setSchoolId}
              schoolOptions={schoolScope.schoolOptions}
              selectedSchoolLabel={schoolScope.selectedSchoolLabel}
              schoolLocked={schoolScope.schoolLocked}
            />
          ) : null}
          <SelectField
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
          <SelectField
            label="Date filter"
            value={dateMode}
            onChange={(e) => setDateMode(e.target.value)}
            options={DATE_MODE_OPTIONS}
          />
          <Input
            label="From date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            label="To date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <Input
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Book title, ISBN, borrower name…"
          />
        </div>
      </Card>

      {reportQuery.isLoading ? (
        <PageLoader label="Loading report…" />
      ) : reportQuery.isError ? (
        <ErrorState message={getErrorMessage(reportQuery.error)} onRetry={() => reportQuery.refetch()} />
      ) : (
        <>
          <HubStatGrid
            stats={[
              { label: 'Total Records', value: summary.total_records ?? 0 },
              { label: 'Currently Issued', value: summary.currently_issued ?? 0 },
              { label: 'Returned', value: summary.returned_count ?? 0 },
              { label: 'Overdue', value: summary.overdue_count ?? 0 },
              { label: 'Fines (₹)', value: summary.total_fines ?? 0 },
            ]}
          />

          <Card className="lms-form-card overflow-hidden">
            {rows.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-[var(--clay-primary-soft)]">
                No library issues match the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--clay-border)] text-sm">
                  <thead className="bg-white/50">
                    <tr>
                      {[
                        'Book',
                        'Borrower',
                        'Issued',
                        'Due',
                        'Returned',
                        'Status',
                        'Fine',
                        'Issued By',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--clay-primary-soft)]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--clay-border)]">
                    {rows.map((row) => {
                      const id = row.issue_id || row.id
                      return (
                        <tr key={id} className="hover:bg-white/40">
                          <td className="px-4 py-3">
                            <p className="font-medium text-[var(--clay-text-sharp)]">{row.book_title}</p>
                            <p className="text-xs text-[var(--clay-primary-soft)]">{row.book_author}{row.isbn ? ` · ${row.isbn}` : ''}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{row.student_name}</p>
                            <p className="text-xs text-[var(--clay-primary-soft)]">
                              {BORROWER_LABELS[row.borrower_type] || 'Member'} · {row.admission_number || '—'}
                            </p>
                          </td>
                          <td className="px-4 py-3">{formatDate(row.issued_at)}</td>
                          <td className="px-4 py-3">{formatDate(row.due_date)}</td>
                          <td className="px-4 py-3">{formatDate(row.returned_at)}</td>
                          <td className="px-4 py-3">
                            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', STATUS_STYLES[row.status] || 'bg-slate-100')}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">{row.fine_amount ? `₹${row.fine_amount}` : '—'}</td>
                          <td className="px-4 py-3">{row.issued_by_name || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </HubPageShell>
  )
}
