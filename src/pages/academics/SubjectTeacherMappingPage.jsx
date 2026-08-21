import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiBookOpen, FiTrash2, FiUsers } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { ToggleSwitch } from '@/components/navigation/NavAdminUi'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import {
  MappingEmptyState,
  MappingListCard,
  MappingTableWrap,
  ScopeFilterCard,
} from '@/components/academics/MappingFormLayout'
import {
  ClassMappingPicker,
  MAPPING_COLUMN_STACK,
  MAPPING_COLUMNS_GRID,
  MappingModeHeader,
} from '@/components/academics/TeacherMappingPicker'
import SubjectSelectField from '@/components/academics/SubjectSelectField'
import { academicServices, academicYearService, teacherService } from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { resolveRecordId } from '@/utils/record'
import {
  classSectionLabel,
  mapSchoolClassOptions,
  resolveSectionIdsFromStandard,
  resolveSectionIdsFromStandards,
} from '@/utils/classSections'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'

export default function SubjectTeacherMappingPage() {
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
  const [classMode, setClassMode] = useState('single')
  const [classSectionId, setClassSectionId] = useState('')
  const [selectedClassIds, setSelectedClassIds] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [weeklyPeriods, setWeeklyPeriods] = useState('')

  useEffect(() => {
    setAcademicYearId('')
    setTeacherUserId('')
    setClassSectionId('')
    setSelectedClassIds([])
    setSubjectId('')
    setClassMode('single')
  }, [schoolId])

  useEffect(() => {
    setTeacherUserId('')
    setClassSectionId('')
    setSelectedClassIds([])
    setSubjectId('')
  }, [academicYearId])

  const yearsQuery = useQuery({
    queryKey: ['subject-teacher-years', schoolId, resolvedOrgId],
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
    queryKey: ['subject-teacher-teachers', schoolId],
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
    queryKey: ['subject-teacher-sections', schoolId, academicYearId],
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

  const rawSections = useMemo(() => {
    const { results } = unwrapList(sectionsQuery.data)
    return results || []
  }, [sectionsQuery.data])

  const standardOptions = useMemo(
    () => mapSchoolClassOptions(rawSections),
    [rawSections],
  )

  const classSectionIdsToMap = useMemo(() => {
    if (classMode === 'multiple') {
      return resolveSectionIdsFromStandards(standardOptions, selectedClassIds)
    }
    return resolveSectionIdsFromStandard(standardOptions, classSectionId)
  }, [classMode, standardOptions, selectedClassIds, classSectionId])

  const mappingsQuery = useQuery({
    queryKey: ['subject-teacher-mappings', schoolId, academicYearId],
    queryFn: () =>
      academicServices.classSectionSubjects.list({
        page_size: 500,
        school: schoolId,
        academic_year: academicYearId,
      }),
    enabled: Boolean(schoolId && academicYearId),
  })

  const mappings = useMemo(() => unwrapList(mappingsQuery.data).results || [], [mappingsQuery.data])

  const mapMutation = useMutation({
    mutationFn: async () =>
      Promise.all(
        classSectionIdsToMap.map((classSection) =>
          academicServices.classSectionSubjects.create({
            organization_id: resolvedOrgId,
            school_id: schoolId,
            academic_year_id: academicYearId,
            class_section: classSection,
            subject: subjectId,
            teacher: teacherUserId,
            ...(weeklyPeriods ? { weekly_periods: Number(weeklyPeriods) } : {}),
            is_active: true,
          }),
        ),
      ),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['subject-teacher-mappings'] })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast.success(
        results.length === 1
          ? 'Subject teacher mapped — visible on teacher profile'
          : `Teacher mapped to ${results.length} section(s) — visible on teacher profile`,
      )
      setTeacherUserId('')
      setClassSectionId('')
      setSelectedClassIds([])
      setSubjectId('')
      setWeeklyPeriods('')
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not map subject teacher')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => academicServices.classSectionSubjects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-teacher-mappings'] })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast.success('Mapping removed')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => academicServices.classSectionSubjects.update(id, { is_active }),
    onSuccess: (_data, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ['subject-teacher-mappings'] })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast.success(is_active ? 'Mapping activated' : 'Mapping deactivated')
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not update status')),
  })

  const canMap = Boolean(
    schoolId
      && academicYearId
      && teacherUserId
      && subjectId
      && resolvedOrgId
      && classSectionIdsToMap.length,
  )

  const mapButtonLabel =
    classSectionIdsToMap.length > 1
      ? `Map to ${classSectionIdsToMap.length} sections`
      : 'Save mapping'

  const handleClassModeChange = (nextMode) => {
    setClassMode(nextMode)
    setClassSectionId('')
    setSelectedClassIds([])
  }

  if (schoolsQuery.isLoading) return <PageLoader />

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Breadcrumb items={[{ label: 'Subject Teacher Mapping' }]} />
      <PageHeader
        title="Subject Teacher Mapping"
        subtitle="Assign teachers to subjects already allocated to classes. Allocate subjects first if needed."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/academics/subject-allocation">
              <Button variant="secondary">
                <FiBookOpen className="h-4 w-4" /> Subject allocation
              </Button>
            </Link>
            <Link to="/teachers/roster">
            <Button variant="secondary">
              <FiUsers className="h-4 w-4" /> Teacher roster
            </Button>
            </Link>
          </div>
        }
      />

      <ScopeFilterCard
        footer={
          <Button
            className="ml-auto w-full sm:w-auto"
            loading={mapMutation.isPending}
            disabled={!canMap}
            onClick={() => mapMutation.mutate()}
          >
            <FiBookOpen className="h-4 w-4" />
            {mapButtonLabel}
          </Button>
        }
      >
        <div className={MAPPING_COLUMNS_GRID}>
          <div className={MAPPING_COLUMN_STACK}>
            <SchoolScopeField
              schoolId={schoolId}
              setSchoolId={setSchoolId}
              schoolOptions={schoolOptions}
              selectedSchoolLabel={selectedSchoolLabel}
              schoolLocked={schoolLocked}
            />
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
                    ? 'Choose a teacher...'
                    : 'No active teachers'
              }
              disabled={!schoolId || teachersQuery.isLoading}
            />
          </div>

          <div className={MAPPING_COLUMN_STACK}>
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
            {classMode === 'single' ? (
              <ClassMappingPicker
                mode={classMode}
                onModeChange={handleClassModeChange}
                classOptions={standardOptions}
                singleClassId={classSectionId}
                onSingleClassChange={setClassSectionId}
                selectedClassIds={selectedClassIds}
                onSelectedClassIdsChange={setSelectedClassIds}
                loading={sectionsQuery.isLoading}
                disabled={!academicYearId}
                hideModeToggle
                itemLabel="Standard"
                itemLabelPlural="Standards"
                emptyMessage="No active standards for this year"
              />
            ) : null}
          </div>

          <div className={MAPPING_COLUMN_STACK}>
            <MappingModeHeader mode={classMode} onChange={handleClassModeChange} />
            <SubjectSelectField
              label="Subject"
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              schoolId={schoolId}
              academicYearId={academicYearId}
              classSectionIds={classSectionIdsToMap}
              source="allocated"
              disabled={!classSectionIdsToMap.length}
            />
          </div>
        </div>

        {classMode === 'multiple' ? (
          <ClassMappingPicker
            mode={classMode}
            onModeChange={handleClassModeChange}
            classOptions={standardOptions}
            singleClassId={classSectionId}
            onSingleClassChange={setClassSectionId}
            selectedClassIds={selectedClassIds}
            onSelectedClassIdsChange={setSelectedClassIds}
            loading={sectionsQuery.isLoading}
            disabled={!academicYearId}
            hideModeToggle
            multipleOnly
            itemLabel="Standard"
            itemLabelPlural="Standards"
            emptyMessage="No active standards for this year"
            selectionHint="Tick every standard. All sections under it are included."
          />
        ) : null}

        <div className={MAPPING_COLUMNS_GRID}>
          <div className={MAPPING_COLUMN_STACK}>
            <Input
              label="Periods per week"
              type="number"
              min="0"
              value={weeklyPeriods}
              onChange={(e) => setWeeklyPeriods(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        {!standardOptions.length && academicYearId && !sectionsQuery.isLoading ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            No active classes for this year.{' '}
            <Link to="/academics/class-sections" className="font-semibold underline">
              Activate classes
            </Link>
            .
          </p>
        ) : null}
        {!classSectionIdsToMap.length && academicYearId ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Select at least one class before choosing a subject.
          </p>
        ) : null}
        {!schoolId ? null : (
          <p className="text-xs text-muted">
            Subjects shown are allocated to the selected class(es).{' '}
            <Link to="/academics/subject-allocation" className="font-medium text-primary hover:underline">
              Manage subject allocation
            </Link>
          </p>
        )}
      </ScopeFilterCard>

      <MappingListCard title="Current mappings" count={mappings.length}>
        {!schoolId || !academicYearId ? (
          <MappingEmptyState message="Select a school and academic year to view mappings." />
        ) : mappingsQuery.isLoading ? (
          <PageLoader />
        ) : mappingsQuery.error ? (
          <ErrorState message={getErrorMessage(mappingsQuery.error)} onRetry={() => mappingsQuery.refetch()} />
        ) : mappings.length === 0 ? (
          <MappingEmptyState message="No subject teachers mapped yet. Create your first mapping above." />
        ) : (
          <MappingTableWrap>
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Teacher</th>
                  <th className="px-4 py-3 font-semibold">Periods</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mappings.map((row) => {
                  const id = resolveRecordId(row)
                  return (
                    <tr key={id} className="bg-card hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-text">{classSectionLabel(row)}</td>
                      <td className="px-4 py-3 text-text">{row.subject_name || '—'}</td>
                      <td className="px-4 py-3 text-text">{row.teacher_name || '—'}</td>
                      <td className="px-4 py-3 text-muted">{row.weekly_periods ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ToggleSwitch
                            checked={Boolean(row.is_active)}
                            disabled={
                              toggleActiveMutation.isPending
                              && toggleActiveMutation.variables?.id === id
                            }
                            onChange={(checked) =>
                              toggleActiveMutation.mutate({ id, is_active: checked })
                            }
                            label={`Set subject teacher mapping ${row.is_active ? 'inactive' : 'active'}`}
                          />
                          <span className="text-xs font-medium text-muted">
                            {row.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="danger"
                          loading={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm('Remove this subject teacher mapping?')) {
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
          </MappingTableWrap>
        )}
      </MappingListCard>
    </div>
  )
}
