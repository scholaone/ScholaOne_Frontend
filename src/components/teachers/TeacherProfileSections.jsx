import { Card } from '@/components/ui/Card'
import { formatExperiencePeriod, formatTotalExperienceYears } from '@/utils/teacherExperience'

export function TeacherProfileField({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text">{value || '—'}</dd>
    </div>
  )
}

function TeacherListSection({ title, description, emptyMessage, items, renderItem }) {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-base font-bold text-text">{title}</h3>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
      {items?.length ? (
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id || item.qualification_id || item.experience_id || item.assignment_id} className="rounded-lg border px-3 py-2">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{emptyMessage}</p>
      )}
    </Card>
  )
}

export function TeacherProfileDetailsGrid({ teacher }) {
  if (!teacher) return null

  const languages = Array.isArray(teacher.languages_known)
    ? teacher.languages_known.join(', ')
    : teacher.languages_known

  return (
    <Card>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TeacherProfileField label="Status" value={teacher.status_display || teacher.status} />
        <TeacherProfileField label="Employee ID" value={teacher.employee_id} />
        <TeacherProfileField label="Teacher Code" value={teacher.teacher_code} />
        <TeacherProfileField label="Academic Role" value={teacher.academic_role_display || teacher.academic_role} />
        <TeacherProfileField label="Designation" value={teacher.designation} />
        <TeacherProfileField label="Department" value={teacher.department} />
        <TeacherProfileField label="School" value={teacher.school_name} />
        <TeacherProfileField label="Username" value={teacher.username} />
        <TeacherProfileField label="Email" value={teacher.email} />
        <TeacherProfileField label="Mobile" value={teacher.mobile_number} />
        <TeacherProfileField label="Specialization" value={teacher.specialization} />
        <TeacherProfileField label="Qualification" value={teacher.qualification_summary} />
        <TeacherProfileField
          label="Experience (Years)"
          value={
            teacher.total_experience_years != null
              ? `${formatTotalExperienceYears(teacher.total_experience_years)} years (calculated)`
              : ''
          }
        />
        <TeacherProfileField label="Joining Date" value={teacher.joining_date} />
        <TeacherProfileField label="Confirmation Date" value={teacher.confirmation_date} />
        <TeacherProfileField label="Date of Birth" value={teacher.date_of_birth} />
        <TeacherProfileField label="Gender" value={teacher.gender} />
        <TeacherProfileField label="Blood Group" value={teacher.blood_group} />
        <TeacherProfileField label="Nationality" value={teacher.nationality} />
        <TeacherProfileField label="Languages" value={languages} />
        <TeacherProfileField label="Address" value={teacher.address} />
        <TeacherProfileField label="City" value={teacher.city} />
        <TeacherProfileField label="State" value={teacher.state} />
        <TeacherProfileField label="Portal Access" value={teacher.portal_access ? 'Yes' : 'No'} />
        <TeacherProfileField label="Mobile App" value={teacher.mobile_app_access ? 'Yes' : 'No'} />
        <TeacherProfileField label="Bio" value={teacher.bio} />
        <TeacherProfileField
          label="Emergency Contact"
          value={[teacher.emergency_contact_name, teacher.emergency_contact_phone].filter(Boolean).join(' · ')}
        />
      </dl>
    </Card>
  )
}

export function TeacherProfileReadOnlySections({ teacher }) {
  if (!teacher) return null

  return (
    <div className="space-y-6">
      <TeacherProfileDetailsGrid teacher={teacher} />

      <TeacherListSection
        title="Qualifications"
        description="Academic and professional qualifications on record."
        emptyMessage="No qualifications recorded yet."
        items={teacher.qualifications}
        renderItem={(q) => (
          <>
            {q.degree} — {q.institution}
            {q.year_completed ? ` (${q.year_completed})` : ''}
          </>
        )}
      />

      <TeacherListSection
        title="Experience"
        description="Previous teaching and work experience."
        emptyMessage="No experience records yet."
        items={teacher.experiences}
        renderItem={(e) => (
          <>
            <strong>{e.organization_name}</strong>
            {e.role ? ` — ${e.role}` : ''}
            <span className="tp-list-meta">{formatExperiencePeriod(e)}{e.is_current ? ' · Current' : ''}</span>
            {e.description ? <span className="tp-list-meta">{e.description}</span> : null}
          </>
        )}
      />

      <TeacherListSection
        title="Subject Assignments"
        description="Subjects and classes assigned to you."
        emptyMessage="No subject assignments yet."
        items={teacher.subject_assignments}
        renderItem={(s) => (
          <>
            {[s.subject_name, s.class_name, s.section_name].filter(Boolean).join(' · ') || '—'}
            {s.academic_year ? ` (${s.academic_year})` : ''}
          </>
        )}
      />

      <TeacherListSection
        title="Class Teacher"
        description="Classes where you are assigned as class teacher."
        emptyMessage="Not assigned as class teacher."
        items={teacher.class_teacher_mappings}
        renderItem={(m) => (
          <>
            {[m.class_name, m.section_name].filter(Boolean).join(' ')}
            {m.academic_year ? ` (${m.academic_year})` : ''}
          </>
        )}
      />

      <TeacherListSection
        title="Academic Assignments"
        description="Other academic duties such as mentoring, exam duty, or coordination roles."
        emptyMessage="No academic assignments yet."
        items={teacher.academic_assignments}
        renderItem={(a) => (
          <>
            {a.assignment_type} — {a.subject_name || a.title || a.class_section_name || '—'}
            {a.periods_per_week ? ` · ${a.periods_per_week} periods` : ''}
          </>
        )}
      />
    </div>
  )
}
