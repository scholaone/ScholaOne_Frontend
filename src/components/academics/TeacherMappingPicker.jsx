import { SelectField } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

/** Three equal columns on md+ (Bootstrap col-md-4 style) */
export const MAPPING_COLUMNS_GRID = 'grid grid-cols-1 gap-4 md:grid-cols-3'
export const MAPPING_COLUMN_STACK = 'space-y-4'

/** @deprecated use MAPPING_COLUMNS_GRID + MAPPING_COLUMN_STACK */
export const MAPPING_FORM_GRID = 'grid grid-cols-12 gap-4'
export const MAPPING_FIELD_COL = 'col-span-12 md:col-span-4'
export const MAPPING_FIELD_WIDTH = MAPPING_FIELD_COL

export function MappingModeHeader({
  mode,
  onChange,
  label = 'Class mapping mode',
  showLabel = false,
  alignWithField = true,
  singleLabel,
  multipleLabel,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-start gap-2', className)}>
      {(showLabel && label) || alignWithField ? (
        <span
          className={cn(
            'block text-sm font-medium text-text',
            !showLabel && 'invisible select-none',
          )}
          aria-hidden={!showLabel}
        >
          {label}
        </span>
      ) : null}
      <MappingModeToggle
        mode={mode}
        onChange={onChange}
        singleLabel={singleLabel}
        multipleLabel={multipleLabel}
      />
    </div>
  )
}

