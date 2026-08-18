import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiPlus } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { timetableService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { unwrapTimetablePayload } from '@/utils/timetableGrid'

/**
 * Inline form to create a timetable set + draft v1 without leaving Manual/AI pages.
 */
export default function CreateTimetableSetPanel({
  schoolId,
  yearId,
  yearOptions = [],
  defaultOpen = false,
  onCreated,
  className,
}) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(defaultOpen)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [createYearId, setCreateYearId] = useState(yearId || '')

  useEffect(() => {
    if (yearId) setCreateYearId(yearId)
  }, [yearId])

  useEffect(() => {
    setOpen(defaultOpen)
  }, [defaultOpen])

  const createMut = useMutation({
    mutationFn: () =>
      timetableService.create({
        name: name.trim(),
        code: code.trim(),
        academic_year_id: createYearId,
        ...(schoolId ? { school_id: schoolId } : {}),
      }),
    onSuccess: (res) => {
      const data = unwrapTimetablePayload(res)
      const setId = data.timetable_set?.id
      toast.success('Timetable set created (draft v1)')
      setName('')
      setCode('')
      setOpen(false)
      qc.invalidateQueries({ queryKey: ['timetable-sets-scope'] })
      qc.invalidateQueries({ queryKey: ['timetable-sets'] })
      qc.invalidateQueries({ queryKey: ['timetable-set-detail'] })
      qc.invalidateQueries({ queryKey: ['timetable-dashboard'] })
      if (setId) onCreated?.(String(setId))
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (!open) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-50"
        onClick={() => setOpen(true)}
        disabled={!schoolId}
      >
        <FiPlus className="h-4 w-4" /> New timetable set
      </button>
    )
  }

  return (
    <div className={`space-y-3 rounded-xl border border-primary/20 bg-primary/[0.04] p-4 ${className || ''}`}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-text">Create timetable set</h4>
        <button
          type="button"
          className="text-xs text-muted hover:text-text"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
      <SelectField
        label="Academic year"
        required
        value={createYearId}
        onChange={(e) => setCreateYearId(e.target.value)}
        options={yearOptions}
        placeholder="Select year..."
        disabled={!yearOptions.length}
      />
      <Input
        label="Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Grade 8 — Term 1"
      />
      <Input
        label="Code"
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="G8-T1"
      />
      <p className="text-xs text-muted">
        Creates a draft version you can edit in Manual Creator or generate with AI.
      </p>
      <Button
        variant="primary"
        disabled={!schoolId || !createYearId || !name.trim() || !code.trim() || createMut.isPending}
        onClick={() => createMut.mutate()}
      >
        Create draft
      </Button>
    </div>
  )
}

/** Label row with optional inline create trigger beside timetable set dropdown. */
export function TimetableSetFieldWithCreate({
  schoolId,
  yearId,
  yearOptions,
  setId,
  setSetId,
  setOptions,
  setsQuery,
  setsFilteredByYear,
  showCreateWhenEmpty = true,
}) {
  const noSets = !setsQuery.isLoading && setOptions.length === 0 && Boolean(schoolId)

  return (
    <div className="space-y-2">
      <SelectField
        label="Timetable set"
        required
        value={setId}
        onChange={(e) => setSetId(e.target.value)}
        options={setOptions}
        placeholder={
          setsQuery.isLoading
            ? 'Loading sets...'
            : setOptions.length
              ? 'Select timetable set...'
              : !schoolId
                ? 'Select school first'
                : 'No timetable sets yet'
        }
        disabled={setsQuery.isLoading || !schoolId}
      />
      {!setsFilteredByYear && setOptions.length ? (
        <p className="text-xs text-amber-700">
          No sets for this year — showing all sets for the school.
        </p>
      ) : null}
      {(showCreateWhenEmpty && noSets) || schoolId ? (
        <CreateTimetableSetPanel
          schoolId={schoolId}
          yearId={yearId}
          yearOptions={yearOptions}
          defaultOpen={noSets}
          onCreated={setSetId}
        />
      ) : null}
    </div>
  )
}
