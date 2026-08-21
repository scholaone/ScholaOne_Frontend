import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiCpu, FiRefreshCw, FiCheck, FiAlertTriangle, FiLayers,
} from 'react-icons/fi'
import { MappingFormCard } from '@/components/academics/MappingFormLayout'
import { TimetableSetFieldWithCreate } from '@/components/timetable/CreateTimetableSetPanel'
import TimetableWeekGrid from '@/components/timetable/TimetableWeekGrid'
import {
  TimetableEmptyState,
  TimetableGridSection,
  TimetablePageShell,
  TimetableSectionChip,
  TimetableStatsRow,
  TimetableStatusBadge,
} from '@/components/timetable/TimetableLayout'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import {
  MAPPING_COLUMN_STACK,
  MAPPING_COLUMNS_GRID,
} from '@/components/academics/TeacherMappingPicker'
import { timetableService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { unwrapTimetablePayload } from '@/utils/timetableGrid'
import { useTimetableScope } from '@/hooks/useTimetableScope'

export default function AITimetableGeneratorPage() {
  const scope = useTimetableScope({ preferDraft: true })
  const {
    schoolId, setSchoolId, schoolOptions, selectedSchoolLabel, schoolLocked,
    yearId, setYearId, yearOptions, yearsQuery,
    setId, setSetId, setOptions, setsQuery, setsFilteredByYear,
    draftVersionId, classSectionOptions, periods,
  } = scope

  const [selectedSections, setSelectedSections] = useState([])
  const [prompt, setPrompt] = useState('')
  const [preview, setPreview] = useState(null)
  const [constraints, setConstraints] = useState(null)
  const [viewMode, setViewMode] = useState('class')

  const generateMut = useMutation({
    mutationFn: (data) => timetableService.aiGenerate(data),
    onSuccess: (res) => {
      const data = unwrapTimetablePayload(res)
      if (data.status === 'existing_found') {
        toast.error('Existing timetable found — confirm overwrite to regenerate')
        setPreview({ ...data, needsConfirm: true })
        return
      }
      if (data.status === 'needs_clarification') {
        toast.error((data.clarifications_needed || []).join('; ') || 'More information needed')
        setPreview(data)
        return
      }
      if (data.status === 'infeasible') {
        toast.error('Could not generate a valid timetable')
        setPreview(data)
        return
      }
      setPreview(data)
      setConstraints(data.constraints_used)
      toast.success('Timetable generated — review preview')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const regenerateMut = useMutation({
    mutationFn: () =>
      timetableService.aiRegenerate({
        version_id: draftVersionId,
        class_section_ids: selectedSections,
        constraints,
        ...(schoolId ? { school_id: schoolId } : {}),
      }),
    onSuccess: (res) => {
      setPreview(unwrapTimetablePayload(res))
      toast.success('Alternative timetable generated')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const approveMut = useMutation({
    mutationFn: () =>
      timetableService.aiApprove({
        version_id: draftVersionId,
        class_section_ids: selectedSections,
        assignments: preview?.assignments || [],
        replace_existing: true,
        ...(schoolId ? { school_id: schoolId } : {}),
      }),
    onSuccess: () => toast.success('Saved to draft — review and publish in Manual Creator'),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const toggleSection = (id) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const previewSlots = useMemo(() => {
    if (!preview?.assignments) return []
    return preview.assignments.map((a, i) => ({
      id: `preview-${i}`,
      weekday: a.weekday,
      period_number: a.period_number,
      subject_name: a.subject_name,
      teacher_name: a.teacher_name,
      section_name: a.section_label,
      room_name: a.room_id,
      start_time: a.start_time,
      end_time: a.end_time,
    }))
  }, [preview])

  const summary = preview?.summary || {}

  return (
    <TimetablePageShell
      title="AI Timetable Generator"
      description="Describe requirements in natural language — AI extracts constraints, OR-Tools builds the schedule"
      actions={
        <Link to="/timetable/manual">
          <Button variant="secondary"><FiLayers className="h-4 w-4" /> Manual Creator</Button>
        </Link>
      }
    >
      <MappingFormCard title="Setup" description="School, year, timetable set, and target classes">
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
              value={yearId}
              onChange={(e) => setYearId(e.target.value)}
              options={yearOptions}
              placeholder={yearsQuery.isLoading ? 'Loading...' : 'Select year...'}
              disabled={yearsQuery.isLoading || !schoolId}
            />
          </div>
          <div className={MAPPING_COLUMN_STACK}>
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
            {draftVersionId ? (
              <TimetableStatusBadge label="Draft ready for generation" variant="warning" />
            ) : null}
          </div>
        </div>
      </MappingFormCard>

      <MappingFormCard
        title="Requirements"
        description="Select classes and describe scheduling rules in plain language"
        footer={
          <Button
            variant="primary"
            disabled={!draftVersionId || !selectedSections.length || generateMut.isPending}
            loading={generateMut.isPending}
            onClick={() =>
              generateMut.mutate({
                version_id: draftVersionId,
                class_section_ids: selectedSections,
                prompt,
                confirm_overwrite: preview?.needsConfirm || false,
                ...(schoolId ? { school_id: schoolId } : {}),
              })
            }
          >
            <FiCpu className="h-4 w-4" /> Generate timetable
          </Button>
        }
      >
        <div>
          <p className="mb-3 text-sm font-medium text-text">Classes / sections</p>
          <div className="flex flex-wrap gap-2">
            {classSectionOptions.map((opt) => (
              <TimetableSectionChip
                key={opt.value}
                label={opt.label}
                selected={selectedSections.includes(opt.value)}
                onClick={() => toggleSection(opt.value)}
              />
            ))}
            {!classSectionOptions.length ? (
              <p className="text-sm text-muted">Select academic year to load classes.</p>
            ) : null}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text">Additional requirements</label>
          <textarea
            className="min-h-[140px] w-full rounded-xl border border-border bg-card p-4 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Example: Mathematics 5 periods/week. Mr Ravi unavailable Wednesday. Keep PE in periods 6 or 7..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
      </MappingFormCard>

      {preview?.status === 'infeasible' ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="flex items-center gap-2 font-semibold text-amber-900">
            <FiAlertTriangle className="h-5 w-5" /> Unable to generate a valid timetable
          </h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-800">
            {(preview.infeasibility_reasons || []).map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      ) : null}

      {preview?.status === 'preview' ? (
        <>
          <TimetableStatsRow
            stats={{
              timetable_sets: summary.total_assignments,
              published_versions: `${summary.quality_score ?? 0}%`,
              draft_versions: summary.warnings ?? 0,
              open_conflicts: summary.hard_conflicts ?? 0,
            }}
          />

          {preview.explanation ? (
            <p className="rounded-2xl border border-border bg-muted/20 px-5 py-4 text-sm text-muted">
              {preview.explanation}
            </p>
          ) : null}

          <TimetableGridSection
            title="Generated preview"
            subtitle="Review before saving to draft"
            actions={
              <>
                <Button variant={viewMode === 'class' ? 'primary' : 'secondary'} onClick={() => setViewMode('class')}>
                  Class view
                </Button>
                <Button variant={viewMode === 'teacher' ? 'primary' : 'secondary'} onClick={() => setViewMode('teacher')}>
                  Teacher view
                </Button>
                <Button variant="secondary" disabled={regenerateMut.isPending} onClick={() => regenerateMut.mutate()}>
                  <FiRefreshCw className="h-4 w-4" /> Regenerate
                </Button>
                <Button
                  variant="primary"
                  disabled={approveMut.isPending || summary.hard_conflicts > 0}
                  loading={approveMut.isPending}
                  onClick={() => approveMut.mutate()}
                >
                  <FiCheck className="h-4 w-4" /> Save to draft
                </Button>
              </>
            }
          >
            <TimetableWeekGrid slots={previewSlots} periods={periods} mode={viewMode} />
          </TimetableGridSection>
        </>
      ) : !preview ? (
        <TimetableEmptyState
          icon={FiCpu}
          title="No generation yet"
          description="Select classes, describe your requirements, and click Generate timetable to preview the AI-built schedule."
        />
      ) : null}
    </TimetablePageShell>
  )
}
