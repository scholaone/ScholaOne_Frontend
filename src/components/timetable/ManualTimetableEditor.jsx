import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiTrash2, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi'
import { MappingFormCard } from '@/components/academics/MappingFormLayout'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import {
  MAPPING_COLUMN_STACK,
  MAPPING_COLUMNS_GRID,
} from '@/components/academics/TeacherMappingPicker'
import { TimetableSetFieldWithCreate } from '@/components/timetable/CreateTimetableSetPanel'
import TimetableWeekGrid from '@/components/timetable/TimetableWeekGrid'
import {
  TimetableEmptyState,
  TimetableGridSection,
  TimetableStatusBadge,
} from '@/components/timetable/TimetableLayout'
import SubjectSelectField from '@/components/academics/SubjectSelectField'
import {
  academicServices,
  timetableService,
} from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { TIMETABLE_WEEKDAYS, unwrapTimetablePayload } from '@/utils/timetableGrid'
import { useTimetableScope } from '@/hooks/useTimetableScope'

function SlotAssignmentModal({
  open,
  onClose,
  cell,
  classSectionId,
  yearId,
  versionId,
  schoolId,
  teacherOptions,
  roomOptions,
}) {
  const [subjectId, setSubjectId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [roomId, setRoomId] = useState('')
  const qc = useQueryClient()
  const existingSlot = cell?.slot

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        weekday: cell.weekday,
        period_number: cell.periodNumber,
        class_section_id: classSectionId,
        subject_id: subjectId || existingSlot?.subject,
        teacher_id: teacherId || existingSlot?.teacher,
        room_id: roomId || undefined,
        ...(schoolId ? { school_id: schoolId } : {}),
      }
      if (existingSlot?.id) {
        return timetableService.updateSlot(versionId, existingSlot.id, payload)
      }
      return timetableService.createSlot(versionId, payload)
    },
    onSuccess: () => {
      toast.success(existingSlot ? 'Assignment updated' : 'Assignment saved')
      qc.invalidateQueries({ queryKey: ['manual-timetable-slots'] })
      onClose()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const validateMut = useMutation({
    mutationFn: () =>
      timetableService.validateAssignment({
        version_id: versionId,
        weekday: cell.weekday,
        period_number: cell.periodNumber,
        class_section_id: classSectionId,
        subject_id: subjectId || existingSlot?.subject,
        teacher_id: teacherId || existingSlot?.teacher,
        room_id: roomId || undefined,
        slot_id: existingSlot?.id,
        ...(schoolId ? { school_id: schoolId } : {}),
      }),
    onSuccess: (res) => {
      const data = unwrapTimetablePayload(res)
      if (data.valid) toast.success('No blocking conflicts')
      else toast.error((data.issues || []).map((i) => i.message).join('; ') || 'Validation failed')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMut = useMutation({
    mutationFn: () =>
      timetableService.deleteSlot(versionId, existingSlot.id, schoolId ? { school: schoolId } : {}),
    onSuccess: () => {
      toast.success('Assignment removed')
      qc.invalidateQueries({ queryKey: ['manual-timetable-slots'] })
      onClose()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (!open || !cell) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
          <h3 className="text-lg font-semibold text-text">
            {existingSlot ? 'Edit period' : 'Assign period'}
          </h3>
          <p className="mt-0.5 text-sm text-muted">{cell.dayLabel} · Period {cell.periodNumber}</p>
        </div>
        <div className="space-y-4 p-5">
          <SubjectSelectField label="Subject" required value={subjectId || String(existingSlot?.subject || '')} onChange={(e) => setSubjectId(e.target.value)} schoolId={schoolId} academicYearId={yearId} classSectionId={classSectionId} source="allocated" />
          <SelectField label="Teacher" required value={teacherId || String(existingSlot?.teacher || '')} onChange={(e) => setTeacherId(e.target.value)} options={teacherOptions} placeholder="Select teacher..." />
          <SelectField label="Room" value={roomId || String(existingSlot?.room || '')} onChange={(e) => setRoomId(e.target.value)} options={roomOptions} placeholder="Optional..." />
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border bg-muted/20 px-5 py-4">
          <Button variant="secondary" disabled={validateMut.isPending} onClick={() => validateMut.mutate()}>
            Validate
          </Button>
          <Button variant="primary" disabled={saveMut.isPending} onClick={() => saveMut.mutate()}>Save</Button>
          {existingSlot ? (
            <Button variant="secondary" className="text-red-600" disabled={deleteMut.isPending} onClick={() => deleteMut.mutate()}>
              <FiTrash2 className="h-4 w-4" /> Delete
            </Button>
          ) : null}
          <Button variant="secondary" className="ml-auto" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

export default function ManualTimetableEditor() {
  const scope = useTimetableScope({ preferDraft: true })
  const {
    schoolId, setSchoolId, schoolOptions, selectedSchoolLabel, schoolLocked,
    yearId, setYearId, yearOptions, yearsQuery,
    setId, setSetId, setOptions, setsQuery, setsFilteredByYear,
    draftVersionId, classSectionOptions, periods, teacherOptions,
  } = scope

  const qc = useQueryClient()
  const [classSectionId, setClassSectionId] = useState('')
  const [activeCell, setActiveCell] = useState(null)

  const slotsQuery = useQuery({
    queryKey: ['manual-timetable-slots', draftVersionId, classSectionId],
    queryFn: () =>
      timetableService.slots(draftVersionId, {
        ...(schoolId ? { school: schoolId } : {}),
        class_section: classSectionId,
      }),
    enabled: Boolean(draftVersionId && classSectionId),
  })

  const roomsQuery = useQuery({
    queryKey: ['manual-rooms', schoolId],
    queryFn: () => academicServices.rooms.list({ page_size: 500, school: schoolId, is_active: true }),
    enabled: Boolean(schoolId),
  })

  const publishMut = useMutation({
    mutationFn: () => timetableService.publish(draftVersionId, schoolId ? { school_id: schoolId } : {}),
    onSuccess: () => {
      toast.success('Timetable published')
      qc.invalidateQueries({ queryKey: ['timetable-sets-scope'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const detectMut = useMutation({
    mutationFn: () => timetableService.detectConflicts(draftVersionId, schoolId ? { school_id: schoolId } : {}),
    onSuccess: (res) => {
      const n = unwrapTimetablePayload(res).results?.length ?? 0
      toast.success(n ? `${n} conflict(s) found` : 'No conflicts found')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const slots = useMemo(() => unwrapTimetablePayload(slotsQuery.data).results || [], [slotsQuery.data])
  const roomOptions = useMemo(() => {
    const { results } = unwrapList(roomsQuery.data)
    return (results || []).map((r) => ({ value: String(r.id), label: r.name || r.code || 'Room' }))
  }, [roomsQuery.data])

  const classLabel = classSectionOptions.find((o) => o.value === classSectionId)?.label

  return (
    <div className="space-y-5">
      <MappingFormCard title="Scope & draft" description="Select school, year, timetable set, and class to edit.">
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
              label="Class / section"
              required
              value={classSectionId}
              onChange={(e) => setClassSectionId(e.target.value)}
              options={classSectionOptions}
              placeholder={!yearId ? 'Select year first' : 'Select class...'}
              disabled={!yearId || !classSectionOptions.length}
            />
          </div>
          <div className={MAPPING_COLUMN_STACK}>
            <SelectField
              label="Academic year"
              required
              value={yearId}
              onChange={(e) => setYearId(e.target.value)}
              options={yearOptions}
              placeholder={yearsQuery.isLoading ? 'Loading...' : 'Select year...'}
              disabled={yearsQuery.isLoading || !schoolId}
            />
            <TimetableSetFieldWithCreate
              schoolId={schoolId}
              yearId={yearId}
              yearOptions={yearOptions}
              setId={setId}
              setSetId={setSetId}
              setOptions={setOptions}
              setsQuery={setsQuery}
              setsFilteredByYear={setsFilteredByYear}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {draftVersionId ? (
            <TimetableStatusBadge label="Editing draft version" variant="warning" />
          ) : setId ? (
            <TimetableStatusBadge label="No draft — create or clone a set" variant="warning" />
          ) : null}
        </div>
      </MappingFormCard>

      {!draftVersionId || !classSectionId ? (
        <TimetableEmptyState
          title="Ready to build your timetable"
          description="Select academic year, timetable set, and class/section. Then click any cell in the weekly grid to assign subject, teacher, and room."
        />
      ) : (
        <TimetableGridSection
          title={classLabel ? `${classLabel} — Weekly grid` : 'Weekly grid'}
          subtitle="Click a cell to assign or edit. Lunch periods cannot be edited."
          actions={
            <>
              <Button variant="secondary" disabled={detectMut.isPending} onClick={() => detectMut.mutate()}>
                <FiAlertTriangle className="h-4 w-4" /> Check conflicts
              </Button>
              <Button variant="primary" disabled={publishMut.isPending} onClick={() => publishMut.mutate()}>
                <FiCheckCircle className="h-4 w-4" /> Publish
              </Button>
            </>
          }
        >
          <TimetableWeekGrid
            slots={slots}
            periods={periods}
            mode="class"
            interactive
            onCellClick={(weekday, column, slot) => {
              if (column.isLunch) return
              setActiveCell({
                weekday,
                periodNumber: column.period_number,
                dayLabel: TIMETABLE_WEEKDAYS.find((d) => d.value === weekday)?.label || '',
                slot,
              })
            }}
          />
        </TimetableGridSection>
      )}

      <SlotAssignmentModal
        open={Boolean(activeCell)}
        onClose={() => setActiveCell(null)}
        cell={activeCell}
        classSectionId={classSectionId}
        yearId={yearId}
        versionId={draftVersionId}
        schoolId={schoolId}
        teacherOptions={teacherOptions}
        roomOptions={roomOptions}
      />
    </div>
  )
}
