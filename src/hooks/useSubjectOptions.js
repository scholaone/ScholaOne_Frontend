import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { academicServices, masterServices } from '@/api/services'
import { unwrapList } from '@/api/client'
import { resolveRecordId } from '@/utils/record'

/**
 * Subject dropdown options from class allocations (ClassSectionSubject) or master catalog.
 *
 * @param {'allocated'|'catalog'|'allocated-or-catalog'} source
 *   - allocated: only subjects allocated to the class (empty if none)
 *   - catalog: all active school subjects
 *   - allocated-or-catalog: allocated when present, else catalog fallback
 */
export function useSubjectOptions({
  schoolId,
  academicYearId,
  classSectionId,
  classSectionIds = [],
  source = 'allocated',
  enabled = true,
} = {}) {
  const sectionIds = useMemo(() => {
    const ids = new Set()
    if (classSectionId) ids.add(String(classSectionId))
    classSectionIds.forEach((id) => {
      if (id) ids.add(String(id))
    })
    return [...ids]
  }, [classSectionId, classSectionIds])

  const needsCatalog =
    source === 'catalog' || source === 'allocated-or-catalog'
  const needsAllocations = source !== 'catalog'

  const catalogQuery = useQuery({
    queryKey: ['subject-catalog', schoolId],
    queryFn: () =>
      masterServices.subjects.list({
        page_size: 500,
        school: schoolId,
        is_active: true,
        ordering: 'name',
      }),
    enabled: enabled && Boolean(schoolId) && needsCatalog,
  })

  const allocationsQuery = useQuery({
    queryKey: ['subject-allocations', schoolId, academicYearId, sectionIds.join(',')],
    queryFn: async () => {
      if (!sectionIds.length) {
        const res = await academicServices.classSectionSubjects.list({
          page_size: 500,
          school: schoolId,
          academic_year: academicYearId,
          is_active: true,
        })
        return unwrapList(res).results || []
      }
      const batches = await Promise.all(
        sectionIds.map((id) =>
          academicServices.classSectionSubjects.list({
            page_size: 500,
            school: schoolId,
            academic_year: academicYearId,
            class_section: id,
            is_active: true,
          }),
        ),
      )
      const merged = []
      const seen = new Set()
      batches.forEach((res) => {
        ;(unwrapList(res).results || []).forEach((row) => {
          const subjectId = String(row.subject || row.subject_id)
          const key = sectionIds.length > 1 ? subjectId : `${subjectId}:${row.class_section}`
          if (seen.has(key)) return
          seen.add(key)
          merged.push(row)
        })
      })
      return merged
    },
    enabled: enabled && Boolean(schoolId && academicYearId) && needsAllocations,
  })

  const catalogOptions = useMemo(() => {
    const { results } = unwrapList(catalogQuery.data)
    return (results || []).map((row) => ({
      value: String(resolveRecordId(row) || row.id),
      label: row.code ? `${row.name} (${row.code})` : row.name,
    }))
  }, [catalogQuery.data])

  const allocations = useMemo(
    () => allocationsQuery.data || [],
    [allocationsQuery.data],
  )

  const allocationOptions = useMemo(() => {
    const seen = new Set()
    return allocations
      .map((row) => {
        const value = String(row.subject || row.subject_id)
        const periods = row.weekly_periods
        const labelBase = row.subject_name || row.subject_label || value
        const label =
          periods != null && periods !== ''
            ? `${labelBase} (${periods} periods/week)`
            : labelBase
        return { value, label, weeklyPeriods: periods, allocationId: resolveRecordId(row) }
      })
      .filter((opt) => {
        if (seen.has(opt.value)) return false
        seen.add(opt.value)
        return true
      })
  }, [allocations])

  const subjectOptions = useMemo(() => {
    if (source === 'catalog') return catalogOptions
    if (source === 'allocated') return allocationOptions
    if (allocationOptions.length) return allocationOptions
    return catalogOptions
  }, [source, catalogOptions, allocationOptions])

  const isLoading =
    (needsCatalog && catalogQuery.isLoading)
    || (needsAllocations && allocationsQuery.isLoading)

  const hasAllocations = allocationOptions.length > 0

  const placeholder = useMemo(() => {
    if (isLoading) return 'Loading subjects...'
    if (!schoolId) return 'Select school first'
    if (source !== 'catalog' && !academicYearId) return 'Select academic year first'
    if (source !== 'catalog' && sectionIds.length === 0) return 'Select class first'
    if (subjectOptions.length) return 'Select subject...'
    if (source === 'allocated') {
      return 'No subjects allocated — add subject allocation first'
    }
    return 'No subjects for this school'
  }, [isLoading, schoolId, academicYearId, sectionIds.length, subjectOptions.length, source])

  return {
    subjectOptions,
    allocations,
    hasAllocations,
    isLoading,
    isError: catalogQuery.isError || allocationsQuery.isError,
    error: catalogQuery.error || allocationsQuery.error,
    placeholder,
    refetch: () => {
      catalogQuery.refetch()
      allocationsQuery.refetch()
    },
  }
}
