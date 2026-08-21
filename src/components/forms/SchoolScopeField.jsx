import { SelectField } from '@/components/ui/Input'

/**
 * School selector for school-scoped setup pages.
 * School admins see a read-only label (their school); org/super admins get a dropdown.
 */
export default function SchoolScopeField({
  schoolId,
  setSchoolId,
  schoolOptions,
  selectedSchoolLabel,
  schoolLocked = false,
  className,
}) {
  if (schoolLocked && selectedSchoolLabel) {
    return (
      <div className={className}>
        <p className="block text-sm font-medium text-black">School</p>
        <p className="mt-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-medium text-black">
          {selectedSchoolLabel}
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <SelectField
        label="School"
        required
        value={schoolId}
        onChange={(e) => setSchoolId(e.target.value)}
        options={schoolOptions}
        placeholder="Select school..."
      />
    </div>
  )
}
