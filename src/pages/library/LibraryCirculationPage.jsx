import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiAlertCircle,
  FiBookOpen,
  FiCheckCircle,
  FiRefreshCw,
  FiSearch,
  FiUser,
} from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { HubPageShell } from '@/components/hub/HubWidgets'
import { libraryService } from '@/api/services'
import { getErrorMessage, unwrapData, unwrapList } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { useDebounce } from '@/hooks/usePagination'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  issued: 'bg-sky-100 text-sky-800',
  overdue: 'bg-rose-100 text-rose-800',
  returned: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-slate-200 text-slate-700',
}

const DUPLICATE_ISSUE_MESSAGE = 'This book is already issued to this student. Please return it before borrowing again.'
const OVERDUE_FINE_AMOUNT = 100

const BORROWER_LABELS = {
  student: 'Student',
  teacher: 'Teacher',
  staff: 'Staff',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatBookDetails(book) {
  const parts = [
    book.author,
    book.isbn ? `ISBN ${book.isbn}` : null,
    book.shelf_location ? `Shelf ${book.shelf_location}` : null,
    book.category || null,
    `${book.available_copies ?? 0}/${book.total_copies ?? 0} avail.`,
  ].filter(Boolean)
  return parts.join(' · ')
}

function resolveBookId(book) {
  return String(book?.book_id || book?.id || '')
}

function todayIsoDate() {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

function computeOverdueFine(dueDate, returnDate) {
  if (!dueDate || !returnDate) return 0
  const due = new Date(`${String(dueDate).slice(0, 10)}T00:00:00`)
  const ret = new Date(`${String(returnDate).slice(0, 10)}T00:00:00`)
  return ret > due ? OVERDUE_FINE_AMOUNT : 0
}

function getBorrowerLookupErrorMessage(error) {
  const data = error?.response?.data
  const identifierError = data?.errors?.identifier ?? data?.error?.details?.identifier
  if (Array.isArray(identifierError) && identifierError[0]) {
    return String(identifierError[0])
  }
  if (typeof identifierError === 'string' && identifierError) {
    return identifierError
  }

  const message = getErrorMessage(error, 'Invalid admission number or employee ID.')
  if (message === 'An unexpected error occurred.') {
    return 'Invalid admission number or employee ID.'
  }
  return message
}

export default function LibraryCirculationPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const schoolScope = useSchoolScopedSelection()
  const { schoolId } = schoolScope
  const [tab, setTab] = useState('active')
  const [search, setSearch] = useState('')
  const [identifierInput, setIdentifierInput] = useState('')
  const [lookupKey, setLookupKey] = useState('')
  const [bookSearch, setBookSearch] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)
  const [issueForm, setIssueForm] = useState({ book_id: '', due_date: '', notes: '' })
  const [returnTarget, setReturnTarget] = useState(null)
  const [returnForm, setReturnForm] = useState({ return_date: todayIsoDate(), reason: '' })
  const debouncedBookSearch = useDebounce(bookSearch.trim(), 350)

  const borrowerQuery = useQuery({
    queryKey: ['library-borrower-lookup', schoolId, lookupKey],
    queryFn: () => libraryService.issues.lookup({ school: schoolId, identifier: lookupKey }),
    enabled: Boolean(schoolId) && Boolean(lookupKey),
    retry: false,
  })

  const borrower = unwrapData(borrowerQuery.data)
  const borrowerIssues = borrower?.active_issues || []

  const listParams = useMemo(() => {
    const params = schoolId ? { school: schoolId } : {}
    if (tab === 'overdue') params.status = 'overdue'
    if (tab === 'returned') params.status = 'returned'
    if (search.trim()) params.search = search.trim()

    if (borrower?.borrower_id) {
      if (borrower.borrower_type === 'student') params.student = borrower.borrower_id
      else if (borrower.borrower_type === 'teacher') params.teacher = borrower.borrower_id
      else if (borrower.borrower_type === 'staff') params.staff = borrower.borrower_id
    }

    return params
  }, [schoolId, tab, search, borrower])

  const issuesQuery = useQuery({
    queryKey: ['library-issues', listParams],
    queryFn: () => libraryService.issues.list(listParams),
    enabled:
      (Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin)
      && Boolean(lookupKey)
      && Boolean(borrower?.borrower_id)
      && !borrowerQuery.isFetching,
  })

  const booksQuery = useQuery({
    queryKey: ['library-books-search', schoolId, debouncedBookSearch],
    queryFn: () => libraryService.books.list({
      school: schoolId,
      status: 'available',
      search: debouncedBookSearch,
      page_size: 20,
    }),
    enabled: Boolean(schoolId) && Boolean(borrower?.borrower_id) && debouncedBookSearch.length >= 2,
  })

  const issuesRaw = useMemo(
    () => unwrapList(issuesQuery.data).results || [],
    [issuesQuery.data],
  )
  const issues = useMemo(() => {
    if (tab === 'active') {
      return issuesRaw.filter((row) => row.status === 'issued' || row.status === 'overdue')
    }
    return issuesRaw
  }, [issuesRaw, tab])

  const books = useMemo(
    () => (unwrapList(booksQuery.data).results || []).filter((b) => (b.available_copies ?? 0) > 0),
    [booksQuery.data],
  )

  const alreadyIssuedBookIds = useMemo(
    () => new Set(borrowerIssues.map((row) => String(row.book || row.book_id || '')).filter(Boolean)),
    [borrowerIssues],
  )

  const searchableBooks = useMemo(
    () => books.filter((b) => !alreadyIssuedBookIds.has(resolveBookId(b))),
    [books, alreadyIssuedBookIds],
  )

  useEffect(() => {
    setBookSearch('')
    setSelectedBook(null)
    setIssueForm((prev) => ({ ...prev, book_id: '' }))
    setSearch('')
  }, [lookupKey])

  useEffect(() => {
    if (selectedBook && alreadyIssuedBookIds.has(resolveBookId(selectedBook))) {
      setSelectedBook(null)
      setIssueForm((prev) => ({ ...prev, book_id: '' }))
    }
  }, [alreadyIssuedBookIds, selectedBook])

  const handleSelectBook = (book) => {
    setSelectedBook(book)
    setIssueForm((prev) => ({ ...prev, book_id: resolveBookId(book) }))
    setBookSearch('')
  }

  const handleClearSelectedBook = () => {
    setSelectedBook(null)
    setIssueForm((prev) => ({ ...prev, book_id: '' }))
  }

  const returnFinePreview = useMemo(
    () => (returnTarget ? computeOverdueFine(returnTarget.due_date, returnForm.return_date) : 0),
    [returnTarget, returnForm.return_date],
  )

  const openReturnModal = (row) => {
    setReturnTarget(row)
    setReturnForm({ return_date: todayIsoDate(), reason: '' })
  }

  const closeReturnModal = () => {
    setReturnTarget(null)
    setReturnForm({ return_date: todayIsoDate(), reason: '' })
  }

  const handleConfirmReturn = () => {
    if (!returnTarget) return
    const id = returnTarget.issue_id || returnTarget.id
    const fine = computeOverdueFine(returnTarget.due_date, returnForm.return_date)
    if (fine > 0 && !returnForm.reason.trim()) {
      toast.error('Reason is required when returning an overdue book')
      return
    }
    returnMutation.mutate({
      id,
      data: {
        return_date: returnForm.return_date,
        reason: returnForm.reason.trim(),
        ...(fine > 0 ? { fine_amount: fine } : {}),
      },
    })
  }

  const issueMutation = useMutation({
    mutationFn: (payload) => libraryService.issues.issue(payload),
    onSuccess: () => {
      toast.success('Book issued successfully')
      setIssueForm({ book_id: '', due_date: '', notes: '' })
      setSelectedBook(null)
      setBookSearch('')
      queryClient.invalidateQueries({ queryKey: ['library-issues'] })
      queryClient.invalidateQueries({ queryKey: ['library-books'] })
      queryClient.invalidateQueries({ queryKey: ['library-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['library-members'] })
      queryClient.invalidateQueries({ queryKey: ['library-borrower-lookup'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const returnMutation = useMutation({
    mutationFn: ({ id, data }) => libraryService.issues.return(id, data),
    onSuccess: (response) => {
      const row = unwrapData(response)
      const fine = Number(row?.fine_amount || 0)
      toast.success(
        fine > 0
          ? `Book returned. Overdue fine ₹${fine} recorded.`
          : 'Book returned successfully',
      )
      closeReturnModal()
      queryClient.invalidateQueries({ queryKey: ['library-issues'] })
      queryClient.invalidateQueries({ queryKey: ['library-books'] })
      queryClient.invalidateQueries({ queryKey: ['library-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['library-members'] })
      queryClient.invalidateQueries({ queryKey: ['library-borrower-lookup'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleLookup = (e) => {
    e?.preventDefault?.()
    const value = identifierInput.trim()
    if (!value) {
      toast.error('Enter admission number or employee ID')
      return
    }
    setLookupKey(value)
  }

  const handleIssue = (e) => {
    e.preventDefault()
    if (!lookupKey || !borrower?.borrower_id) {
      toast.error('Look up a student or staff member first')
      return
    }
    if (!issueForm.book_id || !selectedBook) {
      toast.error('Search and select a book to issue')
      return
    }
    if (borrower.is_blocked) {
      toast.error('This member is blocked from borrowing')
      return
    }
    if (alreadyIssuedBookIds.has(String(issueForm.book_id))) {
      toast.error(DUPLICATE_ISSUE_MESSAGE)
      return
    }
    const payload = {
      book_id: issueForm.book_id,
      identifier: lookupKey,
      due_date: issueForm.due_date || undefined,
      notes: issueForm.notes || undefined,
      ...(schoolId ? { school_id: schoolId } : {}),
    }
    issueMutation.mutate(payload)
  }

  if (!schoolId && !user?.is_super_admin && !user?.is_org_admin) {
    return <ErrorState message="Choose a school to manage library circulation." />
  }

  return (
    <HubPageShell className="space-y-6">
      <Breadcrumb items={[{ label: 'Library', href: '/library' }, { label: 'Issue & Return' }]} />
      <PageHeader
        title="Issue & Return"
        subtitle="Enter admission number or employee ID to fetch borrower, issue books, and process returns"
        actions={
          <Button variant="refresh" onClick={() => issuesQuery.refetch()} disabled={issuesQuery.isFetching}>
            <FiRefreshCw className={cn(issuesQuery.isFetching && 'animate-spin')} /> Refresh
          </Button>
        }
      />

      {(!schoolScope.schoolLocked && schoolScope.schoolOptions.length > 1) ? (
        <div className="max-w-sm">
          <SelectField
            label="School"
            value={schoolScope.schoolId}
            onChange={(e) => {
              schoolScope.setSchoolId(e.target.value)
              setLookupKey('')
              setIdentifierInput('')
            }}
            options={schoolScope.schoolOptions}
            placeholder="Select school…"
          />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="lms-form-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="clay-icon-3d flex h-10 w-10 items-center justify-center">
                <FiSearch className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-[var(--clay-text-sharp)]">Find borrower</h2>
                <p className="text-xs text-[var(--clay-primary-soft)]">
                  Student admission no. · Teacher/staff employee ID
                </p>
              </div>
            </div>
            <form className="flex gap-2" onSubmit={handleLookup}>
              <Input
                label="Admission / Employee ID"
                value={identifierInput}
                onChange={(e) => setIdentifierInput(e.target.value)}
                placeholder="e.g. GREENWOO-2026-0001 or EMP-1024"
                className="flex-1"
              />
              <div className="flex items-end pb-0.5">
                <Button type="submit" disabled={borrowerQuery.isFetching}>
                  {borrowerQuery.isFetching ? '…' : 'Find'}
                </Button>
              </div>
            </form>
            {borrowerQuery.isError ? (
              <p className="mt-3 text-sm text-rose-600">{getBorrowerLookupErrorMessage(borrowerQuery.error)}</p>
            ) : null}
            {lookupKey && !borrowerQuery.isFetching && !borrowerQuery.isError && !borrower?.borrower_id ? (
              <p className="mt-3 text-sm text-rose-600">Invalid admission number or employee ID.</p>
            ) : null}
          </Card>

          {borrower?.borrower_id ? (
            <Card className="lms-form-card p-5">
              <div className="flex items-start gap-3">
                <div className="clay-icon-3d flex h-12 w-12 shrink-0 items-center justify-center">
                  <FiUser className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--clay-teal)]">
                    {BORROWER_LABELS[borrower.borrower_type] || 'Member'}
                  </p>
                  <p className="truncate font-bold text-[var(--clay-text-sharp)]">{borrower.borrower_name}</p>
                  <p className="text-sm text-[var(--clay-primary-soft)]">
                    {borrower.borrower_code}
                    {borrower.subtitle ? ` · ${borrower.subtitle}` : ''}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white/80 px-2.5 py-1 font-medium">
                      Issued: {borrower.books_issued}/{borrower.issue_limit}
                    </span>
                    {borrower.is_blocked ? (
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 font-medium text-rose-800">Blocked</span>
                    ) : null}
                    {borrower.fine_amount > 0 ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-900">
                        Fine ₹{borrower.fine_amount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {borrowerIssues.length > 0 ? (
                <div className="mt-4 space-y-2 border-t border-[var(--clay-border)] pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--clay-primary-soft)]">
                    Books to return
                  </p>
                  {borrowerIssues.map((row) => {
                    const id = row.issue_id || row.id
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-[var(--clay-border)] bg-white/50 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[var(--clay-text-sharp)]">{row.book_title}</p>
                          <p className="text-xs text-[var(--clay-primary-soft)]">Due {formatDate(row.due_date)}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={returnMutation.isPending}
                          onClick={() => openReturnModal(row)}
                        >
                          <FiCheckCircle /> Return
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[var(--clay-primary-soft)]">No active loans for this member.</p>
              )}
            </Card>
          ) : null}

          <Card className="lms-form-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="clay-icon-3d flex h-10 w-10 items-center justify-center">
                <FiBookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-[var(--clay-text-sharp)]">Issue a book</h2>
                <p className="text-xs text-[var(--clay-primary-soft)]">Find borrower first · default loan 14 days</p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleIssue}>
              <div className="space-y-2">
                <Input
                  label="Search book"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Title, ISBN, author, shelf / accession no."
                  disabled={!borrower?.borrower_id || borrower?.is_blocked || Boolean(selectedBook)}
                />
                {!borrower?.borrower_id ? (
                  <p className="text-xs text-[var(--clay-primary-soft)]">Find a borrower first to search books.</p>
                ) : selectedBook ? null : bookSearch.trim().length > 0 && bookSearch.trim().length < 2 ? (
                  <p className="text-xs text-[var(--clay-primary-soft)]">Type at least 2 characters to search.</p>
                ) : debouncedBookSearch.length >= 2 && booksQuery.isFetching ? (
                  <p className="text-xs text-[var(--clay-primary-soft)]">Searching catalog…</p>
                ) : debouncedBookSearch.length >= 2 && !booksQuery.isFetching && searchableBooks.length === 0 ? (
                  <p className="text-xs text-rose-600">No matching books found.</p>
                ) : null}
              </div>

              {selectedBook ? (
                <div className="rounded-xl border border-[var(--clay-teal)]/30 bg-white/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--clay-text-sharp)]">{selectedBook.title}</p>
                      <p className="text-xs text-[var(--clay-primary-soft)]">{formatBookDetails(selectedBook)}</p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-xs font-medium text-[var(--clay-teal)] hover:underline"
                      onClick={handleClearSelectedBook}
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : null}

              {!selectedBook && debouncedBookSearch.length >= 2 && searchableBooks.length > 0 ? (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-[var(--clay-border)] bg-white/50 p-2">
                  {searchableBooks.map((book) => {
                    const id = resolveBookId(book)
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSelectBook(book)}
                        className="w-full rounded-lg border border-transparent px-3 py-2 text-left transition hover:border-[var(--clay-teal)]/30 hover:bg-white"
                      >
                        <p className="font-medium text-[var(--clay-text-sharp)]">{book.title}</p>
                        <p className="text-xs text-[var(--clay-primary-soft)]">{formatBookDetails(book)}</p>
                      </button>
                    )
                  })}
                </div>
              ) : null}

              {borrowerIssues.length > 0 ? (
                <p className="text-xs text-amber-800">
                  Books already on loan to this {borrower?.borrower_type === 'student' ? 'student' : 'member'} must be
                  returned first and will not appear in search results.
                </p>
              ) : null}
              <Input
                label="Due date"
                type="date"
                value={issueForm.due_date}
                onChange={(e) => setIssueForm((p) => ({ ...p, due_date: e.target.value }))}
                disabled={!borrower?.borrower_id}
              />
              <Input
                label="Notes"
                value={issueForm.notes}
                onChange={(e) => setIssueForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Optional note"
                disabled={!borrower?.borrower_id}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={issueMutation.isPending || !borrower?.borrower_id || borrower?.is_blocked || !selectedBook}
              >
                Issue Book
              </Button>
            </form>
          </Card>
        </div>

        <Card className="lms-form-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--clay-border)] p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'active', label: 'Active' },
                  { key: 'overdue', label: 'Overdue' },
                  { key: 'returned', label: 'Returned' },
                  { key: 'all', label: 'All' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    disabled={!borrower?.borrower_id}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-medium transition',
                      tab === item.key
                        ? 'bg-[var(--clay-teal)] text-white'
                        : 'bg-white/70 text-[var(--clay-primary-soft)] hover:bg-white',
                      !borrower?.borrower_id && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {borrower?.borrower_name ? (
                <p className="mt-2 text-xs text-[var(--clay-primary-soft)]">
                  Showing records for <span className="font-semibold text-[var(--clay-text-sharp)]">{borrower.borrower_name}</span>
                  {borrower.borrower_code ? ` (${borrower.borrower_code})` : ''}
                </p>
              ) : null}
            </div>
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search book title…"
                disabled={!borrower?.borrower_id}
                className="lms-input w-full pl-9 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {!borrower?.borrower_id ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <FiUser className="h-10 w-10 text-[var(--clay-primary-soft)]" />
              <p className="font-medium text-[var(--clay-text-sharp)]">Find a borrower first</p>
              <p className="max-w-sm text-sm text-[var(--clay-primary-soft)]">
                Enter an admission number or employee ID on the left, then click Find to view that member&apos;s active, overdue, and returned books here.
              </p>
            </div>
          ) : issuesQuery.isLoading ? (
            <PageLoader />
          ) : issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <FiAlertCircle className="h-10 w-10 text-[var(--clay-primary-soft)]" />
              <p className="font-medium text-[var(--clay-text-sharp)]">No records in this view</p>
              <p className="max-w-sm text-sm text-[var(--clay-primary-soft)]">
                {borrower.borrower_name} has no {tab === 'all' ? '' : `${tab} `}library issues in this tab.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--clay-border)] text-sm">
                <thead className="bg-white/50">
                  <tr>
                    {['Book', 'Borrower', 'Issued', 'Due', 'Status', 'Fine', ''].map((h) => (
                      <th key={h || 'actions'} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--clay-primary-soft)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--clay-border)]">
                  {issues.map((row) => {
                    const id = row.issue_id || row.id
                    const canReturn = row.status === 'issued' || row.status === 'overdue'
                    return (
                      <tr key={id} className="hover:bg-white/40">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--clay-text-sharp)]">{row.book_title}</p>
                          <p className="text-xs text-[var(--clay-primary-soft)]">{row.book_author}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{row.student_name}</p>
                          <p className="text-xs text-[var(--clay-primary-soft)]">
                            {BORROWER_LABELS[row.borrower_type] || 'Member'} · {row.admission_number}
                          </p>
                        </td>
                        <td className="px-4 py-3">{formatDate(row.issued_at)}</td>
                        <td className="px-4 py-3">{formatDate(row.due_date)}</td>
                        <td className="px-4 py-3">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', STATUS_STYLES[row.status] || 'bg-slate-100')}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{row.fine_amount ? `₹${row.fine_amount}` : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          {canReturn ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={returnMutation.isPending}
                              onClick={() => openReturnModal(row)}
                            >
                              <FiCheckCircle /> Return
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <p className="text-sm text-[var(--clay-primary-soft)]">
        Need to add titles first? <Link to="/library/books" className="font-medium text-[var(--clay-teal)] hover:underline">Open book catalog</Link>
      </p>

      <Modal
        open={Boolean(returnTarget)}
        onClose={closeReturnModal}
        title="Return Book"
        size="md"
        footer={(
          <>
            <Button variant="cancel" onClick={closeReturnModal}>Cancel</Button>
            <Button
              variant="upload"
              loading={returnMutation.isPending}
              onClick={handleConfirmReturn}
            >
              <FiCheckCircle /> Return Book
            </Button>
          </>
        )}
      >
        {returnTarget ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--clay-border)] bg-white/60 p-4">
              <p className="font-semibold text-[var(--clay-text-sharp)]">{returnTarget.book_title}</p>
              <p className="text-sm text-[var(--clay-primary-soft)]">
                Due {formatDate(returnTarget.due_date)}
                {returnTarget.status === 'overdue' ? ' · Overdue' : ''}
              </p>
            </div>
            <Input
              label="Return date"
              type="date"
              value={returnForm.return_date}
              onChange={(e) => setReturnForm((prev) => ({ ...prev, return_date: e.target.value }))}
              required
            />
            {returnFinePreview > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-semibold">Overdue fine: ₹{returnFinePreview}</p>
                <p className="mt-1 text-xs">Return date is after the due date. Collect ₹{OVERDUE_FINE_AMOUNT} and enter a reason below.</p>
              </div>
            ) : (
              <p className="text-xs text-[var(--clay-primary-soft)]">No overdue fine for the selected return date.</p>
            )}
            <Input
              label="Reason"
              value={returnForm.reason}
              onChange={(e) => setReturnForm((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder={returnFinePreview > 0 ? 'Required — e.g. late return, book damaged' : 'Optional note for this return'}
              required={returnFinePreview > 0}
            />
          </div>
        ) : null}
      </Modal>
    </HubPageShell>
  )
}
