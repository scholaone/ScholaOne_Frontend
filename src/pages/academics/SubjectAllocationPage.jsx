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
  resolveSubjectIdsForMapping,
  SubjectMappingPicker,
} from '@/components/academics/TeacherMappingPicker'
import { academicServices, academicYearService } from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { resolveRecordId } from '@/utils/record'
import {
  classSectionLabel,
  mapSchoolClassOptions,
  resolveSectionIdsFromStandard,
  resolveSectionIdsFromStandards,
} from '@/utils/classSections'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { useSubjectOptions } from '@/hooks/useSubjectOptions'

export default function SubjectAllocationPage() {
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
  const [selectionMode, setSelectionMode] = useState('multiple')
  const [classSectionId, setClassSectionId] = useState('')
  const [selectedClassIds, setSelectedClassIds] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([])
  const [weeklyPeriods, setWeeklyPeriods] = useState('')
  const [isElective, setIsElective] = useState(false)
  const [filterStandardKey, setFilterStandardKey] = useState('')

  useEffect(() => {
    setAcademicYearId('')
    setClassSectionId('')
    setSelectedClassIds([])
    setSubjectId('')
    setSelectedSubjectIds([])
    setFilterStandardKey('')
    setSelectionMode('multiple')
  }, [schoolId])

  useEffect(() => {
    setClassSectionId('')
    setSelectedClassIds([])
    setSubjectId('')
    setSelectedSubjectIds([])
    setFilterStandardKey('')
  }, [academicYearId])

  const yearsQuery = useQuery({
    queryKey: ['subject-allocation-years', schoolId, resolvedOrgId],
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

  const sectionsQuery = useQuery({
    queryKey: ['subject-allocation-sections', schoolId, academicYearId],
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

  const allocationsQuery = useQuery({
    queryKey: ['subject-allocation-list', schoolId, academicYearId],
    queryFn: () =>
      academicServices.classSectionSubjects.list({
        page_size: 500,
        school: schoolId,
        academic_year: academicYearId,
      }),
    enabled: Boolean(schoolId && academicYearId),
  })

  const allocations = useMemo(() => {
    const rows = unwrapList(allocationsQuery.data).results || []
    if (!filterStandardKey) return rows
    const sectionIds = new Set(
      resolveSectionIdsFromStandards(standardOptions, [filterStandardKey]),
    )
    return rows.filter((row) => sectionIds.has(String(row.class_section)))
  }, [allocationsQuery.data, filterStandardKey, standardOptions])

  const { subjectOptions, isLoading: subjectsLoading } = useSubjectOptions({
    schoolId,
    source: 'catalog',
    enabled: Boolean(schoolId),
  })

  const classSectionIdsToMap = useMemo(() => {
    if (selectionMode === 'multiple') {
      return resolveSectionIdsFromStandards(standardOptions, selectedClassIds)
    }
    return resolveSectionIdsFromStandard(standardOptions, classSectionId)
  }, [selectionMode, standardOptions, selectedClassIds, classSectionId])

  const subjectIdsToMap = useMemo(
    () => resolveSubjectIdsForMapping(selectionMode, subjectId, selectedSubjectIds),
    [selectionMode, subjectId, selectedSubjectIds],
  )

  const allocationPairs = useMemo(
    () =>
      classSectionIdsToMap.flatMap((classSection) =>
        subjectIdsToMap.map((subject) => ({ classSection, subject })),
      ),
    [classSectionIdsToMap, subjectIdsToMap],
  )

  const saveMutation = useMutation({
    mutationFn: async () =>
      Promise.all(
        allocationPairs.map(({ classSection, subject }) =>
          academicServices.classSectionSubjects.create({
            organization_id: resolvedOrgId,
            school_id: schoolId,
            academic_year_id: academicYearId,
            class_section: classSection,
            subject,
            weekly_periods: Number(weeklyPeriods) || 0,
            is_elective: isElective,
            is_active: true,
          }),
        ),
      ),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['subject-allocation-list'] })
      queryClient.invalidateQueries({ queryKey: ['subject-allocations'] })
      queryClient.invalidateQueries({ queryKey: ['subject-teacher-mappings'] })
      toast.success(
        results.length === 1
          ? 'Subject allocated'
          : `${results.length} section allocation(s) saved (${subjectIdsToMap.length} subject(s) × ${classSectionIdsToMap.length} section(s))`,
      )
      setSubjectId('')
      setSelectedSubjectIds([])
      setWeeklyPeriods('')
      setIsElective(false)
      if (selectionMode === 'single') {
        setClassSectionId('')
      } else {
        setSelectedClassIds([])
      }
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not save subject allocation')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => academicServices.classSectionSubjects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-allocation-list'] })
      queryClient.invalidateQueries({ queryKey: ['subject-allocations'] })
      toast.success('Allocation removed')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => academicServices.classSectionSubjects.update(id, { is_active }),
    onSuccess: (_data, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ['subject-allocation-list'] })
      queryClient.invalidateQueries({ queryKey: ['subject-allocations'] })
      toast.success(is_active ? 'Allocation activated' : 'Allocation deactivated')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const canSave = Boolean(
    schoolId
      && academicYearId
      && subjectIdsToMap.length
      && Number(weeklyPeriods) > 0
      && resolvedOrgId
      && classSectionIdsToMap.length,
  )

  const saveButtonLabel = useMemo(() => {
    const standards =
      selectionMode === 'multiple' ? selectedClassIds.length : classSectionId ? 1 : 0
    const subjects = subjectIdsToMap.length
    const sections = classSectionIdsToMap.length
    const total = allocationPairs.length
    if (total <= 1) return 'Save allocation'
    return `Allocate ${subjects} subject(s) to ${standards} standard(s) — ${total} section allocation(s)`
  }, [
    allocationPairs.length,
    classSectionIdsToMap.length,
    classSectionId,
    selectedClassIds.length,
    selectionMode,
    subjectIdsToMap.length,
  ])

  const handleSelectionModeChange = (nextMode) => {
    setSelectionMode(nextMode)
    setClassSectionId('')
    setSelectedClassIds([])
    setSubjectId('')
    setSelectedSubjectIds([])
  }

  if (schoolsQuery.isLoading) return <PageLoader />

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Breadcrumb items={[{ label: 'Subject Allocation' }]} />
      <PageHeader
        title="Subject Allocation"
        subtitle="Assign subjects and weekly periods to classes — use One for a single class/subject or Multiple for bulk allocation."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/academics/class-section-subjects">
              <Button variant="secondary">
                <FiUsers className="h-4 w-4" /> Assign teachers
              </Button>
            </Link>
            <Link to="/school-masters/subjects">
              <Button variant="secondary">
                <FiBookOpen className="h-4 w-4" /> Subject catalog
              </Button>
            </Link>
          </div>
        }
      />

      <ScopeFilterCard
        footer={
          <div className="ml-auto flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
            {allocationPairs.length > 1 ? (
              <p className="text-xs text-muted sm:text-right">
                Will create or update {allocationPairs.length} section allocation(s)
                {classSectionIdsToMap.length ? ` across ${classSectionIdsToMap.length} section(s).` : '.'}
              </p>
            ) : null}
            <Button
              className="w-full sm:w-auto"
              loading={saveMutation.isPending}
              disabled={!canSave}
              onClick={() => saveMutation.mutate()}
            >
              <FiBookOpen className="h-4 w-4" />
              {saveButtonLabel}
            </Button>
          </div>
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

          <div className={MAPPING_COLUMN_STACK}>
            {selectionMode === 'single' ? (
              <ClassMappingPicker
                mode={selectionMode}
                onModeChange={handleSelectionModeChange}
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
                selectionHint="Tick every standard (e.g. LKG, UKG). All sections under it are included."
              />
            ) : null}
            <Input
              label="Periods per week"
              type="number"
              min="1"
              required
              value={weeklyPeriods}
              onChange={(e) => setWeeklyPeriods(e.target.value)}
              placeholder="e.g. 5"
            />
          </div>

          <div className={MAPPING_COLUMN_STACK}>
            <MappingModeHeader
              mode={selectionMode}
              onChange={handleSelectionModeChange}
              label="Selection mode"
              showLabel
            />
            {selectionMode === 'single' ? (
              <SubjectMappingPicker
                mode={selectionMode}
                onModeChange={handleSelectionModeChange}
                subjectOptions={subjectOptions}
                singleSubjectId={subjectId}
                onSingleSubjectChange={setSubjectId}
                selectedSubjectIds={selectedSubjectIds}
                onSelectedSubjectIdsChange={setSelectedSubjectIds}
                loading={subjectsLoading}
                disabled={!schoolId}
                hideModeToggle
              />
            ) : null}
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={isElective}
                onChange={(e) => setIsElective(e.target.checked)}
                className="rounded border-border"
              />
              Elective subject
            </label>
          </div>
        </div>

        {selectionMode === 'multiple' ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <ClassMappingPicker
              mode={selectionMode}
              onModeChange={handleSelectionModeChange}
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
              selectionHint="Tick every standard (e.g. LKG, UKG). All sections under it are included."
            />
            <SubjectMappingPicker
              mode={selectionMode}
              onModeChange={handleSelectionModeChange}
              subjectOptions={subjectOptions}
              singleSubjectId={subjectId}
              onSingleSubjectChange={setSubjectId}
              selectedSubjectIds={selectedSubjectIds}
              onSelectedSubjectIdsChange={setSelectedSubjectIds}
              loading={subjectsLoading}
              disabled={!schoolId}
              hideModeToggle
              multipleOnly
            />
          </div>
        ) : null}

        {!standardOptions.length && academicYearId && !sectionsQuery.isLoading ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            No active classes for this year.{' '}
            <Link to="/academics/class-sections" className="font-semibold underline">
              Activate classes
            </Link>
            .
          </p>
        ) : null}
        {!subjectOptions.length && schoolId && !subjectsLoading ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            No subjects in catalog.{' '}
            <Link to="/school-masters/subjects" className="font-semibold underline">
              Add subjects
            </Link>
            .
          </p>
        ) : null}
      </ScopeFilterCard>

      <MappingListCard title="Current allocations" count={allocations.length}>
        <div className="mb-4 max-w-sm">
          <SelectField
            label="Filter by standard"
            value={filterStandardKey}
            onChange={(e) => setFilterStandardKey(e.target.value)}
            options={[{ label: 'All standards', value: '' }, ...standardOptions]}
            placeholder="All standards"
            disabled={!academicYearId}
          />
        </div>

        {!schoolId || !academicYearId ? (
          <MappingEmptyState message="Select a school and academic year to view allocations." />
        ) : allocationsQuery.isLoading ? (
          <PageLoader />
        ) : allocationsQuery.error ? (
          <ErrorState
            message={getErrorMessage(allocationsQuery.error)}
            onRetry={() => allocationsQuery.refetch()}
          />
        ) : allocations.length === 0 ? (
          <MappingEmptyState message="No subject allocations yet. Allocate subjects above — they will appear in timetable and exam dropdowns." />
        ) : (
          <MappingTableWrap>
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Periods / week</th>
                  <th className="px-4 py-3 font-semibold">Teacher</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allocations.map((row) => {
                  const id = resolveRecordId(row)
                  return (
                    <tr key={id} className="bg-card hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-text">{classSectionLabel(row)}</td>
                      <td className="px-4 py-3 text-text">
                        {row.subject_name || '—'}
                        {row.is_elective ? (
                          <span className="ml-2 text-xs text-muted">(Elective)</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-muted">{row.weekly_periods ?? '—'}</td>
                      <td className="px-4 py-3 text-text">
                        {row.teacher_name ? (
                          row.teacher_name
                        ) : (
                          <Link
                            to="/academics/class-section-subjects"
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Assign teacher
                          </Link>
                        )}
                      </td>
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
                            label={`Set allocation ${row.is_active ? 'inactive' : 'active'}`}
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
                            if (window.confirm('Remove this subject allocation?')) {
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
