import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import TimetableWeekGrid from '@/components/timetable/TimetableWeekGrid'
import {
  TimetableEmptyState,
  TimetableGridSection,
  TimetableStatusBadge,
  TimetableViewFilters,
} from '@/components/timetable/TimetableLayout'
import Button from '@/components/ui/Button'
import { timetableService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { unwrapTimetablePayload } from '@/utils/timetableGrid'
import { useTimetableScope } from '@/hooks/useTimetableScope'
import { FiBookOpen } from 'react-icons/fi'

export default function ClassTimetablePanel() {
  const scope = useTimetableScope({ viewOnly: true })
  const [classSectionId, setClassSectionId] = useState('')

  useEffect(() => {
    setClassSectionId('')
  }, [scope.yearId, scope.schoolId])

  useEffect(() => {
    if (!scope.classSectionOptions.length) {
      if (classSectionId) setClassSectionId('')
      return
    }
    const stillValid = scope.classSectionOptions.some((option) => option.value === classSectionId)
    if (!stillValid && scope.classSectionOptions[0]) {
      setClassSectionId(scope.classSectionOptions[0].value)
    }
  }, [scope.classSectionOptions, classSectionId])

  const scheduleQuery = useQuery({
    queryKey: ['class-timetable', scope.schoolId, scope.versionId, classSectionId],
    queryFn: () =>
      timetableService.studentSchedule({
        ...(scope.schoolId ? { school: scope.schoolId } : {}),
        version: scope.versionId,
        class_section: classSectionId,
      }),
    enabled: Boolean(scope.schoolId && scope.versionId && classSectionId),
  })

  const slots = useMemo(() => {
    const payload = unwrapTimetablePayload(scheduleQuery.data)
    return payload.results || []
  }, [scheduleQuery.data])

  const selectedClass = scope.classSectionOptions.find((o) => o.value === classSectionId)?.label

  return (
    <div className="space-y-5">
      <TimetableViewFilters
        schoolId={scope.schoolId}
        setSchoolId={scope.setSchoolId}
        schoolOptions={scope.schoolOptions}
        selectedSchoolLabel={scope.selectedSchoolLabel}
        schoolLocked={scope.schoolLocked}
        yearId={scope.yearId}
        setYearId={scope.setYearId}
        yearOptions={scope.yearOptions}
        yearsLoading={scope.yearsQuery.isLoading}
        secondaryField={
          <SelectField
            label="Class / section"
            required
            value={classSectionId}
            onChange={(e) => setClassSectionId(e.target.value)}
            options={scope.classSectionOptions}
            placeholder={
              scope.sectionsQuery.isLoading
                ? 'Loading classes...'
                : scope.classSectionOptions.length
                  ? 'Select class...'
                  : 'No active classes'
            }
            disabled={!scope.yearId || scope.sectionsQuery.isLoading}
          />
        }
        statusBadge={
          scope.hasPublishedTimetable && scope.activeTimetableLabel ? (
            <TimetableStatusBadge label={`Live: ${scope.activeTimetableLabel}`} variant="success" />
          ) : null
        }
      />

      {!scope.hasPublishedTimetable ? (
        <TimetableEmptyState
          icon={FiBookOpen}
          title="No published timetable yet"
          description="Create a timetable in Manual Creator or AI Generator, then publish it to view class schedules here."
          action={
            <Link to="/timetable/manual">
              <Button variant="primary">Go to Manual Creator</Button>
            </Link>
          }
        />
      ) : !classSectionId ? (
        <TimetableEmptyState
          title="Select a class"
          description="Choose a class and section to view its weekly timetable."
        />
      ) : scheduleQuery.isLoading ? (
        <PageLoader />
      ) : scheduleQuery.error ? (
        <ErrorState message={getErrorMessage(scheduleQuery.error)} onRetry={() => scheduleQuery.refetch()} />
      ) : (
        <TimetableGridSection
          title={selectedClass ? `${selectedClass} — Weekly schedule` : 'Weekly schedule'}
          subtitle="Subject, teacher, and room for each period"
        >
          <TimetableWeekGrid slots={slots} periods={scope.periods} mode="class" />
        </TimetableGridSection>
      )}
    </div>
  )
}
