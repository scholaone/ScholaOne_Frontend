import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  academicServices,
  academicYearService,
  masterServices,
  teacherService,
  timetableService,
} from '@/api/services'
import { unwrapList } from '@/api/client'
import { classSectionLabel } from '@/utils/classSections'
import { unwrapTimetablePayload } from '@/utils/timetableGrid'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { useAuth } from '@/contexts/AuthContext'

/** Shared filters: school, year, timetable set/version, sections, teachers, periods. */
export function useTimetableScope(options = {}) {
  const { preferDraft = false, viewOnly = false } = options
  const { user } = useAuth()
  const {
    schoolId,
    setSchoolId,
    schoolOptions,
    selectedSchoolLabel,
    schoolLocked,
    schoolsQuery,
  } = useSchoolScopedSelection()

  const canQueryWithoutSchool = Boolean(user?.is_super_admin || user?.is_org_admin)

  const [yearId, setYearId] = useState('')
  const [setId, setSetId] = useState('')

  useEffect(() => {
    setYearId('')
    setSetId('')
  }, [schoolId])

  useEffect(() => {
    setSetId('')
  }, [yearId])

  const yearsQuery = useQuery({
    queryKey: ['timetable-years', schoolId],
    queryFn: () =>
      academicYearService.list({
        page_size: 100,
        school: schoolId,
        ordering: '-start_date',
      }),
    enabled: Boolean(schoolId),
  })

  const yearOptions = useMemo(() => {
    const { results } = unwrapList(yearsQuery.data)
    return (results || []).map((year) => ({
      value: String(year.id),
      label: `${year.name || year.label || 'Academic year'}${year.is_current ? ' (Current)' : ''}`,
      isCurrent: Boolean(year.is_current),
    }))
  }, [yearsQuery.data])

  useEffect(() => {
    if (!yearOptions.length) {
      if (yearId) setYearId('')
      return
    }
    const stillValid = yearOptions.some((option) => option.value === yearId)
    if (stillValid) return
    const current = yearOptions.find((option) => option.isCurrent) || yearOptions[0]
    if (current) setYearId(current.value)
  }, [yearOptions, yearId])

  // Load all timetable sets for the school (do not filter by year on API — hub page uses same approach)
  const setsQuery = useQuery({
    queryKey: ['timetable-sets-scope', schoolId],
    queryFn: () =>
      timetableService.list({
        page_size: 500,
        ...(schoolId ? { school: schoolId } : {}),
      }),
    enabled: Boolean(schoolId) || canQueryWithoutSchool,
  })

  const timetableSets = useMemo(() => {
    const { results } = unwrapList(setsQuery.data)
    return Array.isArray(results) ? results : []
  }, [setsQuery.data])

  /** Prefer sets for selected year; fall back to all sets if none match. */
  const timetableSetsForYear = useMemo(() => {
    if (!yearId) return timetableSets
    const matched = timetableSets.filter(
      (set) => String(set.academic_year) === String(yearId),
    )
    return matched.length ? matched : timetableSets
  }, [timetableSets, yearId])

  /** Sets that have a published version — used for view-only class/teacher timetables. */
  const publishedSetsForYear = useMemo(() => {
    const pool = timetableSetsForYear.filter((set) => set.published_version_id)
    if (yearId) {
      const forYear = pool.filter((set) => String(set.academic_year) === String(yearId))
      if (forYear.length) return forYear
    }
    return pool
  }, [timetableSetsForYear, yearId])

  useEffect(() => {
    if (viewOnly) {
      if (!publishedSetsForYear.length) {
        if (setId) setSetId('')
        return
      }
      const stillValid = publishedSetsForYear.some(
        (set) => String(set.id) === setId && set.published_version_id,
      )
      if (stillValid) return
      setSetId(String(publishedSetsForYear[0].id))
      return
    }

    if (!timetableSetsForYear.length) {
      if (setId) setSetId('')
      return
    }
    const stillValid = timetableSetsForYear.some((set) => String(set.id) === setId)
    if (stillValid) return
    const preferred =
      timetableSetsForYear.find((set) => set.published_version_id)
      || timetableSetsForYear[0]
    if (preferred) setSetId(String(preferred.id))
  }, [viewOnly, publishedSetsForYear, timetableSetsForYear, setId])

  const selectedSet = useMemo(() => {
    const pool = viewOnly ? publishedSetsForYear : timetableSetsForYear
    return pool.find((set) => String(set.id) === setId) || null
  }, [viewOnly, publishedSetsForYear, timetableSetsForYear, setId])

  const setDetailQuery = useQuery({
    queryKey: ['timetable-set-detail', setId, schoolId],
    queryFn: () => timetableService.get(setId),
    enabled: Boolean(setId && schoolId),
  })

  const versions = useMemo(() => {
    const payload = unwrapTimetablePayload(setDetailQuery.data)
    return payload.versions || []
  }, [setDetailQuery.data])

  const draftVersion = useMemo(
    () => versions.find((v) => v.status === 'draft') || null,
    [versions],
  )

  const publishedVersion = useMemo(
    () => versions.find((v) => v.status === 'published') || null,
    [versions],
  )

  const versionId = viewOnly
    ? (selectedSet?.published_version_id || publishedVersion?.id || '')
    : preferDraft
      ? (draftVersion?.id || publishedVersion?.id || selectedSet?.published_version_id || '')
      : (selectedSet?.published_version_id || publishedVersion?.id || draftVersion?.id || '')

  const draftVersionId = draftVersion?.id || ''

  const hasPublishedTimetable = viewOnly
    ? Boolean(publishedSetsForYear.length && versionId)
    : Boolean(selectedSet?.published_version_id || publishedVersion?.id)
  const activeTimetableLabel = selectedSet?.name || ''

  const sectionsQuery = useQuery({
    queryKey: ['timetable-sections', schoolId, yearId],
    queryFn: () =>
      academicServices.classSections.list({
        page_size: 500,
        school: schoolId,
        academic_year: yearId,
        is_active: true,
        ordering: 'class_name',
      }),
    enabled: Boolean(schoolId && yearId),
  })

  const classSectionOptions = useMemo(() => {
    const { results } = unwrapList(sectionsQuery.data)
    return (results || []).map((row) => ({
      value: String(row.id),
      label: classSectionLabel(row),
    }))
  }, [sectionsQuery.data])

  const teachersQuery = useQuery({
    queryKey: ['timetable-teachers', schoolId],
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
    return (results || []).map((teacher) => ({
      value: String(teacher.teacher_id || teacher.id),
      label: [teacher.full_name, teacher.employee_id ? `(${teacher.employee_id})` : null]
        .filter(Boolean)
        .join(' '),
    }))
  }, [teachersQuery.data])

  const periodsQuery = useQuery({
    queryKey: ['timetable-periods', schoolId, yearId, selectedSet?.class_timing],
    queryFn: () =>
      academicServices.periods.list({
        page_size: 100,
        school: schoolId,
        ...(selectedSet?.class_timing ? { class_timing: selectedSet.class_timing } : {}),
        ordering: 'period_number',
      }),
    enabled: Boolean(schoolId && selectedSet?.class_timing),
  })

  const periods = useMemo(() => {
    const { results } = unwrapList(periodsQuery.data)
    return results || []
  }, [periodsQuery.data])

  const setOptions = useMemo(
    () =>
      timetableSetsForYear.map((set) => ({
        value: String(set.id),
        label: [
          set.name,
          set.academic_year_name ? `(${set.academic_year_name})` : null,
          set.published_version_id ? null : '(draft only)',
        ].filter(Boolean).join(' '),
      })),
    [timetableSetsForYear],
  )

  const setsFilteredByYear = yearId
    ? timetableSets.some((set) => String(set.academic_year) === String(yearId))
    : true

  return {
    schoolId,
    setSchoolId,
    schoolOptions,
    selectedSchoolLabel,
    schoolLocked,
    schoolsQuery,
    yearId,
    setYearId,
    yearOptions,
    yearsQuery,
    setId,
    setSetId,
    setOptions,
    selectedSet,
    versionId,
    draftVersionId,
    versions,
    setDetailQuery,
    timetableSets,
    timetableSetsForYear,
    setsFilteredByYear,
    setsQuery,
    publishedSetsForYear,
    hasPublishedTimetable,
    activeTimetableLabel,
    viewOnly,
    classSectionOptions,
    sectionsQuery,
    teacherOptions,
    teachersQuery,
    periods,
    periodsQuery,
  }
}
