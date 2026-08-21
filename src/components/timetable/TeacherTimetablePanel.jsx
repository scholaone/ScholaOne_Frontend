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
import { FiUsers } from 'react-icons/fi'

export default function TeacherTimetablePanel() {
  const scope = useTimetableScope({ viewOnly: true })
  const [teacherId, setTeacherId] = useState('')

  useEffect(() => {
    setTeacherId('')
  }, [scope.yearId, scope.schoolId])

  useEffect(() => {
    if (!scope.teacherOptions.length) {
      if (teacherId) setTeacherId('')
      return
    }
    const stillValid = scope.teacherOptions.some((option) => option.value === teacherId)
    if (!stillValid && scope.teacherOptions[0]) {
      setTeacherId(scope.teacherOptions[0].value)
    }
  }, [scope.teacherOptions, teacherId])

  const scheduleQuery = useQuery({
    queryKey: ['teacher-timetable', scope.schoolId, scope.versionId, teacherId],
    queryFn: () =>
      timetableService.teacherSchedule({
        ...(scope.schoolId ? { school: scope.schoolId } : {}),
        version: scope.versionId,
        teacher: teacherId,
      }),
    enabled: Boolean(scope.schoolId && scope.versionId && teacherId),
  })

  const { slots, freePeriods, workload } = useMemo(() => {
    const payload = unwrapTimetablePayload(scheduleQuery.data)
    return {
      slots: payload.slots || [],
      freePeriods: payload.free_periods || [],
      workload: payload.workload || null,
    }
  }, [scheduleQuery.data])

  const selectedTeacher = scope.teacherOptions.find((o) => o.value === teacherId)?.label

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
            label="Teacher"
            required
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            options={scope.teacherOptions}
            placeholder={
              scope.teachersQuery.isLoading
                ? 'Loading teachers...'
                : scope.teacherOptions.length
                  ? 'Select teacher...'
                  : 'No active teachers'
            }
            disabled={!scope.schoolId || scope.teachersQuery.isLoading}
          />
        }
        statusBadge={
          scope.hasPublishedTimetable && scope.activeTimetableLabel ? (
            <TimetableStatusBadge label={`Live: ${scope.activeTimetableLabel}`} variant="success" />
          ) : null
        }
      />

      {workload && scope.hasPublishedTimetable ? (
        <div className="flex flex-wrap gap-2">
          <TimetableStatusBadge label={`${workload.weekly_periods ?? 0} periods / week`} />
          {workload.over_weekly_limit ? (
            <TimetableStatusBadge label="Over weekly limit" variant="warning" />
          ) : null}
        </div>
      ) : null}

      {!scope.hasPublishedTimetable ? (
        <TimetableEmptyState
          icon={FiUsers}
          title="No published timetable yet"
          description="Teacher schedules are built from the same central timetable. Publish a timetable first."
          action={
            <Link to="/timetable/manual">
              <Button variant="primary">Go to Manual Creator</Button>
            </Link>
          }
        />
      ) : !teacherId ? (
        <TimetableEmptyState
          title="Select a teacher"
          description="Choose a teacher to view their weekly schedule and free periods."
        />
      ) : scheduleQuery.isLoading ? (
        <PageLoader />
      ) : scheduleQuery.error ? (
        <ErrorState message={getErrorMessage(scheduleQuery.error)} onRetry={() => scheduleQuery.refetch()} />
      ) : (
        <TimetableGridSection
          title={selectedTeacher ? `${selectedTeacher} — Weekly schedule` : 'Weekly schedule'}
          subtitle="Classes and subjects from the central timetable"
        >
          <TimetableWeekGrid
            slots={slots}
            periods={scope.periods}
            mode="teacher"
            freePeriods={freePeriods}
          />
        </TimetableGridSection>
      )}
    </div>
  )
}
