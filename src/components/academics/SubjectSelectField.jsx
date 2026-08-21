import { Link } from 'react-router-dom'
import { SelectField } from '@/components/ui/Input'
import { useSubjectOptions } from '@/hooks/useSubjectOptions'

/**
 * Subject dropdown backed by class allocations or master catalog.
 */
export default function SubjectSelectField({
  label = 'Subject',
  required = false,
  value,
  onChange,
  schoolId,
  academicYearId,
  classSectionId,
  classSectionIds,
  source = 'allocated',
  disabled = false,
  showAllocationHint = true,
  className,
}) {
  const {
    subjectOptions,
    hasAllocations,
    isLoading,
    placeholder,
  } = useSubjectOptions({
    schoolId,
    academicYearId,
    classSectionId,
    classSectionIds,
    source,
    enabled: Boolean(schoolId),
  })

  return (
    <div className={className}>
      <SelectField
        label={label}
        required={required}
        value={value}
        onChange={onChange}
        options={subjectOptions}
        placeholder={placeholder}
        disabled={disabled || isLoading || !subjectOptions.length}
      />
      {showAllocationHint && source === 'allocated' && !isLoading && !hasAllocations && schoolId && academicYearId && classSectionId ? (
        <p className="mt-2 text-xs text-amber-800">
          No subjects allocated for this class.{' '}
          <Link to="/academics/subject-allocation" className="font-semibold underline">
            Add subject allocation
          </Link>
          {' '}or{' '}
          <Link to="/school-masters/subjects" className="font-semibold underline">
            add subjects
          </Link>
          .
        </p>
      ) : null}
    </div>
  )
}
