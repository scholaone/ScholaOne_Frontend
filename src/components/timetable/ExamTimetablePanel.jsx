import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiFileText, FiAlertTriangle } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { MappingFormCard, MappingTableWrap } from '@/components/academics/MappingFormLayout'
import {
  MAPPING_COLUMN_STACK,
  MAPPING_COLUMNS_GRID,
} from '@/components/academics/TeacherMappingPicker'
import {
  TimetableEmptyState,
  TimetableGridSection,
  TimetableViewFilters,
} from '@/components/timetable/TimetableLayout'
import SubjectSelectField from '@/components/academics/SubjectSelectField'
import {
  assessmentsService,
} from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { classSectionLabel } from '@/utils/classSections'
import {
  formatExamDayName,
  formatExamDuration,
  formatTimetableTime,
  unwrapTimetablePayload,
} from '@/utils/timetableGrid'
import { useTimetableScope } from '@/hooks/useTimetableScope'

export default function ExamTimetablePanel() {
  const queryClient = useQueryClient()
  const scope = useTimetableScope()
  const [examId, setExamId] = useState('')
  const [classSectionId, setClassSectionId] = useState('')
  const [form, setForm] = useState({
    class_section_id: '',
    subject_id: '',
    exam_date: '',
    start_time: '',
    end_time: '',
  })

  useEffect(() => {
    setExamId('')
    setClassSectionId('')
  }, [scope.yearId, scope.schoolId])

  const examsQuery = useQuery({
    queryKey: ['exam-timetable-exams', scope.schoolId, scope.yearId],
    queryFn: () =>
      assessmentsService.exams({
        ...(scope.schoolId ? { school: scope.schoolId } : {}),
        ...(scope.yearId ? { academic_year: scope.yearId } : {}),
        page_size: 200,
      }),
    enabled: Boolean(scope.schoolId && scope.yearId),
  })

  const examOptions = useMemo(() => {
    const { results } = unwrapList(examsQuery.data)
    return (results || []).map((exam) => ({
      value: String(exam.id),
      label: exam.name || exam.code || 'Exam',
    }))
  }, [examsQuery.data])

  useEffect(() => {
    if (!examOptions.length) {
      if (examId) setExamId('')
      return
    }
    const stillValid = examOptions.some((option) => option.value === examId)
    if (!stillValid && examOptions[0]) setExamId(examOptions[0].value)
  }, [examOptions, examId])

  const scheduleQuery = useQuery({
    queryKey: ['exam-timetable-schedule', scope.schoolId, examId],
    queryFn: () =>
      assessmentsService.schedule(examId, scope.schoolId ? { school: scope.schoolId } : {}),
    enabled: Boolean(scope.schoolId && examId),
  })

  const rows = useMemo(() => {
    const payload = unwrapTimetablePayload(scheduleQuery.data)
    const list = payload.results || []
    return list
      .map((row) => ({
        ...row,
        class_section_label: row.class_section_label || classSectionLabel(row),
        day_name: row.day_name || formatExamDayName(row.exam_date),
        duration_label: row.duration_label || formatExamDuration(row.start_time, row.end_time),
      }))
      .filter((row) => !classSectionId || String(row.class_section) === classSectionId)
      .sort((a, b) => String(a.exam_date).localeCompare(String(b.exam_date)))
  }, [scheduleQuery.data, classSectionId])

  const createMut = useMutation({
    mutationFn: () =>
      assessmentsService.createSchedule(examId, {
        ...(scope.schoolId ? { school_id: scope.schoolId } : {}),
        class_section_id: form.class_section_id,
        subject_id: form.subject_id,
        exam_date: form.exam_date,
        start_time: form.start_time,
        end_time: form.end_time,
      }),
    onSuccess: () => {
      toast.success('Exam timetable entry saved')
      queryClient.invalidateQueries({ queryKey: ['exam-timetable-schedule'] })
      setForm((prev) => ({
        ...prev,
        exam_date: '',
        start_time: '',
        end_time: '',
      }))
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not save exam schedule')),
  })

  const detectConflictsMut = useMutation({
    mutationFn: () =>
      assessmentsService.detectConflicts(examId, scope.schoolId ? { school_id: scope.schoolId } : {}),
    onSuccess: (res) => {
      const payload = unwrapTimetablePayload(res)
      const count = payload.count ?? payload.results?.length ?? 0
      toast.success(count ? `${count} exam conflict(s) found` : 'No exam conflicts found')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const selectedExam = examOptions.find((o) => o.value === examId)?.label

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
          <>
            <SelectField
              label="Exam"
              required
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              options={examOptions}
              placeholder={
                examsQuery.isLoading
                  ? 'Loading exams...'
                  : examOptions.length
                    ? 'Select exam...'
                    : 'No exams for this year'
              }
              disabled={!scope.yearId || examsQuery.isLoading}
            />
            <SelectField
              label="Class / section filter"
              value={classSectionId}
              onChange={(e) => setClassSectionId(e.target.value)}
              options={[{ label: 'All classes', value: '' }, ...scope.classSectionOptions]}
              placeholder="All classes"
              disabled={!scope.yearId}
            />
          </>
        }
      />

      {examId ? (
        <MappingFormCard
          title="Add exam session"
          description="Schedule a subject exam for a class on a specific date and time"
          footer={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={detectConflictsMut.isPending}
                onClick={() => detectConflictsMut.mutate()}
              >
                <FiAlertTriangle className="h-4 w-4" /> Detect conflicts
              </Button>
              <Button
                className="ml-auto"
                variant="primary"
                disabled={
                  !form.class_section_id
                  || !form.subject_id
                  || !form.exam_date
                  || !form.start_time
                  || !form.end_time
                  || createMut.isPending
                }
                loading={createMut.isPending}
                onClick={() => createMut.mutate()}
              >
                Save session
              </Button>
            </div>
          }
        >
          <div className={MAPPING_COLUMNS_GRID}>
            <div className={MAPPING_COLUMN_STACK}>
              <SelectField
                label="Class / section"
                required
                value={form.class_section_id}
                onChange={(e) => setForm((prev) => ({ ...prev, class_section_id: e.target.value }))}
                options={scope.classSectionOptions}
                placeholder="Select class..."
                disabled={!scope.yearId}
              />
              <SubjectSelectField
                label="Subject"
                required
                value={form.subject_id}
                onChange={(e) => setForm((prev) => ({ ...prev, subject_id: e.target.value }))}
                schoolId={scope.schoolId}
                academicYearId={scope.yearId}
                classSectionId={form.class_section_id}
                source="allocated"
              />
            </div>
            <div className={MAPPING_COLUMN_STACK}>
              <Input
                label="Date"
                type="date"
                required
                value={form.exam_date}
                onChange={(e) => setForm((prev) => ({ ...prev, exam_date: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start time"
                  type="time"
                  required
                  value={form.start_time}
                  onChange={(e) => setForm((prev) => ({ ...prev, start_time: e.target.value }))}
                />
                <Input
                  label="End time"
                  type="time"
                  required
                  value={form.end_time}
                  onChange={(e) => setForm((prev) => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </MappingFormCard>
      ) : null}

      {!scope.yearId ? (
        <TimetableEmptyState
          icon={FiFileText}
          title="Select academic year"
          description="Choose a school and academic year to load exams for this period."
        />
      ) : !examOptions.length && !examsQuery.isLoading ? (
        <TimetableEmptyState
          icon={FiFileText}
          title="No exams found"
          description="Create exams in the Assessments module for this academic year, then schedule sessions here."
        />
      ) : !examId ? (
        <TimetableEmptyState
          icon={FiFileText}
          title="Select an exam"
          description="Choose an exam from the dropdown to view and manage its timetable."
        />
      ) : scheduleQuery.isLoading ? (
        <PageLoader />
      ) : scheduleQuery.error ? (
        <ErrorState
          message={getErrorMessage(scheduleQuery.error)}
          onRetry={() => scheduleQuery.refetch()}
        />
      ) : (
        <TimetableGridSection
          title={selectedExam ? `${selectedExam} — Exam schedule` : 'Exam schedule'}
          subtitle={`${rows.length} session${rows.length === 1 ? '' : 's'}${classSectionId ? ' (filtered)' : ''}`}
        >
          <MappingTableWrap>
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Day</th>
                  <th className="px-4 py-3 font-semibold">Class / section</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="bg-card hover:bg-muted/20">
                    <td className="px-4 py-3 text-text">{row.exam_date || '—'}</td>
                    <td className="px-4 py-3 text-text">{row.day_name}</td>
                    <td className="px-4 py-3 font-medium text-text">{row.class_section_label || '—'}</td>
                    <td className="px-4 py-3 text-text">{row.subject_name || '—'}</td>
                    <td className="px-4 py-3 text-text">
                      {formatTimetableTime(row.start_time)}
                      {row.end_time ? ` – ${formatTimetableTime(row.end_time)}` : ''}
                    </td>
                    <td className="px-4 py-3 text-muted">{row.duration_label}</td>
                    <td className="px-4 py-3 text-muted">{row.room_name || '—'}</td>
                  </tr>
                ))}
                {!rows.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted">
                      No exam sessions scheduled yet. Use the form above to add one.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </MappingTableWrap>
        </TimetableGridSection>
      )}
    </div>
  )
}