export function MappingModeToggle({
  mode,
  onChange,
  singleLabel = 'One',
  multipleLabel = 'Multiple',
  className,
}) {
  return (
    <div
      className={cn(
        'inline-flex rounded-xl border border-border bg-muted/30 p-1',
        className,
      )}
      role="tablist"
      aria-label="Class mapping mode"
    >
      {[
        { key: 'single', label: singleLabel },
        { key: 'multiple', label: multipleLabel },
      ].map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={mode === key}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition',
            mode === key
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted hover:text-text',
          )}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function ClassMappingPicker({
  mode,
  onModeChange,
  classOptions,
  singleClassId,
  onSingleClassChange,
  selectedClassIds,
  onSelectedClassIdsChange,
  loading = false,
  disabled = false,
  hideModeToggle = false,
  multipleOnly = false,
  itemLabel = 'Class',
  itemLabelPlural = 'Classes',
  emptyMessage = 'No active classes for this year',
  selectionHint,
}) {
  const toggleClass = (classId) => {
    onSelectedClassIdsChange(
      selectedClassIds.includes(classId)
        ? selectedClassIds.filter((id) => id !== classId)
        : [...selectedClassIds, classId],
    )
  }

  if (multipleOnly || mode === 'multiple') {
    return (
      <div className="space-y-2">
        {!hideModeToggle ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-medium text-text">
              {itemLabelPlural} <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <MappingModeToggle mode={mode} onChange={onModeChange} />
          </div>
        ) : (
          <label className="text-sm font-medium text-text">
            {itemLabelPlural} <span className="text-danger" aria-hidden="true">*</span>
          </label>
        )}
        <div className="max-h-56 max-w-2xl overflow-y-auto rounded-xl border border-border bg-background">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted">Loading {itemLabelPlural.toLowerCase()}...</p>
          ) : classOptions.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">{emptyMessage}</p>
          ) : (
            <ul className="divide-y divide-border">
              {classOptions.map((option) => (
                <li key={option.value}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition hover:bg-muted/30">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-primary"
                      checked={selectedClassIds.includes(option.value)}
                      disabled={disabled}
                      onChange={() => toggleClass(option.value)}
                    />
                    <span className="font-medium text-text">{option.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-xs text-muted">
          {selectedClassIds.length
            ? `${selectedClassIds.length} ${itemLabelPlural.toLowerCase()} selected`
            : selectionHint || `Tick every ${itemLabel.toLowerCase()} you want to include.`}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      {!hideModeToggle ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-medium text-text">
            {itemLabel} <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <MappingModeToggle mode={mode} onChange={onModeChange} />
        </div>
      ) : null}

      <SelectField
        label={hideModeToggle ? itemLabel : undefined}
        required
        aria-label={itemLabel}
        value={singleClassId}
        onChange={(e) => onSingleClassChange(e.target.value)}
        options={classOptions}
        placeholder={
          loading
            ? `Loading ${itemLabelPlural.toLowerCase()}...`
            : classOptions.length
              ? `Choose a ${itemLabel.toLowerCase()}...`
              : emptyMessage
        }
        disabled={disabled || loading}
      />
    </div>
  )
}

export function resolveIdsForMapping(mode, singleId, selectedIds) {
  if (mode === 'multiple') return selectedIds
  return singleId ? [singleId] : []
}

export function SubjectMappingPicker({
  mode,
  onModeChange,
  subjectOptions,
  singleSubjectId,
  onSingleSubjectChange,
  selectedSubjectIds,
  onSelectedSubjectIdsChange,
  loading = false,
  disabled = false,
  hideModeToggle = false,
  multipleOnly = false,
}) {
  const toggleSubject = (subjectId) => {
    onSelectedSubjectIdsChange(
      selectedSubjectIds.includes(subjectId)
        ? selectedSubjectIds.filter((id) => id !== subjectId)
        : [...selectedSubjectIds, subjectId],
    )
  }

  if (multipleOnly || mode === 'multiple') {
    return (
      <div className="space-y-2">
        {!hideModeToggle ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-medium text-text">
              Subjects <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <MappingModeToggle
              mode={mode}
              onChange={onModeChange}
              singleLabel="One"
              multipleLabel="Multiple"
            />
          </div>
        ) : (
          <label className="text-sm font-medium text-text">
            Subjects <span className="text-danger" aria-hidden="true">*</span>
          </label>
        )}
        <div className="max-h-56 max-w-2xl overflow-y-auto rounded-xl border border-border bg-background">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted">Loading subjects...</p>
          ) : subjectOptions.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">No subjects in catalog for this school</p>
          ) : (
            <ul className="divide-y divide-border">
              {subjectOptions.map((option) => (
                <li key={option.value}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition hover:bg-muted/30">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-primary"
                      checked={selectedSubjectIds.includes(option.value)}
                      disabled={disabled}
                      onChange={() => toggleSubject(option.value)}
                    />
                    <span className="font-medium text-text">{option.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-xs text-muted">
          {selectedSubjectIds.length
            ? `${selectedSubjectIds.length} subject(s) selected`
            : 'Tick every subject to allocate to the selected class(es).'}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      {!hideModeToggle ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-medium text-text">
            Subject <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <MappingModeToggle
            mode={mode}
            onChange={onModeChange}
            singleLabel="One"
            multipleLabel="Multiple"
          />
        </div>
      ) : null}

      <SelectField
        label={hideModeToggle ? 'Subject' : undefined}
        required
        aria-label="Subject"
        value={singleSubjectId}
        onChange={(e) => onSingleSubjectChange(e.target.value)}
        options={subjectOptions}
        placeholder={
          loading
            ? 'Loading subjects...'
            : subjectOptions.length
              ? 'Choose a subject...'
              : 'No subjects for this school'
        }
        disabled={disabled || loading}
      />
    </div>
  )
}

export function resolveSubjectIdsForMapping(mode, singleId, selectedIds) {
  return resolveIdsForMapping(mode, singleId, selectedIds)
}

/** Existing class-section IDs mapped to a teacher (for multi-select prefill). */
export function getMappedClassIdsForTeacher(mappings, teacherUserId, classOptions = []) {
  if (!teacherUserId) return []

  const validClassIds = classOptions.length
    ? new Set(classOptions.map((option) => option.value))
    : null

  const ids = [
    ...new Set(
      (mappings || [])
        .filter((row) => String(row.teacher_id || row.teacher || '') === String(teacherUserId))
        .filter((row) => row.is_active !== false)
        .map((row) => String(row.class_section))
        .filter(Boolean),
    ),
  ]

  if (!validClassIds) return ids
  return ids.filter((id) => validClassIds.has(id))
}

/** @deprecated */
export function TeacherMappingPicker() {
  return null
}

/** @deprecated */
export function resolveTeacherIdsForMapping(mode, singleTeacherId, selectedTeacherIds) {
  return resolveIdsForMapping(mode, singleTeacherId, selectedTeacherIds)
}

/** @deprecated */
export function TeacherMappingModeToggle(props) {
  return <MappingModeToggle {...props} />
}
