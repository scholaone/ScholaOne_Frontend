import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiLink, FiTrash2, FiUsers } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { academicServices, academicYearService, teacherService } from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { resolveRecordId } from '@/utils/record'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { cn } from '@/lib/utils'

function formatClassSection(row) {
  if (row.class_section_label) return row.class_section_label
  const cls = row.class_name || 'Class'
  const sec = row.section_name || 'Section'
  return `${cls} — ${sec}`
}

export default function ClassTeacherMappingPage() {
  const queryClient = useQueryClient()
  const {
    schoolId,
    setSchoolId,
    resolvedOrgId,
    listRequestConfig,
    schoolOptions,
    schoolsQuery,
    selectedSchoolLabel,
    schoolLocked,
  } = useSchoolScopedSelection()

  const [academicYearId, setAcademicYearId] = useState('')
  const [teacherUserId, setTeacherUserId] = useState('')
  const [classSectionId, setClassSectionId] = useState('')
  const [isPrimary, setIsPrimary] = useState(true)

  useEffect(() => {
    setAcademicYearId('')
    setTeacherUserId('')
    setClassSectionId('')
  }, [schoolId])

  useEffect(() => {
    setTeacherUserId('')
    setClassSectionId('')
  }, [academicYearId])

  const yearsQuery = useQuery({
    queryKey: ['class-teacher-years', schoolId, resolvedOrgId],
    queryFn: () =>
      academicYearService.list(
        {
          page_size: 100,
          school: schoolId,
          ...(resolvedOrgId ? { organization: resolvedOrgId } : {}),
          ordering: '-start_date',
        },
        listRequestConfig,
      ),
    enabled: Boolean(schoolId),
  })

  const yearOptions = useMemo(() => {
    const { results } = unwrapList(yearsQuery.data)
    return (results || []).map((y) => ({
      value: String(resolveRecordId(y) || y.id),
      label: `${y.name || y.label || 'Academic year'}${y.is_current ? ' (Current)' : ''}`,
      isCurrent: Boolean(y.is_current),
    }))
  }, [yearsQuery.data])

  useEffect(() => {
    if (!yearOptions.length) {
      if (academicYearId) setAcademicYearId('')
      return
    }
    const stillValid = yearOptions.some((y) => y.value === academicYearId)
    if (stillValid) return
    const current = yearOptions.find((y) => y.isCurrent) || yearOptions[0]
    if (current) setAcademicYearId(current.value)
  }, [yearOptions, academicYearId])

  const teachersQuery = useQuery({
    queryKey: ['class-teacher-teachers', schoolId],
    queryFn: () =>
      teacherService.list({
        page_size: 500,
        school: schoolId,
        status: 'active',
        ordering: 'employee_id',
      }),
    enabled: Boolean(schoolId),
  })

  const teacherOptions = useMemo(() => {
    const { results } = unwrapList(teachersQuery.data)
    return (results || [])
      .filter((t) => t.user_id)
      .map((t) => ({
        value: String(t.user_id),
        label: [t.full_name, t.employee_id ? `(${t.employee_id})` : null].filter(Boolean).join(' '),
      }))
  }, [teachersQuery.data])

  const sectionsQuery = useQuery({
    queryKey: ['class-teacher-sections', schoolId, academicYearId],
    queryFn: () =>
      academicServices.classSections.list({
        page_size: 500,
        school: schoolId,
        academic_year: academicYearId,
        is_active: true,
        ordering: 'class_name',
      }),
    enabled: Boolean(schoolId && academicYearId),
  })

  const classOptions = useMemo(() => {
    const { results } = unwrapList(sectionsQuery.data)
    return (results || []).map((row) => ({
      value: String(resolveRecordId(row) || row.id),
      label: formatClassSection(row),
    }))
  }, [sectionsQuery.data])

  const mappingsQuery = useQuery({
    queryKey: ['class-teacher-mappings', schoolId, academicYearId],
    queryFn: () =>
      academicServices.classTeachers.list({
        page_size: 500,
        school: schoolId,
        academic_year: academicYearId,
      }),
    enabled: Boolean(schoolId && academicYearId),
  })

  const mappings = useMemo(() => unwrapList(mappingsQuery.data).results || [], [mappingsQuery.data])

  const mapMutation = useMutation({
    mutationFn: () =>
      academicServices.classTeachers.create({
        organization_id: resolvedOrgId,
        school_id: schoolId,
        academic_year_id: academicYearId,
        class_section: classSectionId,
        teacher: teacherUserId,
        is_primary: isPrimary,
        is_active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-teacher-mappings'] })
      toast.success('Class teacher mapped')
      setTeacherUserId('')
      setClassSectionId('')
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not map class teacher')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => academicServices.classTeachers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-teacher-mappings'] })
      toast.success('Mapping removed')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const canMap = Boolean(schoolId && academicYearId && teacherUserId && classSectionId && resolvedOrgId)

  if (schoolsQuery.isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Class Teacher Mapping' }]} />
      <PageHeader
        title="Class Teacher Mapping"
        subtitle="Assign a teacher to a class section for the selected academic year."
        actions={
          <Link to="/teachers/roster">
            <Button variant="secondary">
              <FiUsers className="h-4 w-4" /> Teacher roster
            </Button>
          </Link>
        }
      />

      <Card>
        <h3 className="mb-3 text-sm font-semibold">Scope</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SchoolScopeField
            schoolId={schoolId}
            setSchoolId={setSchoolId}
            schoolOptions={schoolOptions}
            selectedSchoolLabel={selectedSchoolLabel}
            schoolLocked={schoolLocked}
          />
          <SelectField
            label="Academic year"
            required
            value={academicYearId}
            onChange={(e) => setAcademicYearId(e.target.value)}
            options={yearOptions}
            placeholder={
              yearsQuery.isLoading
                ? 'Loading years...'
                : yearOptions.length
                  ? 'Select academic year...'
                  : 'No academic years'
            }
            disabled={yearsQuery.isLoading || !schoolId}
          />
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <FiLink className="h-4 w-4 text-primary" /> Map class teacher
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label="Teacher"
            required
            value={teacherUserId}
            onChange={(e) => setTeacherUserId(e.target.value)}
            options={teacherOptions}
            placeholder={
              teachersQuery.isLoading
                ? 'Loading teachers...'
                : teacherOptions.length
                  ? 'Select teacher...'
                  : 'No active teachers'
            }
            disabled={!schoolId || teachersQuery.isLoading}
          />
          <SelectField
            label="Class"
            required
            value={classSectionId}
            onChange={(e) => setClassSectionId(e.target.value)}
            options={classOptions}
            placeholder={
              sectionsQuery.isLoading
                ? 'Loading classes...'
                : classOptions.length
                  ? 'Select class section...'
                  : 'No active classes for this year'
            }
            disabled={!academicYearId || sectionsQuery.isLoading}
          />
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
            />
            Primary class teacher
          </label>
          <div className="flex items-end">
            <Button
              loading={mapMutation.isPending}
              disabled={!canMap}
              onClick={() => mapMutation.mutate()}
            >
              Map
            </Button>
          </div>
        </div>
        {!classOptions.length && academicYearId && !sectionsQuery.isLoading ? (
          <p className="mt-3 text-sm text-muted">
            No active class sections for this year.{' '}
            <Link to="/academics/class-sections" className="font-medium text-primary underline">
              Activate classes
            </Link>{' '}
            or{' '}
            <Link to="/masters/setup/map" className="font-medium text-primary underline">
              map standards & sections
            </Link>
            .
          </p>
        ) : null}
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Mapped class teachers</h3>
          <p className="text-sm text-muted">
            Total: <span className="font-semibold text-foreground">{mappings.length}</span>
          </p>
        </div>

        {!schoolId || !academicYearId ? (
          <p className="text-sm text-muted">Select school and academic year to view mappings.</p>
        ) : mappingsQuery.isLoading ? (
          <PageLoader />
        ) : mappingsQuery.error ? (
          <ErrorState message={getErrorMessage(mappingsQuery.error)} onRetry={() => mappingsQuery.refetch()} />
        ) : mappings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
            No class teachers mapped yet. Use the form above to assign a teacher to a class.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Class</th>
                  <th className="px-3 py-2 text-left font-semibold">Teacher</th>
                  <th className="px-3 py-2 text-left font-semibold">Primary</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((row) => {
                  const id = resolveRecordId(row)
                  return (
                    <tr key={id} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{row.class_section_label || '—'}</td>
                      <td className="px-3 py-2">{row.teacher_name || '—'}</td>
                      <td className="px-3 py-2">{row.is_primary ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                            row.is_active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-slate-100 text-slate-600',
                          )}
                        >
                          {row.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          size="sm"
                          variant="danger"
                          loading={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm('Remove this class teacher mapping?')) {
                              deleteMutation.mutate(id)
                            }
                          }}
                        >
                          <FiTrash2 className="h-4 w-4" /> Remove
                        </Button>
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
  )
}
